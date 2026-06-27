"use client";

import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setScheduleAction } from "@/lib/actions/commercial";
import { SHIFT_TYPE_LABEL } from "@/lib/labels";
import type { Profile, Schedule, ShiftType } from "@/lib/types/domain";

const SHIFT_TYPES = Object.keys(SHIFT_TYPE_LABEL) as ShiftType[];
const NONE_VALUE = "none";

function formatDayHeader(date: string): string {
  return new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date(`${date}T00:00:00`));
}

interface ScheduleGridProps {
  profiles: Profile[];
  days: string[];
  schedules: Schedule[];
}

export function ScheduleGrid({ profiles, days, schedules }: ScheduleGridProps) {
  const [overrides, setOverrides] = useState<Record<string, ShiftType | null>>({});

  function keyFor(userId: string, date: string) {
    return `${userId}__${date}`;
  }

  function shiftFor(userId: string, date: string): ShiftType | null {
    const key = keyFor(userId, date);
    if (key in overrides) return overrides[key];
    return schedules.find((schedule) => schedule.user_id === userId && schedule.date === date)?.shift_type ?? null;
  }

  function handleChange(userId: string, date: string, value: string) {
    const shiftType = value === NONE_VALUE ? null : (value as ShiftType);
    setOverrides((current) => ({ ...current, [keyFor(userId, date)]: shiftType }));
    void setScheduleAction(userId, date, shiftType);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Equipa</TableHead>
          {days.map((day) => (
            <TableHead key={day} className="text-center">
              {formatDayHeader(day)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell className="font-medium text-foreground">{profile.full_name}</TableCell>
            {days.map((day) => {
              const shiftType = shiftFor(profile.id, day);
              return (
                <TableCell key={day} className="text-center">
                  <Select value={shiftType ?? NONE_VALUE} onValueChange={(value) => handleChange(profile.id, day, value)}>
                    <SelectTrigger size="sm" className="w-full justify-center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>—</SelectItem>
                      {SHIFT_TYPES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {SHIFT_TYPE_LABEL[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
