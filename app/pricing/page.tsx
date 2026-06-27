import Link from "next/link";
import { Building2, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "49€",
    period: "/mês",
    description: "Para agências pequenas ou agentes independentes a começar com IA.",
    features: [
      "Até 3 utilizadores",
      "Estúdio de marketing AI (50 gerações/mês)",
      "Mini-CRM comercial com pipeline e tarefas",
      "Feed interno da equipa",
    ],
    cta: "Começar agora",
  },
  {
    name: "Profissional",
    price: "129€",
    period: "/mês",
    description: "Para agências em crescimento que precisam de todo o ecossistema.",
    features: [
      "Até 10 utilizadores",
      "Estúdio de marketing AI ilimitado",
      "Geração de vídeos com IA",
      "Comercial completo: pipeline, tarefas, comissões e escalas",
      "Feed interno com publicações destacadas",
      "Suporte prioritário",
    ],
    cta: "Começar agora",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    description: "Para grupos e redes de franchising com múltiplas agências.",
    features: [
      "Utilizadores ilimitados",
      "Gestão multi-agência",
      "Integrações personalizadas",
      "Gestor de conta dedicado",
      "Contrato e faturação à medida",
    ],
    cta: "Contactar vendas",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">ImoBoost AI</span>
        </Link>
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </header>

      <main className="flex-1 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="space-y-3 text-center">
            <Badge variant="gold" className="mx-auto">
              Planos ImoBoost AI
            </Badge>
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Um plano para cada fase da sua agência
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Estúdio de marketing com IA, mini-CRM comercial e feed interno — tudo incluído, sem custos escondidos.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={tier.highlighted ? "border-primary shadow-lg ring-1 ring-primary/20" : undefined}
              >
                <CardHeader className="space-y-3">
                  {tier.highlighted && <Badge variant="gold" className="w-fit">Mais popular</Badge>}
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-semibold text-foreground">{tier.price}</span>
                    {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-5">
                  <ul className="space-y-2.5 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                    <Link href="/login">{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Todos os planos incluem o modo de demonstração para testar antes de decidir. Preços sem IVA.
          </p>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground lg:px-10">
        © {new Date().getFullYear()} ImoBoost AI — Feito para imobiliárias portuguesas.
      </footer>
    </div>
  );
}
