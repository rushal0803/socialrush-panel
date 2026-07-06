import { adjustBalance, changeUserRole, setUserBlocked } from "@/app/admin/actions";
import {
  AdminPageHeader,
  AdminStatus,
  inputClass,
  primaryButton,
} from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

const money = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  balance: number | string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  orders: unknown;
};

function orderCount(user: UserRow) {
  const orders = user.orders as { count: number }[] | null;
  return orders?.[0]?.count ?? 0;
}

function UserActions({ user, compact = false }: { user: UserRow; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-4" : ""}`}>
      <details className="relative">
        <summary className="cursor-pointer list-none rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-2.5 text-[10px] font-bold text-orange-300">
          Adjust balance
        </summary>
        <form
          action={adjustBalance}
          className="absolute right-0 z-20 mt-2 w-[min(17rem,calc(100vw-3rem))] rounded-2xl border border-orange-400/30 bg-[#111111] p-4 shadow-2xl"
        >
          <input type="hidden" name="user_id" value={user.id} />
          <label className="text-[10px] font-semibold">
            Amount
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              className={inputClass}
            />
          </label>
          <select name="operation" className={`${inputClass} mt-3`}>
            <option value="add">Add balance</option>
            <option value="deduct">Remove balance</option>
          </select>
          <button className={`${primaryButton} mt-3 w-full`}>
            Apply adjustment
          </button>
        </form>
      </details>

      <form action={changeUserRole} className="flex min-w-0 gap-2">
        <input type="hidden" name="user_id" value={user.id} />
        <select
          name="role"
          defaultValue={user.role}
          className="min-h-10 rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-2.5 py-2 text-[10px] text-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-3 py-2 text-[10px] font-bold text-white">
          Save
        </button>
      </form>

      <form action={setUserBlocked}>
        <input type="hidden" name="user_id" value={user.id} />
        <input
          type="hidden"
          name="blocked"
          value={user.is_blocked ? "false" : "true"}
        />
        <button
          className={`min-h-10 rounded-xl border px-3 py-2 text-[10px] font-bold ${
            user.is_blocked
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-400/30 bg-red-500/10 text-red-300"
          }`}
        >
          {user.is_blocked ? "Unblock" : "Block"}
        </button>
      </form>
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const supabase = await createClient();
  const search = String(searchParams?.q || "").trim().slice(0, 100);
  const safeSearch = search.replace(/[^\p{L}\p{N}@._+\-\s]/gu, "");
  let query = supabase
    .from("profiles")
    .select(
      "id,email,full_name,balance,role,is_blocked,created_at,orders(count)",
    )
    .order("created_at", { ascending: false });

  if (safeSearch) {
    query = query.or(
      `full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`,
    );
  }

  const { data, error } = await query.limit(250);
  const users = (data ?? []) as UserRow[];

  return (
    <main className="mx-auto max-w-[1650px] p-4 sm:p-8">
      <AdminPageHeader
        title="Users"
        description="Search accounts, review wallet balances, manage access, and control administrator roles."
      />

      <form className="mt-6 flex max-w-2xl flex-col gap-3 rounded-2xl border border-orange-400/25 bg-[#111111] p-3 sm:flex-row sm:p-4">
        <input
          name="q"
          defaultValue={search}
          className="min-h-12 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-4 py-3 text-sm text-white outline-none placeholder:text-[#9CA3AF] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
          placeholder="Search by name or email"
        />
        <button className="min-h-12 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F00] px-6 py-3 text-xs font-bold text-white shadow-[0_14px_30px_-18px_rgba(255,122,0,.8)]">
          Search users
        </button>
      </form>

      {error ? (
        <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs leading-5 text-amber-200">
          Apply the latest admin migration before using account blocking.
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 lg:hidden">
        {users.map((user) => (
          <article
            key={user.id}
            className="rounded-2xl border border-orange-400/25 bg-[#111111] p-4 shadow-[0_18px_40px_-28px_rgba(255,122,0,.55)]"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-xs font-black text-white">
                {(user.full_name || user.email).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {user.full_name || "Unnamed user"}
                </p>
                <p className="mt-1 break-all text-xs leading-5 text-[#D1D5DB]">
                  {user.email}
                </p>
              </div>
              <AdminStatus value={user.is_blocked ? "blocked" : "active"} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                ["Joined", new Date(user.created_at).toLocaleDateString("en-IN")],
                ["Orders", orderCount(user).toLocaleString("en-IN")],
                ["Balance", money(user.balance)],
                ["Role", user.role],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-xl border border-white/10 bg-[#0B0B0F] p-3"
                >
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-xs font-bold capitalize text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <UserActions user={user} compact />
          </article>
        ))}
        {!users.length ? (
          <p className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-center text-sm text-[#9CA3AF]">
            No users match this search.
          </p>
        ) : null}
      </section>

      <section className="panel-card mt-6 hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-xs">
            <thead>
              <tr>
                {[
                  "User",
                  "Joined",
                  "Orders",
                  "Balance",
                  "Role",
                  "Status",
                  "Administration",
                ].map((head) => (
                  <th key={head} className="px-5 py-3">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-[10px] font-bold text-white">
                        {(user.full_name || user.email)
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {user.full_name || "Unnamed user"}
                        </p>
                        <p className="mt-1 text-[10px] text-[#9CA3AF]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#D1D5DB]">
                    {new Date(user.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">
                    {orderCount(user)}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    {money(user.balance)}
                  </td>
                  <td className="px-5 py-4">
                    <AdminStatus
                      value={user.role === "admin" ? "admin" : "active"}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <AdminStatus
                      value={user.is_blocked ? "blocked" : "active"}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <UserActions user={user} />
                  </td>
                </tr>
              ))}
              {!users.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-14 text-center text-[#9CA3AF]"
                  >
                    No users match this search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
