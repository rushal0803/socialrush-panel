"""Runs INSIDE the network-none namespace, using only standard-library HTTP.
Auth tokens are obtained from real GoTrue password login, never manufactured
customer JWTs. Only the ephemeral service-role bootstrap token is locally signed.
"""
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import hmac
import json
import os
from pathlib import Path
import socket
import time
import urllib.error
import urllib.request
import uuid

SECRET = os.environ['FIXTURE_JWT_SECRET']
MODE = os.environ['FIXTURE_MODE']
HTTP = urllib.request.build_opener(urllib.request.ProxyHandler({}))
checks = []


def check(value, label):
    if not value:
        raise AssertionError(label)
    checks.append(label)


def request(port, path, token=None, body=None, method=None):
    headers = {'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(f'http://127.0.0.1:{port}{path}',
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers=headers, method=method)
    try:
        with HTTP.open(req, timeout=12) as response:
            raw = response.read()
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        raw = error.read()
        return error.code, json.loads(raw) if raw else None


def ready(port, path):
    for _ in range(60):
        try:
            if request(port, path)[0] == 200:
                return
        except OSError:
            pass
        time.sleep(1)
    raise AssertionError('loopback service readiness')


def isolation():
    check([name for _, name in socket.if_nameindex()] == ['lo'], 'only loopback interface')
    routes = Path('/proc/net/route').read_text().strip().splitlines()[1:]
    check(not routes, 'no IPv4 routes')
    for route in Path('/proc/net/ipv6_route').read_text().splitlines():
        check(route.split()[-1] == 'lo', 'no IPv6 external interface')
    for family, address in [(socket.AF_INET, ('192.0.2.1', 443)),
                            (socket.AF_INET6, ('2001:db8::1', 443, 0, 0))]:
        with socket.socket(family, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            try:
                sock.connect(address)
            except OSError as error:
                check(error.errno in (101, 99, 97), 'reserved-address egress rejected locally')
            else:
                raise AssertionError('unexpected external network route')
    print(json.dumps({'isolation': 'PASS', 'checks': checks}))


def service_token():
    def b64(data):
        return base64.urlsafe_b64encode(data).decode().rstrip('=')
    msg = b64(b'{"alg":"HS256","typ":"JWT"}') + '.' + b64(json.dumps({
        'role': 'service_role', 'iss': 'supabase', 'exp': int(time.time()) + 3600}).encode())
    return msg + '.' + b64(hmac.new(SECRET.encode(), msg.encode(), hashlib.sha256).digest())


def integration():
    ready(3000, '/')
    service = service_token()
    users, tokens = [], []
    password = uuid.uuid4().hex + '!aA1'
    for alias in ['admin', 'customer-a', 'customer-b']:
        email = alias + '@example.invalid'
        status, data = request(9999, '/admin/users', service,
                               {'email': email, 'password': password, 'email_confirm': True})
        check(status in (200, 201), 'Auth creates synthetic ' + alias)
        users.append(data['id'])
        status, data = request(9999, '/token?grant_type=password', body={'email': email, 'password': password})
        check(status == 200 and bool(data.get('access_token')), 'real Auth password login ' + alias)
        tokens.append(data['access_token'])
    admin, a, b = tokens
    for i, uid in enumerate(users):
        status, _ = request(3000, '/profiles?id=eq.' + uid, service,
                            {'role': 'admin' if i == 0 else 'user', 'balance': 100 if i == 1 else 0}, 'PATCH')
        check(status == 200, 'seed controlled persisted profile ' + str(i))
    status, rows = request(3000, '/profiles?select=id,balance', a)
    check(status == 200 and [r['id'] for r in rows] == [users[1]], 'A sees only own profile through RLS')
    status, rows = request(3000, '/profiles?id=eq.' + users[1], b)
    check(status == 200 and rows == [], 'B cannot read A profile by ID')
    status, rows = request(3000, '/profiles?id=eq.' + users[1], b, {'balance': 999}, 'PATCH')
    check(status in (200, 204, 401, 403) and not rows, 'B cannot mutate A balance')
    status, rows = request(3000, '/profiles?select=id', admin)
    check(status == 200 and len(rows) == 3, 'persisted admin role sees profiles')
    status, rows = request(3000, '/profiles')
    check(status in (401, 403) or (status == 200 and rows == []), 'anonymous cannot read customer profiles')
    check(request(3000, '/rpc/admin_revenue_report', a, {'p_since': '2026-01-01', 'p_until': '2026-12-31'})[0] >= 400,
          'customer revenue RPC denied')
    sid = request(3000, '/services?code=eq.offline-integration&select=id', service)[1][0]['id']

    def wallet(reqid=None, link='https://example.invalid/synthetic'):
        return request(3000, '/rpc/checkout_campaign_with_wallet', a, {
            'p_service_id': sid, 'p_service_code': 'offline-integration',
            'p_link': link, 'p_quantity': 100,
            'p_request_id': reqid or str(uuid.uuid4())})

    rid = str(uuid.uuid4())
    with ThreadPoolExecutor(4) as pool:
        results = list(pool.map(lambda _: wallet(rid), range(4)))
    check(all(s == 200 for s, _ in results), 'concurrent same-request wallet calls succeed idempotently')
    check(len({r['id'] for _, r in results}) == 1, 'same request creates one order')
    oid = results[0][1]['id']
    balance = lambda: float(request(3000, '/profiles?id=eq.' + users[1] + '&select=balance', a)[1][0]['balance'])
    check(balance() == 50, 'wallet debited exactly once')
    with ThreadPoolExecutor(3) as pool:
        results = list(pool.map(lambda _: wallet(), range(3)))
    check(sum(s == 200 for s, _ in results) == 1 and balance() == 0, 'independent concurrent purchases cannot double-spend')
    check(wallet()[0] >= 400 and balance() == 0, 'insufficient balance no effects')
    status, rows = request(3000, '/orders?id=eq.' + oid, b)
    check(status == 200 and rows == [], 'B cannot read A order')

    patch = {'p_order_id': oid, 'p_patch': {'status': 'cancelled'}}
    check(request(3000, '/rpc/admin_update_order_financial', a, patch)[0] >= 400, 'customer cannot refund own order')
    check(request(3000, '/rpc/admin_update_order_financial', None, patch)[0] >= 400, 'anonymous refund denied')
    with ThreadPoolExecutor(4) as pool:
        results = list(pool.map(lambda _: request(3000, '/rpc/admin_update_order_financial', admin, patch), range(4)))
    check(all(s == 200 for s, _ in results) and balance() == 50, 'real admin concurrent refund credits exactly once')
    before_orders = request(3000, '/orders?select=id', a)[1]
    before_ledger = request(3000, '/transactions?select=id', a)[1]
    check(wallet(link='https://example.invalid/rollback')[0] >= 400, 'injected post-deduction order failure returned')
    check(balance() == 50 and request(3000, '/orders?select=id', a)[1] == before_orders
          and request(3000, '/transactions?select=id', a)[1] == before_ledger,
          'failed order insert rolls back deduction, order and ledger')

    for method in ['manual_upi', 'manual_bank_transfer', 'manual_usdt_trc20']:
        ref = 'SYNTHETIC-' + uuid.uuid4().hex
        status, rows = request(3000, '/transactions', service, {'user_id': users[1], 'amount': 20,
            'type': 'credit', 'status': 'pending', 'payment_method': method, 'provider_payment_id': ref})
        check(status == 201, method + ' synthetic pending receipt')
        tx = rows[0]['id']
        args = {'p_transaction_id': tx, 'p_decision': 'approve', 'p_verified_transaction_id': ref,
                'p_evidence': 'Synthetic receipt reviewed in isolated test only'}
        check(request(3000, '/rpc/admin_review_manual_wallet_payment', a, args)[0] >= 400,
              method + ' customer approval denied')
        check(request(3000, '/rpc/admin_review_manual_wallet_payment', admin, args)[0] >= 400,
              method + ' browser admin cannot bypass server-only reviewer')
        with ThreadPoolExecutor(4) as pool:
            results = list(pool.map(lambda _: request(3000, '/rpc/admin_review_manual_wallet_payment', service, args), range(4)))
        check(sum(s in (200, 204) for s, _ in results) == 1, method + ' one service-role review credit')
        status, _ = request(3000, '/transactions', service, {'user_id': users[2], 'amount': 20,
            'type': 'credit', 'status': 'pending', 'payment_method': method, 'provider_payment_id': ref.lower()})
        check(status >= 400, method + ' cross-customer case-normalized duplicate denied')
    check(balance() == 110, 'final wallet invariant after three manual credits')

    # Real owner JWT submits each active manual split receipt via PostgREST.
    for method in ['upi', 'bank_transfer', 'usdt_trc20']:
        rid = str(uuid.uuid4())
        intent = {'user_id': users[1], 'client_request_id': rid, 'service_id': sid,
                  'service_code': 'offline-integration', 'quantity': 100,
                  'destination_link': 'https://example.invalid/manual', 'total_paise': 15000}
        check(request(3000, '/checkout_intents', a, intent)[0] >= 400,
              method + ' customer cannot create trusted quote')
        status, rows = request(3000, '/checkout_intents', service, intent)
        check(status == 201, method + ' server creates synthetic trusted intent')
        iid = rows[0]['id']
        args = {'p_intent_id': iid, 'p_client_request_id': rid, 'p_expected_wallet': 110,
                'p_utr': 'OFFLINE-' + uuid.uuid4().hex,
                'p_payment_reference': 'SR-' + uuid.uuid4().hex.upper(), 'p_payment_method': method}
        check(request(3000, '/rpc/submit_manual_checkout_atomic', b, args)[0] >= 400,
              method + ' B cannot submit A intent')
        with ThreadPoolExecutor(3) as pool:
            results = list(pool.map(lambda _: request(3000, '/rpc/submit_manual_checkout_atomic', a, args), range(3)))
        check(all(s == 200 for s, _ in results), method + ' concurrent manual submission idempotent')
        orders = {data['order']['id'] for _, data in results}
        check(len(orders) == 1 and balance() == 0 and all(data['remaining'] == 40 for _, data in results),
              method + ' one pending order and one exact split debit')
        oid = next(iter(orders))
        patch = {'p_order_id': oid, 'p_patch': {'status': 'cancelled'}}
        check(request(3000, '/rpc/admin_update_order_financial', admin, patch)[0] == 200 and balance() == 110,
              method + ' rejection refunds only debited wallet, not unpaid external amount')
    status, revenue = request(3000, '/rpc/admin_revenue_report', admin,
                              {'p_since': '2026-01-01', 'p_until': '2026-12-31'})
    check(status == 200 and isinstance(revenue, dict), 'admin revenue RPC succeeds with Auth JWT')
    check(float(revenue['gross']) == 0 and float(revenue['net']) == 0,
          'manual deposits and unrecognized/cancelled orders are not earned revenue')
    print(json.dumps({'result': 'PASS', 'checks': checks,
                      'limitations': ['No Next.js session/server-action/browser QA',
                                      'No real receipt/transfer, FX provider or supplier',
                                      'SQL fixtures do not certify hosted Supabase configuration']}))


if MODE == 'isolation':
    isolation()
elif MODE == 'auth-ready':
    ready(9999, '/health')
else:
    integration()
