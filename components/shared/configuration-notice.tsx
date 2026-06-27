import { TriangleAlert } from "lucide-react";

export function ConfigurationNotice() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center p-6">
      <div className="max-w-md space-y-3 rounded-xl border border-dashed border-border bg-secondary/40 p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
          <TriangleAlert className="size-5 text-amber-600" />
        </div>
        <div className="space-y-1.5">
          <p className="font-display font-semibold text-foreground">Supabase não configurado</p>
          <p className="text-sm text-muted-foreground">
            Faltam as variáveis de ambiente <code className="rounded bg-secondary px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="rounded bg-secondary px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Defina-as
            (ver <code className="rounded bg-secondary px-1 py-0.5 text-xs">.env.example</code>) e reimplemente.
          </p>
        </div>
      </div>
    </div>
  );
}
