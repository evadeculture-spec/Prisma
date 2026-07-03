"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogIn,
  Mail,
  MapPin,
  Maximize,
  Megaphone,
  Phone,
  RotateCcw,
  Rss,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RoleBadge } from "@/components/shared/role-badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatRelativeTime, initials } from "@/lib/format";
import { CONTACT_INTEREST_LABEL, CONTACT_SOURCE_LABEL, CONTACT_TYPE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "inicio" | "studio" | "comercial";

// ─── Demo data ────────────────────────────────────────────────────────────────
const NOW = new Date();
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(NOW.getTime() - n * 3600000).toISOString();
const daysFromNow = (n: number) => new Date(NOW.getTime() + n * 86400000).toISOString().slice(0, 10);

const DEMO_PROPERTIES = [
  {
    id: "p1", agency_id: "a1", created_by: null,
    title: "Apartamento T3 com vista rio",
    commercial_title: "Vista Rio Deslumbrante no Coração de Alcântara",
    location: "Alcântara, Lisboa", price: 485000, property_type: "t3" as const,
    deal_type: "sale" as const, bedrooms: 3, bathrooms: 2, useful_area: 120, gross_area: 135,
    has_garage: true, has_garden: false, has_pool: false, condition: "renovated" as const,
    energy_certificate: "B", description: "Apartamento totalmente renovado com vista desafogada sobre o rio Tejo.",
    target_audience: ["familia"], strengths: "Vista rio, renovado", weaknesses: null,
    tone: "premium" as const, status: "active" as const,
    cover_image_url: "https://picsum.photos/seed/imoboost-t3-lisboa-1/1200/800",
    created_at: daysAgo(10), updated_at: daysAgo(2),
  },
  {
    id: "p2", agency_id: "a1", created_by: null,
    title: "Moradia V4 com piscina",
    commercial_title: "Refúgio de Luxo a Minutos da Praia de Cascais",
    location: "Cascais", price: 950000, property_type: "villa" as const,
    deal_type: "sale" as const, bedrooms: 4, bathrooms: 4, useful_area: 320, gross_area: 380,
    has_garage: true, has_garden: true, has_pool: true, condition: "as_new" as const,
    energy_certificate: "A", description: "Moradia isolada com piscina privada e jardim maduro.",
    target_audience: ["luxo"], strengths: "Piscina privada, jardim", weaknesses: null,
    tone: "luxury" as const, status: "active" as const,
    cover_image_url: "https://picsum.photos/seed/imoboost-villa-cascais-1/1200/800",
    created_at: daysAgo(15), updated_at: daysAgo(1),
  },
  {
    id: "p3", agency_id: "a1", created_by: null,
    title: "Apartamento T1 renovado em Cedofeita",
    commercial_title: null,
    location: "Cedofeita, Porto", price: 175000, property_type: "t1" as const,
    deal_type: "sale" as const, bedrooms: 1, bathrooms: 1, useful_area: 55, gross_area: 60,
    has_garage: false, has_garden: false, has_pool: false, condition: "renovated" as const,
    energy_certificate: "C", description: "T1 completamente remodelado em 2024.",
    target_audience: ["investidor"], strengths: "Remodelado, localização central", weaknesses: null,
    tone: "young" as const, status: "reserved" as const,
    cover_image_url: "https://picsum.photos/seed/imoboost-t1-porto-1/1200/800",
    created_at: daysAgo(20), updated_at: daysAgo(3),
  },
  {
    id: "p4", agency_id: "a1", created_by: null,
    title: "T2 para arrendar em Braga",
    commercial_title: null,
    location: "Braga", price: 750, property_type: "t2" as const,
    deal_type: "rent" as const, bedrooms: 2, bathrooms: 1, useful_area: 80, gross_area: 85,
    has_garage: false, has_garden: false, has_pool: false, condition: "used" as const,
    energy_certificate: "D", description: "Apartamento T2 bem localizado, próximo do centro histórico.",
    target_audience: ["familia"], strengths: "Localização central", weaknesses: null,
    tone: "family" as const, status: "active" as const,
    cover_image_url: "https://picsum.photos/seed/imoboost-t2-braga-1/1200/800",
    created_at: daysAgo(5), updated_at: daysAgo(1),
  },
  {
    id: "p5", agency_id: "a1", created_by: null,
    title: "Loft T0 moderno em Setúbal",
    commercial_title: null,
    location: "Setúbal", price: 120000, property_type: "studio" as const,
    deal_type: "sale" as const, bedrooms: 0, bathrooms: 1, useful_area: 38, gross_area: 40,
    has_garage: false, has_garden: false, has_pool: false, condition: "new" as const,
    energy_certificate: "A", description: "Loft compacto e funcional, acabamentos modernos.",
    target_audience: ["investidor"], strengths: "Acabamentos modernos", weaknesses: null,
    tone: "direct" as const, status: "sold" as const,
    cover_image_url: "https://picsum.photos/seed/imoboost-loft-setubal-1/1200/800",
    created_at: daysAgo(30), updated_at: daysAgo(7),
  },
];

const DEMO_CONTACTS = [
  {
    id: "c1", agency_id: "a1", owner_id: null, name: "Sofia Martins",
    phone: "+351 912 345 678", email: "sofia.martins@example.com",
    type: "buyer" as const, source: "instagram" as const, interest: "buy" as const,
    budget: 500000, desired_location: "Lisboa", desired_typology: "t3" as const,
    status: "visit_scheduled" as const,
    notes: "Muito interessada na vista rio, quer levar o marido a uma segunda visita.",
    next_action: "Agendar 2ª visita para o fim de semana",
    related_property_id: "p1", gdpr_consent: true,
    created_at: daysAgo(5), updated_at: hoursAgo(3),
  },
  {
    id: "c2", agency_id: "a1", owner_id: null, name: "Tiago Ferreira",
    phone: "+351 933 222 111", email: "tiago.ferreira@example.com",
    type: "buyer" as const, source: "idealista" as const, interest: "buy" as const,
    budget: 1000000, desired_location: "Cascais", desired_typology: "villa" as const,
    status: "negotiation" as const,
    notes: "Já fez proposta inicial, a negociar condições de pagamento.",
    next_action: "Confirmar resposta à contraproposta",
    related_property_id: "p2", gdpr_consent: true,
    created_at: daysAgo(8), updated_at: hoursAgo(6),
  },
  {
    id: "c3", agency_id: "a1", owner_id: null, name: "Ana Rodrigues",
    phone: "+351 925 555 333", email: "ana.rodrigues@example.com",
    type: "buyer" as const, source: "website" as const, interest: "buy" as const,
    budget: 200000, desired_location: "Porto", desired_typology: "t1" as const,
    status: "closed" as const,
    notes: "Negócio fechado, à espera da escritura.",
    next_action: "Agendar escritura",
    related_property_id: "p3", gdpr_consent: true,
    created_at: daysAgo(20), updated_at: daysAgo(3),
  },
  {
    id: "c4", agency_id: "a1", owner_id: null, name: "Miguel Alves",
    phone: "+351 938 111 999", email: "miguel.alves@example.com",
    type: "investor" as const, source: "facebook" as const, interest: "invest" as const,
    budget: 700000, desired_location: "Sintra", desired_typology: "land" as const,
    status: "qualified" as const,
    notes: "Procura terrenos com potencial turístico.",
    next_action: "Enviar dossier da Quinta de Sintra",
    related_property_id: null, gdpr_consent: false,
    created_at: daysAgo(3), updated_at: hoursAgo(12),
  },
];

const DEMO_TASKS = [
  {
    id: "t1", agency_id: "a1", assigned_to: "Marta Sousa", created_by: null,
    contact_id: "c1", property_id: null,
    title: "Ligar para Sofia Martins",
    description: "Confirmar detalhes da 2ª visita ao apartamento.",
    priority: "high" as const, type: "call" as const, status: "pending" as const,
    due_date: daysFromNow(0), created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  {
    id: "t2", agency_id: "a1", assigned_to: "João Pereira", created_by: null,
    contact_id: "c2", property_id: "p2",
    title: "Visita — Moradia em Cascais",
    description: "Acompanhar o Tiago Ferreira na visita à moradia.",
    priority: "high" as const, type: "visit" as const, status: "pending" as const,
    due_date: daysFromNow(1), created_at: daysAgo(2), updated_at: daysAgo(2),
  },
  {
    id: "t3", agency_id: "a1", assigned_to: "Rui Mendes", created_by: null,
    contact_id: null, property_id: "p5",
    title: "Angariação — Quinta em Sintra",
    description: "Validar limites do terreno e regularizar documentação.",
    priority: "urgent" as const, type: "listing" as const, status: "in_progress" as const,
    due_date: daysFromNow(0), created_at: daysAgo(3), updated_at: hoursAgo(4),
  },
  {
    id: "t4", agency_id: "a1", assigned_to: "Beatriz Albi", created_by: null,
    contact_id: null, property_id: null,
    title: "Reunião de equipa semanal",
    description: "Rever pipeline comercial e prioridades da semana.",
    priority: "medium" as const, type: "meeting" as const, status: "pending" as const,
    due_date: daysFromNow(1), created_at: daysAgo(1), updated_at: daysAgo(1),
  },
];

const DEMO_POSTS = [
  {
    id: "fp1", type: "management_notice" as const,
    title: "Bem-vindos ao ImoBoost AI",
    content: "A partir de hoje toda a equipa passa a usar o ImoBoost AI para gerir imóveis, leads e comunicação interna. Qualquer dúvida, fala comigo!",
    author: "Beatriz Albi", role: "admin" as const, is_pinned: true, likeCount: 3,
    createdAt: daysAgo(7),
    comments: [
      { author: "Marta Sousa", content: "Excelente iniciativa!", createdAt: daysAgo(7) },
    ],
  },
  {
    id: "fp2", type: "sale_achievement" as const,
    title: "Negócio fechado: Loft T0 moderno em Setúbal",
    content: "Rui Mendes fechou o negócio \"Loft T0 moderno em Setúbal\", no valor de 120.000 €. Parabéns, Rui!",
    author: "Rui Mendes", role: "coordinator" as const, is_pinned: false, likeCount: 5,
    createdAt: daysAgo(3),
    comments: [
      { author: "João Pereira", content: "Parabéns Rui, grande negócio!", createdAt: daysAgo(3) },
      { author: "Carla Nogueira", content: "Vamos celebrar isto na reunião de equipa!", createdAt: daysAgo(3) },
    ],
  },
  {
    id: "fp3", type: "open_house" as const,
    title: "Casa aberta este sábado — Quinta em Sintra",
    content: "Vamos receber visitas sem marcação prévia este sábado entre as 14h e as 17h. Tragam os vossos clientes investidores!",
    author: "Marta Sousa", role: "agent" as const, is_pinned: false, likeCount: 2,
    createdAt: hoursAgo(18),
    comments: [],
  },
  {
    id: "fp4", type: "training" as const,
    title: "Formação: Como usar o Estúdio de Marketing AI",
    content: "Quinta-feira às 10h, sessão prática sobre como gerar packs de promoção completos em minutos.",
    author: "Carla Nogueira", role: "marketing" as const, is_pinned: false, likeCount: 4,
    createdAt: hoursAgo(6),
    comments: [],
  },
];

const TYPE_ICON_MAP: Record<string, typeof Sparkles> = {
  management_notice: Megaphone,
  sale_achievement: Trophy,
  open_house: Building2,
  training: Sparkles,
  featured_property: Building2,
  new_agent: UserPlus,
  internal_news: Rss,
  partnership: Users,
  event: CalendarDays,
  campaign: Sparkles,
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "inicio" as Section, label: "Início", icon: LayoutDashboard },
  { id: "studio" as Section, label: "Estúdio AI", icon: Sparkles },
  { id: "comercial" as Section, label: "Comercial", icon: Briefcase },
] as const;

// ─── Sections ─────────────────────────────────────────────────────────────────
function InicioSection() {
  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur lg:px-8">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">Olá, Beatriz</h1>
          <p className="text-sm text-muted-foreground">Aqui está o que se passa na agência hoje.</p>
        </div>
        <Avatar>
          <AvatarFallback>BA</AvatarFallback>
        </Avatar>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Imóveis ativos" value="4" icon={Briefcase} accent="petrol" trend={{ value: "+1 este mês", direction: "up" }} />
          <StatCard label="Novos leads (7 dias)" value="3" icon={Users} accent="gold" trend={{ value: "+2 vs semana passada", direction: "up" }} />
          <StatCard label="Tarefas pendentes" value="7" icon={ClipboardList} />
          <StatCard label="Comissões em curso" value={formatCurrency(1635000 * 0.05)} icon={TrendingUp} accent="petrol" />
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-base font-semibold text-foreground">Feed da equipa</h2>
          {DEMO_POSTS.map((post) => {
            const Icon = TYPE_ICON_MAP[post.type] ?? Sparkles;
            return (
              <Card key={post.id} className={post.is_pinned ? "border-primary/30 bg-primary/5" : ""}>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{post.author}</span>
                        <RoleBadge role={post.role} />
                        {post.is_pinned && (
                          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                            Fixado
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(post.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{post.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{post.content}</p>
                    </div>
                  </div>

                  {post.comments.length > 0 && (
                    <div className="ml-12 space-y-2 border-t border-border pt-3">
                      {post.comments.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Avatar className="size-6 shrink-0">
                            <AvatarFallback className="text-[10px]">{initials(c.author)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-foreground">{c.author}: </span>
                            <span className="text-muted-foreground">{c.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="ml-12 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>❤️ {post.likeCount} gostos</span>
                    <span>💬 {post.comments.length} comentários</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}

function StudioSection() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? DEMO_PROPERTIES : DEMO_PROPERTIES.filter((p) => p.status === filter);

  const FILTERS = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Ativos" },
    { id: "reserved", label: "Reservados" },
    { id: "sold", label: "Vendidos" },
  ] as const;

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur lg:px-8">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">Estúdio de Marketing AI</h1>
          <p className="text-sm text-muted-foreground">Imóveis e packs de promoção gerados com IA.</p>
        </div>
        <Badge variant="secondary" className="shrink-0">Modo demonstração</Badge>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                filter === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => {
            const area = property.useful_area ?? property.gross_area;
            return (
              <div
                key={property.id}
                className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="relative aspect-4/3 w-full bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.cover_image_url ?? ""}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={property.status} />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-background/90">
                      {property.deal_type === "sale" ? "Venda" : "Arrendamento"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <p className="line-clamp-1 font-display font-semibold text-foreground">
                    {property.commercial_title ?? property.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {property.location}
                  </p>
                  <p className="font-display text-lg font-semibold text-primary">
                    {formatCurrency(property.price)}{property.deal_type === "rent" ? "/mês" : ""}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{TYPOLOGY_LABEL[property.property_type]}</span>
                    {property.bedrooms > 0 && (
                      <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> {property.bedrooms}</span>
                    )}
                    {property.bathrooms > 0 && (
                      <span className="flex items-center gap-1"><Bath className="size-3.5" /> {property.bathrooms}</span>
                    )}
                    {area && (
                      <span className="flex items-center gap-1"><Maximize className="size-3.5" /> {area} m²</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pack de Promoção AI</p>
              <p className="text-xs text-muted-foreground">
                Em modo demonstração — na versão real, um clique gera título comercial, legenda de Instagram, descrição de portal, anúncio Meta e muito mais.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function ComercialSection() {
  const TASK_TYPE_ICON: Record<string, typeof Phone> = {
    call: Phone, visit: Users, publication: Megaphone,
    follow_up: RotateCcw, meeting: Users, documentation: FileText, listing: ClipboardList,
  };
  const PRIORITY_VARIANT: Record<string, "secondary" | "info" | "warning" | "destructive"> = {
    low: "secondary", medium: "info", high: "warning", urgent: "destructive",
  };
  const PRIORITY_LABEL: Record<string, string> = {
    low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
  };
  const TASK_TYPE_LABEL: Record<string, string> = {
    call: "Chamada", visit: "Visita", publication: "Publicação",
    follow_up: "Follow-up", meeting: "Reunião", documentation: "Documentação", listing: "Angariação",
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur lg:px-8">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">Área Comercial</h1>
          <p className="text-sm text-muted-foreground">Contactos, tarefas, comissões e escala da equipa.</p>
        </div>
        <Badge variant="secondary" className="shrink-0">Modo demonstração</Badge>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Contactos" value="9" icon={Users} accent="petrol" />
          <StatCard label="Novos contactos" value="1" icon={UserPlus} accent="gold" />
          <StatCard label="Tarefas pendentes hoje" value="3" icon={ClipboardList} />
          <StatCard label="Comissões previstas" value={formatCurrency(55250)} icon={TrendingUp} accent="petrol" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contactos recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {DEMO_CONTACTS.map((contact) => (
                <div key={contact.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold text-foreground">{contact.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[11px]">
                          {CONTACT_TYPE_LABEL[contact.type]}
                        </Badge>
                        <span>· {CONTACT_INTEREST_LABEL[contact.interest]}</span>
                        <span>· {CONTACT_SOURCE_LABEL[contact.source]}</span>
                      </div>
                    </div>
                    <StatusBadge status={contact.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {contact.phone && (
                      <span className="flex items-center gap-1"><Phone className="size-3.5" /> {contact.phone}</span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1"><Mail className="size-3.5" /> {contact.email}</span>
                    )}
                  </div>

                  {(contact.desired_location || contact.budget) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {contact.desired_location && (
                        <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {contact.desired_location}</span>
                      )}
                      {contact.desired_typology && <span>{TYPOLOGY_LABEL[contact.desired_typology]}</span>}
                      {contact.budget && <span className="font-medium text-foreground">até {formatCurrency(contact.budget)}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {contact.gdpr_consent
                        ? <><ShieldCheck className="size-3.5 text-emerald-600" /> Consentimento RGPD</>
                        : <span className="text-amber-600">Sem consentimento RGPD</span>
                      }
                    </span>
                    <span>{formatRelativeTime(contact.updated_at)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximas tarefas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {DEMO_TASKS.map((task) => {
                const Icon = TASK_TYPE_ICON[task.type] ?? ClipboardList;
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && (task.status as string) !== "completed";
                return (
                  <Card key={task.id}>
                    <CardContent className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 text-muted-foreground">
                        <Square className="size-5" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 text-[11px]">
                            {PRIORITY_LABEL[task.priority]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon className="size-3.5" /> {TASK_TYPE_LABEL[task.type]}
                            </span>
                            {task.due_date && (
                              <span className={cn("flex items-center gap-1", isOverdue && "font-medium text-destructive")}>
                                <CalendarClock className="size-3.5" /> {task.due_date}
                              </span>
                            )}
                          </div>
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">{initials(task.assigned_to)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const [section, setSection] = useState<Section>("inicio");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Demo banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-gold-500 px-4 py-1.5 text-xs font-medium text-white">
        <span>✨ Modo de demonstração — todos os dados são fictícios</span>
        <Link
          href="/login"
          className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-white/30 transition-colors"
        >
          <LogIn className="size-3" /> Criar conta
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden h-[calc(100vh-32px)] w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex sticky top-8">
          <div className="flex items-center gap-2.5 px-5 py-6">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-white">ImoBoost AI</p>
              <p className="text-xs text-sidebar-foreground/60">Albi Imobiliária</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors w-full",
                    section === id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </button>
              ))}
              <div className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/40">
                <Rss className="size-4 shrink-0" />
                Feed Interno
              </div>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/40">
                <Settings className="size-4 shrink-0" />
                Definições
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
            <Avatar>
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">BA</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Beatriz Albi</p>
              <RoleBadge role="admin" className="mt-0.5" />
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {section === "inicio" && <InicioSection />}
          {section === "studio" && <StudioSection />}
          {section === "comercial" && <ComercialSection />}
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="sticky bottom-0 z-40 flex border-t border-border bg-background lg:hidden">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
              section === id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
