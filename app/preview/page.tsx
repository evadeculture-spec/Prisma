"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckSquare,
  ClipboardList,
  Copy,
  FileText,
  Globe,
  Hash,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Maximize,
  Megaphone,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Rss,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  TrendingUp,
  Trophy,
  Upload,
  UserPlus,
  Users,
  Video,
  X,
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

// ─── AI Pack Generator logic ──────────────────────────────────────────────────
interface GenForm { tipo: string; local: string; preco: string; pontos: string; tom: string }
interface GeneratedPack { titulo: string; instagram: string; portal: string; whatsapp: string; hashtags: string; reel: string }

function buildPack(f: GenForm): GeneratedPack {
  const TL: Record<string, string> = { t0:"T0", t1:"T1", t2:"T2", t3:"T3", t4:"T4", villa:"Moradia", studio:"Loft/Studio" };
  const tl = TL[f.tipo] ?? "Imóvel";
  const loc = f.local.trim() || "Lisboa";
  const locS = loc.split(",")[0].trim();
  const pts = f.pontos.split(",").map(p => p.trim()).filter(Boolean);
  const p1 = pts[0] ?? "ótima localização";
  const p2 = pts[1] ?? "acabamentos de qualidade";
  const ptStr = pts.length ? pts.join(", ") : "excelente localização";
  const prN = parseInt(f.preco.replace(/\D/g, "") || "0");
  const prFmt = prN > 0 ? prN.toLocaleString("pt-PT") + " €" : "";
  const prLine = prFmt ? `Preço: ${prFmt}.` : "";
  const baseHash = `#${locS.replace(/\s+/g,"")} #ImóveisPortugal #Imobiliária #${tl.replace(/\//g,"")} #ImoBoostAI #ComprarCasa #PortugalRealEstate`;

  switch (f.tom) {
    case "luxury": return {
      titulo: `Exclusividade Absoluta — ${tl} de Prestígio em ${loc}`,
      instagram: `✨ A algumas propriedades chamamos raras. Esta é uma delas.\n\n${tl} de referência em ${loc} — ${ptStr}. ${prFmt ? `Por ${prFmt}.` : ""}\n\nSó para quem reconhece o valor do extraordinário. Visita privada mediante marcação exclusiva. 📩\n\n${baseHash} #LuxoImobiliário #LuxuryRealEstate`,
      portal: `Apresentamos um ${tl} de prestígio em ${loc}, que se distingue pela ${p1} e pelos acabamentos de nível superior. Concebido para quem não abdica da excelência em cada detalhe — desde a localização privilegiada à qualidade dos materiais. ${p2 !== "acabamentos de qualidade" ? `Realce especial para ${p2}.` : ""} Zona de referência com serviços de topo nas proximidades. ${prLine} Visitas exclusivas mediante marcação prévia.`,
      whatsapp: `Olá! Acabei de receber um ${tl} exclusivo em ${loc} — ${ptStr}. ${prFmt ? `Valor: ${prFmt}.` : ""} Sei que este perfil encaixa no que procura. Posso marcar uma visita privada? 🏡`,
      hashtags: baseHash + ` #LuxuryLiving #LuxuryProperty #${locS.replace(/\s+/g,"")}Luxury #PrestigiousHomes #EliteRealEstate`,
      reel: `🎬 Script Reel — Tom Luxo\n\nCena 1 (3s): Plano aéreo de ${locS} ao amanhecer. Música orquestral suave.\nCena 2 (4s): Entrada do imóvel, zoom lento na fachada. Sem texto.\nCena 3 (5s): Interior — sala principal, luz natural a entrar. Travelling lento.\nCena 4 (3s): Destaque: ${p1}. Close-up cinematográfico.\nCena 5 (4s): Texto elegante: "${tl} de Prestígio em ${loc}"\nCena 6 (3s): Logo ImoBoost AI + contacto. Fade a preto.\n\nVoz off: "Algumas propriedades não se descrevem. Vivem-se."`,
    };
    case "family": return {
      titulo: `${tl} Espaçoso para a Família — ${loc}`,
      instagram: `🏡 O espaço que a tua família merece, na cidade que amas.\n\n${tl} em ${loc} com ${ptStr}. ${prFmt ? `A partir de ${prFmt}.` : ""} Amplo, confortável e com tudo o que precisas perto.\n\nAgende já a visita e vem conhecer o teu novo lar! 📞\n\n${baseHash} #CasaFamília #VidaFamiliar #NovaCasa`,
      portal: `Imóvel ideal para famílias que procuram espaço, conforto e qualidade de vida em ${loc}. Este ${tl} destaca-se pela ${p1} e pela ${p2}, reunindo todas as condições para uma vida familiar plena. Zona residencial tranquila com escolas, comércio e transportes a poucos minutos. ${prLine} Marque a sua visita sem compromisso.`,
      whatsapp: `Olá! Tenho um ${tl} em ${loc} que pode ser perfeito para a sua família — ${ptStr}. ${prFmt ? `Preço: ${prFmt}.` : ""} Quer que lhe envie mais fotos ou marcamos uma visita? 😊`,
      hashtags: baseHash + ` #CasaFamília #VidaFamiliar #NovaCasa #CasaPortugal #FamíliasPortugal`,
      reel: `🎬 Script Reel — Tom Familiar\n\nCena 1 (3s): Exterior com jardim ou zona verde próxima. Dia ensolarado.\nCena 2 (4s): Sala ampla — família imaginada no espaço (movimento de câmara suave).\nCena 3 (3s): Quartos espaçosos com luz natural.\nCena 4 (3s): Destaque: ${p1}.\nCena 5 (4s): Texto: "O lar que a tua família merece em ${loc}"\nCena 6 (3s): Contacto + CTA "Marca já a visita". Música alegre e acolhedora.`,
    };
    case "young": return {
      titulo: `O Teu Próximo Capítulo Começa em ${loc} 🔑`,
      instagram: `🔑 Imagina acordar aqui todos os dias.\n\n${tl} em ${loc} — ${ptStr}. ${prFmt ? `Apenas ${prFmt}.` : ""}\n\nNovo lar, nova vida. Marca já a visita antes que seja tarde! ⚡\n\n${baseHash} #PrimeiraCasa #JovensCompram #NovosLares #OportunidadeÚnica`,
      portal: `${tl} moderno e funcional em ${loc}, ideal para jovens profissionais ou casais à procura do primeiro imóvel. Destaca-se pela ${p1} e pela ${p2}. Localização central com fácil acesso a transportes, restauração e vida cultural. ${prLine} Uma oportunidade não deve ser perdida.`,
      whatsapp: `Ei! Vi que andas à procura de imóvel. Tenho um ${tl} em ${loc} que acho que vais adorar — ${ptStr}. ${prFmt ? `Por ${prFmt}.` : ""} Consegues ver esta semana? 🚀`,
      hashtags: baseHash + ` #PrimeiraCasa #JovensCompram #Millennials #FirstHome #${locS.replace(/\s+/g,"")}Life`,
      reel: `🎬 Script Reel — Tom Jovem\n\nCena 1 (2s): Vista da janela / exterior apelativo. Corte rápido.\nCena 2 (3s): Interior moderno. Música energética.\nCena 3 (2s): Detalhe: ${p1}. Corte dinâmico.\nCena 4 (2s): Detalhe: ${p2 !== "acabamentos de qualidade" ? p2 : "zona envolvente"}.\nCena 5 (3s): Texto animado: "${tl} em ${loc}"${prFmt ? ` + ${prFmt}` : ""}.\nCena 6 (2s): CTA "Marca já" + contacto. Cortes rápidos, vibe urbana.`,
    };
    case "direct": return {
      titulo: `${tl} em ${loc}${prFmt ? ` — ${prFmt}` : ""} — Disponível Já`,
      instagram: `📌 ${tl} disponível em ${loc}.\n\n✅ ${ptStr}${prFmt ? `\n💶 ${prFmt}` : ""}\n\nVisitas esta semana. Contacta já. ☎️\n\n${baseHash} #VendaRápida #Oportunidade`,
      portal: `${tl} situado em ${loc}. Características: ${ptStr}. ${prLine} Imóvel disponível para visitas imediatas. Documentação em ordem. Excelente relação qualidade-preço. Não perca esta oportunidade — contacte-nos hoje.`,
      whatsapp: `Bom dia! ${tl} em ${loc} — ${ptStr}. ${prFmt ? `Preço: ${prFmt}.` : ""} Disponível para visita esta semana. Interessa?`,
      hashtags: baseHash + ` #VendaRápida #BomPreço #Oportunidade #NegócioImóvel #Disponível`,
      reel: `🎬 Script Reel — Tom Direto\n\nCena 1 (2s): Exterior do imóvel. Sem música dramática — direto ao ponto.\nCena 2 (2s): Interior principal.\nCena 3 (2s): ${p1} em destaque.\nCena 4 (3s): Texto grande: ${prFmt ? `"${prFmt}"` : `"${tl} em ${loc}"`}.\nCena 5 (3s): "Disponível já · Marca a visita" + contacto. Objetivo e eficaz.`,
    };
    case "investment": return {
      titulo: `${tl} em ${loc} — Rentabilidade e Valorização Garantidas`,
      instagram: `📈 Investimento inteligente em ${loc}.\n\n${tl} com ${ptStr} — zona em valorização constante, procura de arrendamento sólida. ${prFmt ? `Investimento: ${prFmt}.` : ""}\n\nOs melhores investimentos não esperam. Fala connosco. 💼\n\n${baseHash} #InvestimentoImobiliário #RealEstateInvesting #Rentabilidade`,
      portal: `Excelente oportunidade de investimento imobiliário em ${loc}. ${tl} com ${ptStr}, numa zona com forte procura de arrendamento e valorização histórica consistente. Retorno potencial estimado entre 4% e 6% ao ano. ${prLine} Ideal para carteira de investimento a médio e longo prazo. Solicite análise de rentabilidade detalhada.`,
      whatsapp: `Olá! Tenho uma oportunidade de investimento em ${loc} — ${tl} com ${ptStr}. ${prFmt ? `Valor: ${prFmt}.` : ""} Rentabilidade estimada de 4–6%/ano. Posso enviar análise detalhada?`,
      hashtags: baseHash + ` #InvestimentoImobiliário #Rentabilidade #RealEstateInvesting #PassiveIncome #${locS.replace(/\s+/g,"")}Invest`,
      reel: `🎬 Script Reel — Tom Investimento\n\nCena 1 (3s): Vista aérea de ${locS} — movimento, vida, atividade económica.\nCena 2 (3s): Imóvel com destaque para ${p1}.\nCena 3 (5s): Infográfico animado: "Zona em valorização · Procura sólida · Rentabilidade 4–6%/ano".\nCena 4 (3s): Texto: "O teu próximo investimento em ${loc}" + contacto.\nMúsica: confiante e profissional.`,
    };
    default: return { // premium
      titulo: `${tl} com ${p1} — ${loc}`,
      instagram: `🏡 Descobre o equilíbrio perfeito entre conforto e localização.\n\n${tl} em ${loc} com ${ptStr}. ${prFmt ? `Preço: ${prFmt}.` : ""}\n\nUma oportunidade que não vais querer perder. Agenda já a tua visita! 📩\n\n${baseHash} #CasaPortugal #MercadoImobiliário`,
      portal: `Apresentamos um ${tl} de qualidade superior em ${loc}, que se destaca pela ${p1} e pela ${p2}. Imóvel com acabamentos cuidados, excelente luminosidade e óptimas condições de habitabilidade. Zona com bons acessos e serviços nas proximidades. ${prLine} Marque a sua visita.`,
      whatsapp: `Olá! Tenho um ${tl} em ${loc} que pode ser exatamente o que procura — ${ptStr}. ${prFmt ? `Valor: ${prFmt}.` : ""} Quer que marquemos uma visita? 😊`,
      hashtags: baseHash + ` #CasaPortugal #ComprarImóvel #MercadoImobiliário #ImóveisLisboa #HomePortugal`,
      reel: `🎬 Script Reel — Tom Premium\n\nCena 1 (3s): Zona envolvente de ${locS} — luz dourada, atmosfera premium.\nCena 2 (4s): Interior — sala e áreas comuns com iluminação natural.\nCena 3 (3s): Destaque: ${p1}.\nCena 4 (3s): ${p2 !== "acabamentos de qualidade" ? `Destaque: ${p2}.` : "Pormenores de qualidade e acabamento."}\nCena 5 (3s): Texto: "${tl} em ${loc}" + contacto. Música suave e profissional.`,
    };
  }
}

const GEN_PHASES = [
  "A analisar características do imóvel…",
  "A identificar pontos de diferenciação…",
  "A criar título comercial…",
  "A gerar conteúdo para redes sociais…",
  "A adaptar ao tom de comunicação…",
  "Pack de promoção completo gerado ✓",
];

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
  type GenState = "form" | "generating" | "results";
  const [genState, setGenState] = useState<GenState>("form");
  const [form, setForm] = useState<GenForm>({ tipo: "t3", local: "", preco: "", pontos: "", tom: "premium" });
  const [pack, setPack] = useState<GeneratedPack | null>(null);
  const [phase, setPhase] = useState(0);
  const [activePhases, setActivePhases] = useState<string[]>(GEN_PHASES);
  const [streamedTitulo, setStreamedTitulo] = useState("");
  const [visibleCards, setVisibleCards] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPhotoUrls(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [photos]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPhotos((prev) => [...prev, ...imgs].slice(0, 12));
  };

  const handleGenerate = () => {
    if (!form.local.trim()) return;
    const hasPhotos = photos.length > 0;
    const phases = hasPhotos
      ? [`A analisar ${photos.length} fotografia${photos.length > 1 ? "s" : ""} enviada${photos.length > 1 ? "s" : ""}…`, ...GEN_PHASES]
      : GEN_PHASES;
    setActivePhases(phases);
    setGenState("generating");
    setPhase(0);

    phases.forEach((_, i) => {
      setTimeout(() => setPhase(i), i * 420);
    });

    setTimeout(() => {
      const result = buildPack(form);
      // Enrich result with photo mention when images were provided
      const enriched: GeneratedPack = hasPhotos
        ? {
            ...result,
            instagram: `📸 ${photos.length} fotografia${photos.length > 1 ? "s" : ""} cuidadosamente selecionada${photos.length > 1 ? "s" : ""} para mostrar o melhor deste imóvel.\n\n` + result.instagram,
            portal: result.portal + `\n\nImóvel documentado com ${photos.length} fotografia${photos.length > 1 ? "s" : ""} profissionais disponíveis para consulta.`,
          }
        : result;
      setPack(enriched);
      setStreamedTitulo("");
      setVisibleCards(0);
      setGenState("results");

      let idx = 0;
      const ti = setInterval(() => {
        idx++;
        setStreamedTitulo(enriched.titulo.slice(0, idx));
        if (idx >= enriched.titulo.length) clearInterval(ti);
      }, 25);

      [1, 2, 3, 4, 5, 6].forEach((n) => {
        setTimeout(() => setVisibleCards(n), n * 200);
      });
    }, phases.length * 420 + 400);
  };

  const handleCopy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReset = () => {
    setGenState("form");
    setPack(null);
    setStreamedTitulo("");
    setVisibleCards(0);
    setPhotos([]);
  };

  const TIPO_OPTIONS = [
    { id: "t0", label: "T0/Studio" },
    { id: "t1", label: "T1" },
    { id: "t2", label: "T2" },
    { id: "t3", label: "T3" },
    { id: "t4", label: "T4+" },
    { id: "villa", label: "Moradia" },
  ] as const;

  const TOM_OPTIONS = [
    { id: "premium", label: "Premium" },
    { id: "luxury", label: "Luxo" },
    { id: "family", label: "Família" },
    { id: "young", label: "Jovem" },
    { id: "direct", label: "Direto" },
    { id: "investment", label: "Investimento" },
  ] as const;

  const RESULT_CARDS = pack
    ? [
        { key: "titulo", label: "Título comercial", icon: Sparkles, text: streamedTitulo, full: pack.titulo, isTitle: true },
        { key: "instagram", label: "Instagram / Facebook", icon: MessageSquare, text: pack.instagram, full: pack.instagram, isTitle: false },
        { key: "portal", label: "Descrição de portal", icon: Globe, text: pack.portal, full: pack.portal, isTitle: false },
        { key: "whatsapp", label: "Mensagem WhatsApp", icon: Phone, text: pack.whatsapp, full: pack.whatsapp, isTitle: false },
        { key: "hashtags", label: "Hashtags", icon: Hash, text: pack.hashtags, full: pack.hashtags, isTitle: false },
        { key: "reel", label: "Script para Reel", icon: Video, text: pack.reel, full: pack.reel, isTitle: false },
      ]
    : [];

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur lg:px-8">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">Estúdio de Marketing AI</h1>
          <p className="text-sm text-muted-foreground">
            {genState === "results" ? "Pack de promoção gerado com sucesso." : "Preenche os dados do imóvel e gera um pack de promoção completo."}
          </p>
        </div>
        {genState === "results" && (
          <button
            onClick={handleReset}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          >
            <RefreshCw className="size-3.5" /> Novo imóvel
          </button>
        )}
        {genState === "form" && (
          <Badge variant="secondary" className="shrink-0">Modo demonstração</Badge>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* ── Form state ─────────────────────────────────────────── */}
        {genState === "form" && (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-primary" />
                  Gerar Pack de Promoção AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Tipologia */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Tipologia</p>
                  <div className="flex flex-wrap gap-2">
                    {TIPO_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, tipo: t.id }))}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                          form.tipo === t.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Localização <span className="text-destructive">*</span>
                  </p>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="ex: Alfama, Lisboa"
                      value={form.local}
                      onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Preço */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Preço <span className="text-xs text-muted-foreground">(opcional)</span></p>
                  <input
                    type="text"
                    placeholder="ex: 450000"
                    value={form.preco}
                    onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Pontos fortes */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Pontos fortes <span className="text-xs text-muted-foreground">(separados por vírgulas)</span>
                  </p>
                  <textarea
                    placeholder="ex: vista rio, remodelado, piscina, garagem, luminoso"
                    value={form.pontos}
                    onChange={(e) => setForm((f) => ({ ...f, pontos: e.target.value }))}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Tom */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Tom de comunicação</p>
                  <div className="flex flex-wrap gap-2">
                    {TOM_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, tom: t.id }))}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                          form.tom === t.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Fotografias{" "}
                    <span className="text-xs text-muted-foreground">(opcional — melhora o resultado)</span>
                  </p>

                  {/* Drop zone */}
                  <label
                    htmlFor="preview-photo-upload"
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); addPhotos(e.dataTransfer.files); }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <Upload className="size-6" />
                    <span className="font-medium">Clique ou arraste as fotos aqui</span>
                    <span className="text-xs opacity-70">JPEG · PNG · HEIC · até 12 fotos</span>
                    <input
                      id="preview-photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => addPhotos(e.target.files)}
                    />
                  </label>

                  {/* Thumbnails */}
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {photoUrls.map((url, i) => (
                        <div key={i} className="group relative size-20 overflow-hidden rounded-lg border border-border bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="size-4 text-white" />
                          </button>
                        </div>
                      ))}
                      <label
                        htmlFor="preview-photo-upload-more"
                        className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <ImagePlus className="size-4" />
                        <span className="text-[10px]">Mais</span>
                        <input
                          id="preview-photo-upload-more"
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => addPhotos(e.target.files)}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!form.local.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="size-4" />
                  {photos.length > 0 ? `Gerar Pack com ${photos.length} Foto${photos.length > 1 ? "s" : ""}` : "Gerar Pack de Promoção"}
                </button>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              Este gerador simula a IA do ImoBoost em modo demonstração — na versão real, a IA analisa também as fotos e documentos do imóvel.
            </p>
          </div>
        )}

        {/* ── Generating state ────────────────────────────────────── */}
        {genState === "generating" && (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-8 py-16">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="size-8 animate-spin" />
            </div>
            <div className="w-full space-y-2">
              {activePhases.map((label, i) => {
                const done = i < phase || (i === phase && i === activePhases.length - 1);
                const current = i === phase && i < activePhases.length - 1;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-300",
                      done ? "text-emerald-600" : current ? "font-medium text-foreground" : "text-muted-foreground/40"
                    )}
                  >
                    <div className="size-5 shrink-0 flex items-center justify-center">
                      {done ? (
                        <Check className="size-5 text-emerald-500" />
                      ) : current ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <div className="size-3.5 rounded-full border-2 border-current" />
                      )}
                    </div>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Results state ────────────────────────────────────────── */}
        {genState === "results" && pack && (
          <div className="mx-auto max-w-3xl space-y-4">
            {RESULT_CARDS.map((card, idx) => {
              const Icon = card.icon;
              const isVisible = idx < visibleCards;
              return (
                <div
                  key={card.key}
                  style={{ transitionDelay: `${idx * 60}ms` }}
                  className={cn(
                    "rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="size-4 text-primary" />
                      {card.label}
                    </div>
                    <button
                      onClick={() => handleCopy(card.full, card.key)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      {copied === card.key ? (
                        <><Check className="size-3 text-emerald-500" /> Copiado</>
                      ) : (
                        <><Copy className="size-3" /> Copiar</>
                      )}
                    </button>
                  </div>
                  <p className={cn(
                    "whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed",
                    card.isTitle && "text-base font-semibold text-foreground"
                  )}>
                    {card.text}
                    {card.isTitle && card.text.length < card.full.length && (
                      <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                    )}
                  </p>
                </div>
              );
            })}

            {visibleCards >= 6 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Gostou do resultado?</p>
                    <p className="text-xs text-muted-foreground">
                      Na versão real, a IA analisa fotos, gera variantes e publica diretamente nos portais e redes sociais.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="ml-auto shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Criar conta
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
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
