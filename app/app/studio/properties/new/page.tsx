import { CreatePropertyForm } from "@/components/studio/create-property-form";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/auth";

export default async function NewPropertyPage() {
  const user = await requireUser();

  return (
    <>
      <Topbar user={user} title="Novo imóvel" description="Preencha os dados do imóvel para a IA gerar o pack de promoção." />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <CreatePropertyForm />
        </div>
      </main>
    </>
  );
}
