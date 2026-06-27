import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { ContactPipelineBoard } from "@/components/commercial/contact-pipeline-board";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getContacts } from "@/lib/data/commercial";

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await getContacts(user.agency.id);

  return (
    <>
      <Topbar
        user={user}
        title="Contactos"
        description="Pipeline de leads e clientes da agência."
        actions={
          <Button asChild>
            <Link href="/app/commercial/contacts/new">
              <Plus className="size-4" /> Novo contacto
            </Link>
          </Button>
        }
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Ainda sem contactos"
            description="Crie o primeiro contacto para começar o pipeline comercial."
            action={
              <Button asChild>
                <Link href="/app/commercial/contacts/new">
                  <Plus className="size-4" /> Novo contacto
                </Link>
              </Button>
            }
          />
        ) : (
          <ContactPipelineBoard contacts={contacts} />
        )}
      </main>
    </>
  );
}
