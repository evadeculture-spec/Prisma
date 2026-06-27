import type { ReactNode } from "react";
import { Building2, Sparkles, TrendingUp, Users } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, text: "Campanhas de marketing geradas por IA em minutos" },
  { icon: Users, text: "Mini-CRM comercial com pipeline, tarefas e comissões" },
  { icon: TrendingUp, text: "Feed interno que liga toda a equipa da agência" },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-radial-petrol px-10 py-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="size-5" />
          </div>
          <span className="font-display text-lg font-semibold">ImoBoost AI</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            O estúdio de marketing e CRM feito para imobiliárias portuguesas.
          </h1>
          <ul className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="size-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/50">© {new Date().getFullYear()} ImoBoost AI</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
