"use client";

import { ContactCard } from "@/components/commercial/contact-card";
import { ContactStatusSelect } from "@/components/commercial/contact-status-select";
import { CONTACT_STATUS_LABEL } from "@/lib/labels";
import type { Contact, ContactStatus } from "@/lib/types/domain";

const STATUSES = Object.keys(CONTACT_STATUS_LABEL) as ContactStatus[];

interface ContactPipelineBoardProps {
  contacts: Contact[];
}

export function ContactPipelineBoard({ contacts }: ContactPipelineBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STATUSES.map((status) => {
        const columnContacts = contacts.filter((contact) => contact.status === status);
        return (
          <div key={status} className="flex w-72 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-medium text-foreground">{CONTACT_STATUS_LABEL[status]}</p>
              <span className="text-xs text-muted-foreground">{columnContacts.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {columnContacts.map((contact) => (
                <div key={contact.id} className="space-y-2">
                  <ContactCard contact={contact} href={`/app/commercial/contacts/${contact.id}`} />
                  <ContactStatusSelect contactId={contact.id} status={contact.status} className="w-full" />
                </div>
              ))}
              {columnContacts.length === 0 && (
                <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  Sem contactos
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
