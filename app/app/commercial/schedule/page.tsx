import { ScheduleGrid } from "@/components/commercial/schedule-grid";
import { ScheduleWeekNav } from "@/components/commercial/schedule-week-nav";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/auth";
import { getAgencyProfiles, getSchedulesForWeek } from "@/lib/data/commercial";

interface SchedulePageProps {
  searchParams: Promise<{ week?: string }>;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mondayOf(dateStr: string): Date {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const user = await requireUser();
  const { week } = await searchParams;

  const weekStartDate = mondayOf(week ?? isoDate(new Date()));
  const weekStart = isoDate(weekStartDate);
  const weekEnd = isoDate(addDays(weekStartDate, 6));
  const prevWeek = isoDate(addDays(weekStartDate, -7));
  const nextWeek = isoDate(addDays(weekStartDate, 7));
  const days = Array.from({ length: 7 }, (_, index) => isoDate(addDays(weekStartDate, index)));

  const [profiles, scheduleViews] = await Promise.all([
    getAgencyProfiles(user.agency.id),
    getSchedulesForWeek(user.agency.id, weekStart, weekEnd),
  ]);

  const schedules = scheduleViews.map((view) => view.schedule);

  return (
    <>
      <Topbar user={user} title="Escala Semanal" description="Planeie os turnos da equipa comercial." />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <ScheduleWeekNav weekStart={weekStart} weekEnd={weekEnd} prevWeek={prevWeek} nextWeek={nextWeek} />
        <div className="overflow-x-auto rounded-xl border border-border">
          <ScheduleGrid profiles={profiles} days={days} schedules={schedules} />
        </div>
      </main>
    </>
  );
}
