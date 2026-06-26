import { createClient } from "@/lib/supabase/server";
import { addService, deleteService, updateService } from "@/app/admin/actions";
import { AdminPageHeader, AdminStatus, Modal, inputClass, primaryButton } from "@/components/admin/AdminUI";

type ServiceRow = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: string;
  rate: number;
  min: number;
  max: number;
  delivery_time: string;
  platform: string | null;
  refill_policy: string;
  is_active: boolean;
  quality_type: string;
  important_instruction: string;
};

function ServiceForm({
  action,
  categories,
  service,
}: {
  action: (data: FormData) => Promise<void>;
  categories: { id: number; name: string }[];
  service?: ServiceRow;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {service && <input type="hidden" name="id" value={service.id} />}

      <label className="text-xs font-semibold sm:col-span-2">
        Service name
        <input name="name" required defaultValue={service?.name} className={inputClass} placeholder="Premium social growth service" />
      </label>

      <label className="text-xs font-semibold">
        Category
        <select name="category_id" required defaultValue={service?.category_id} className={inputClass}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs font-semibold">
        Platform
        <select name="platform" defaultValue={service?.platform || "instagram"} className={inputClass}>
          {["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "twitter"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs font-semibold">
        Status
        <select name="status" defaultValue={service?.status || "active"} className={inputClass}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <label className="text-xs font-semibold">
        Price per 1,000 (INR)
        <input name="rate" type="number" min="0" step="0.01" required defaultValue={service?.rate ?? 0} className={inputClass} />
      </label>

      <label className="text-xs font-semibold">
        Delivery time
        <input name="delivery_time" required defaultValue={service?.delivery_time || "1-7 days"} className={inputClass} placeholder="1-7 days" />
      </label>

      <label className="text-xs font-semibold">
        Refill policy
        <input name="refill_policy" required defaultValue={service?.refill_policy || "Refill eligible"} className={inputClass} />
      </label>
      <label className="text-xs font-semibold">
        Quality type
        <input name="quality_type" required defaultValue={service?.quality_type || "Premium"} className={inputClass} />
      </label>

      <label className="text-xs font-semibold">
        Minimum quantity
        <input name="min" type="number" min="1" required defaultValue={service?.min ?? 100} className={inputClass} />
      </label>

      <label className="text-xs font-semibold">
        Maximum quantity
        <input name="max" type="number" min="1" required defaultValue={service?.max ?? 1000000} className={inputClass} />
      </label>

      <label className="text-xs font-semibold">
        Active toggle
        <select name="is_active" defaultValue={service?.is_active ? "true" : "false"} className={inputClass}>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </label>

      <label className="text-xs font-semibold sm:col-span-2">
        Description
        <textarea
          name="description"
          defaultValue={service?.description}
          required
          className={`${inputClass} min-h-28 resize-none`}
          placeholder="Describe delivery, quality, and recommended use."
        />
      </label>
      <label className="text-xs font-semibold sm:col-span-2">
        Important instruction
        <textarea
          name="important_instruction"
          defaultValue={service?.important_instruction || "Use a public URL only."}
          required
          className={`${inputClass} min-h-20 resize-none`}
          placeholder="Critical pre-order instruction shown in checkout"
        />
      </label>

      <button className={`${primaryButton} sm:col-span-2`}>{service ? "Save service changes" : "Add service"}</button>
    </form>
  );
}

export default async function ServicesPage() {
  const supabase = await createClient();

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase
      .from("services")
      .select("id, category_id, name, description, status, rate, min, max, delivery_time, platform, refill_policy, quality_type, important_instruction, is_active, categories(name)")
      .order("id", { ascending: false }),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  const categoryRows = categories ?? [];

  return (
    <main className="mx-auto max-w-[1700px] p-5 sm:p-8">
      <AdminPageHeader
        title="Service management"
        description="Create, price, and configure service catalog details for customer ordering."
        action={
          <Modal label="+ Add service" title="Create service">
            <ServiceForm action={addService} categories={categoryRows} />
          </Modal>
        }
      />

      <section className="panel-card mt-7 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
              <tr>
                {["ID", "Service", "Category", "Platform", "Price / 1K", "Limits", "Delivery", "Refill", "Status", "Actions"].map((head) => (
                  <th key={head} className="px-5 py-3">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(services ?? []).map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-blue-600">#{service.id}</td>

                  <td className="max-w-[300px] px-5 py-4">
                    <p className="font-semibold">{service.name}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-400">{service.description}</p>
                  </td>

                  <td className="px-5 py-4 text-slate-500">{(service.categories as unknown as { name?: string } | null)?.name}</td>
                  <td className="px-5 py-4 text-slate-500 capitalize">{service.platform || "-"}</td>
                  <td className="px-5 py-4 font-bold">₹{Number(service.rate).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 text-slate-500">{Number(service.min).toLocaleString()} - {Number(service.max).toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-500">{service.delivery_time}</td>
                  <td className="px-5 py-4 text-slate-500">{service.refill_policy}</td>
                  <td className="px-5 py-4">
                    <AdminStatus value={service.is_active ? "active" : service.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Modal label="Edit" title={`Edit ${service.name}`}>
                        <ServiceForm
                          action={updateService}
                          categories={categoryRows}
                          service={{
                            ...service,
                            rate: Number(service.rate),
                            min: Number(service.min),
                            max: Number(service.max),
                            platform: service.platform || "instagram",
                            refill_policy: service.refill_policy || "Refill eligible",
                            quality_type: service.quality_type || "Premium",
                            important_instruction: service.important_instruction || "Use a public URL only.",
                            is_active: Boolean(service.is_active),
                          }}
                        />
                      </Modal>

                      <form action={deleteService}>
                        <input type="hidden" name="id" value={service.id} />
                        <button className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {!services?.length && (
                <tr>
                  <td colSpan={10} className="p-14 text-center text-slate-400">
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
