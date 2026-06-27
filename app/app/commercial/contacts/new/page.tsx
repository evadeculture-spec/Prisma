import { CreateContactForm } from "@/components/commercial/create-contact-form";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/auth";
import { getProperties } from "@/lib/data/properties";

export default async function NewContactPage() {
  const user = await requireUser();
  const properties = await getProperties(user.agency.id);

  return (
    <>
      <Topbar user={user} title="Novo contacto" description="Registe um novo lead ou cliente no pipeline comercial." />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <CreateContactForm properties={properties.map((property) => ({ id: property.id, title: property.title }))} />
        </div>
      </main>
    </>
  );
}
