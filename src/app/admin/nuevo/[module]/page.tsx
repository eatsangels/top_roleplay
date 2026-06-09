import { notFound } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-auth";
import { canWriteModule } from "@/lib/admin-data";
import { adminRecordForms, type AdminFormField, type AdminFormOption } from "@/lib/admin-forms";

type FieldOptions = Record<string, AdminFormOption[]>;

export default async function NewAdminRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { module } = await params;
  const query = await searchParams;
  const { supabase, user, role } = await requireAdmin();
  const form = adminRecordForms[module];

  if (!form || !canWriteModule(role, module)) notFound();

  const fieldOptions = await loadFieldOptions(supabase, form.fields);

  return (
    <AdminLayout userEmail={user.email} userName={user.user_metadata?.username} userRole={role}>
      <Card className="mx-auto max-w-3xl p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Nuevo registro real</p>
        <h2 className="mt-2 font-fantasy text-3xl font-black text-white">{form.title}</h2>
        {query.error ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{query.error}</p> : null}
        <form action="/api/admin/create-record" className="mt-7 grid gap-5" method="post">
          <input name="module" type="hidden" value={module} />
          {form.fields.map((field) => <FormField field={field} key={field.name} options={fieldOptions[field.name]} />)}
          <button className="rounded-xl border border-gold-300/50 bg-gold-300/10 px-5 py-3 font-bold text-gold-300 hover:bg-gold-300/20" type="submit">Guardar en Supabase</button>
        </form>
      </Card>
    </AdminLayout>
  );
}

async function loadFieldOptions(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], fields: AdminFormField[]) {
  const result: FieldOptions = {};
  await Promise.all(fields.map(async (field) => {
    if (field.optionSource === "players") {
      const { data } = await supabase.from("players").select("id,username,email").order("username").limit(500);
      result[field.name] = (data ?? []).map((item) => ({ value: item.id, label: `${item.username} (${item.email})` }));
    }
    if (field.optionSource === "guilds") {
      const { data } = await supabase.from("guilds").select("id,name").order("name").limit(500);
      result[field.name] = (data ?? []).map((item) => ({ value: item.id, label: item.name }));
    }
    if (field.optionSource === "public_sections") {
      const { data } = await supabase.from("public_sections").select("id,key,title").order("sort_order").limit(500);
      result[field.name] = (data ?? []).map((item) => ({ value: item.id, label: `${item.title} (${item.key})` }));
    }
  }));
  return result;
}

function FormField({ field, options }: { field: AdminFormField; options?: AdminFormOption[] }) {
  const classes = "rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-white outline-none focus:border-cyan-magic/60";
  const selectOptions = options ?? field.options;

  return (
    <label className="grid gap-2 text-sm font-bold text-neutral-300">
      {field.label}
      {field.type === "textarea" ? (
        <textarea className={`${classes} min-h-28`} defaultValue={field.defaultValue} name={field.name} placeholder={field.placeholder} required={field.required} />
      ) : field.type === "select" ? (
        <select className={classes} defaultValue={field.defaultValue ?? ""} name={field.name} required={field.required}>
          {!field.required ? <option value="">Sin seleccionar</option> : null}
          {selectOptions?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      ) : (
        <input className={classes} defaultValue={field.defaultValue} max={field.max} min={field.min} name={field.name} placeholder={field.placeholder} required={field.required} type={field.type ?? "text"} />
      )}
      {field.help ? <span className="text-xs font-normal text-neutral-500">{field.help}</span> : null}
    </label>
  );
}
