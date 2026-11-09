"""Read the supplied Google Search Console ZIPs; emit aggregates without network access."""
import argparse
import csv
import hashlib
import io
import json
import zipfile
from datetime import date
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('performance_zip', type=Path)
parser.add_argument('coverage_zip', type=Path)
args = parser.parse_args()

def rows(archive, filename):
    with zipfile.ZipFile(archive) as stream:
        names = [n for n in stream.namelist() if Path(n).name == filename]
        if len(names) != 1:
            raise ValueError(f'Expected one {filename}, found {len(names)}')
        return list(csv.DictReader(io.StringIO(stream.read(names[0]).decode('utf-8-sig'))))

chart = rows(args.performance_zip, 'Chart.csv')
if len({r['Date'] for r in chart}) != len(chart):
    raise ValueError('Duplicate dates; do not sum ambiguous daily rows')

def aggregate(start, end):
    selected = [r for r in chart if start <= r['Date'] <= end]
    expected = (date.fromisoformat(end) - date.fromisoformat(start)).days + 1
    if len(selected) != expected:
        raise ValueError(f'Incomplete window: {start}–{end}')
    clicks = sum(int(r['Clicks']) for r in selected)
    impressions = sum(int(r['Impressions']) for r in selected)
    return dict(start=start, end=end, days=len(selected), clicks=clicks,
                impressions=impressions, ctr_pct=clicks / impressions * 100 if impressions else None)

current = aggregate('2026-10-11', '2026-11-07')
prior = aggregate('2026-09-13', '2026-10-10')
current['click_change_pct'] = (current['clicks'] / prior['clicks'] - 1) * 100
current['impression_change_pct'] = (current['impressions'] / prior['impressions'] - 1) * 100
coverage = rows(args.coverage_zip, 'Chart.csv')
query_rows = rows(args.performance_zip, 'Queries.csv')
page_rows = rows(args.performance_zip, 'Pages.csv')
print(json.dumps({
    'sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [args.performance_zip, args.coverage_zip]},
    'filters': rows(args.performance_zip, 'Filters.csv'),
    'performance_range': [min(r['Date'] for r in chart), max(r['Date'] for r in chart)],
    'current28': current, 'prior28': prior,
    'query_rows': len(query_rows), 'page_rows': len(page_rows),
    'latest_coverage': max((r for r in coverage if r['Indexed']), key=lambda r: r['Date']),
    'coverage_reasons': rows(args.coverage_zip, 'Critical issues.csv'),
    'limitations': [
        'Query rows may be capped and anonymized; missing rows are not zero demand.',
        'Page and property aggregation can differ; do not sum page rows as property totals.',
        'Coverage totals do not identify affected URLs or Google-selected canonicals.',
        'Report dates and filters are retained; no timezone conversion or causal release claim.'
    ]
}, indent=2))
