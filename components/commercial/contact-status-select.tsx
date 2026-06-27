"use client";

import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateContactStatusAction } from "@/lib/actions/commercial";
import { CONTACT_STATUS_LABEL } from "@/lib/labels";
import type { ContactStatus } from "@/lib/types/domain";

const STATUSES = Object.keys(CONTACT_STATUS_LABEL) as ContactStatus[];

interface ContactStatusSelectProps {
  contactId: string;
  status: ContactStatus;
  className?: string;
}

export function ContactStatusSelect({ contactId, status, className }: ContactStatusSelectProps) {
  const [value, setValue] = useState(status);

  function handleChange(next: string) {
    setValue(next as ContactStatus);
    void updateContactStatusAction(contactId, next as ContactStatus);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {CONTACT_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
