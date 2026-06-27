"use client";

import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCommissionStatusAction } from "@/lib/actions/commercial";
import { COMMISSION_STATUS_LABEL } from "@/lib/labels";
import type { CommissionStatus } from "@/lib/types/domain";

const STATUSES = Object.keys(COMMISSION_STATUS_LABEL) as CommissionStatus[];

interface CommissionStatusSelectProps {
  commissionId: string;
  status: CommissionStatus;
  className?: string;
}

export function CommissionStatusSelect({ commissionId, status, className }: CommissionStatusSelectProps) {
  const [value, setValue] = useState(status);

  function handleChange(next: string) {
    setValue(next as CommissionStatus);
    void updateCommissionStatusAction(commissionId, next as CommissionStatus);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {COMMISSION_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
