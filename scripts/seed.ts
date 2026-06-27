// Seeds the "Albi Imobiliária" demo agency: the Supabase Auth user backing
// lib/demo.ts's DEMO_CREDENTIALS, a small team covering every role, and a
// realistic set of properties/contacts/tasks/commissions/schedules/feed
// posts so the demo mode has something to look at.
//
// Usage: npm run seed
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service
// role key bypasses RLS — never expose it to the browser). Safe to re-run:
// every row uses a deterministic id and is upserted.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { DEMO_AGENCY_NAME, DEMO_CREDENTIALS } from "../lib/demo";
import { formatCurrency } from "../lib/format";
import type {
  CommissionStatus,
  ContactInterest,
  ContactSource,
  ContactStatus,
  ContactType,
  FeedPostType,
  PropertyCondition,
  PropertyType,
  ShiftType,
  TaskPriority,
  TaskStatus,
  TaskType,
  UserRole,
} from "../lib/types/domain";

function loadEnvFile(filename: string): void {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in .env.local (see .env.example) before running `npm run seed`."
  );
  process.exit(1);
}

const SEED_PASSWORD = DEMO_CREDENTIALS.password;

// Deterministic UUID v5-style id, so re-running this script upserts the same
// rows instead of duplicating the demo dataset.
function id(name: string): string {
  const hash = createHash("sha1").update(`imoboost-ai-seed:${name}`).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function mondayOfThisWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getOrCreateAuthUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  fullName: string
): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (!error && data.user) return data.user.id;
  if (error && !/already.*registered/i.test(error.message)) throw error;

  for (let page = 1; ; page += 1) {
    const { data: list, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listError) throw listError;

    const match = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (list.users.length < 200) break;
  }

  throw new Error(`Could not find or create auth user for ${email}`);
}

interface TeamMember {
  key: string;
  email: string;
  fullName: string;
  role: UserRole;
}

const TEAM: TeamMember[] = [
  { key: "beatriz", email: DEMO_CREDENTIALS.email, fullName: "Beatriz Albi", role: "admin" },
  { key: "rui", email: "rui.mendes@imoboost.ai", fullName: "Rui Mendes", role: "coordinator" },
  { key: "marta", email: "marta.sousa@imoboost.ai", fullName: "Marta Sousa", role: "agent" },
  { key: "joao", email: "joao.pereira@imoboost.ai", fullName: "João Pereira", role: "agent" },
  { key: "carla", email: "carla.nogueira@imoboost.ai", fullName: "Carla Nogueira", role: "marketing" },
];

interface PropertySeed {
  key: string;
  title: string;
  commercialTitle: string | null;
  location: string;
  price: number;
  propertyType: PropertyType;
  dealType: "sale" | "rent";
  bedrooms: number;
  bathrooms: number;
  usefulArea: number | null;
  grossArea: number | null;
  hasGarage: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  condition: PropertyCondition;
  energyCertificate: string | null;
  description: string;
  targetAudience: string[];
  strengths: string | null;
  weaknesses: string | null;
  tone: "premium" | "luxury" | "young" | "family" | "direct" | "investment";
  status: "active" | "reserved" | "sold";
  createdBy: string;
}

const PROPERTIES: PropertySeed[] = [
  {
    key: "t3-lisboa",
    title: "Apartamento T3 com vista rio",
    commercialTitle: "Vista Rio Deslumbrante no Coração de Alcântara",
    location: "Alcântara, Lisboa",
    price: 485000,
    propertyType: "t3",
    dealType: "sale",
    bedrooms: 3,
    bathrooms: 2,
    usefulArea: 120,
    grossArea: 135,
    hasGarage: true,
    hasGarden: false,
    hasPool: false,
    condition: "renovated",
    energyCertificate: "B",
    description:
      "Apartamento totalmente renovado com vista desafogada sobre o rio Tejo. Cozinha equipada, varanda ampla e excelente exposição solar. A dois minutos da Doca de Alcântara.",
    targetAudience: ["familia", "jovem_casal"],
    strengths: "Vista rio, renovado, garagem incluída",
    weaknesses: "Sem elevador no prédio",
    tone: "premium",
    status: "active",
    createdBy: "rui",
  },
  {
    key: "villa-cascais",
    title: "Moradia V4 com piscina",
    commercialTitle: "Refúgio de Luxo a Minutos da Praia de Cascais",
    location: "Cascais",
    price: 950000,
    propertyType: "villa",
    dealType: "sale",
    bedrooms: 4,
    bathrooms: 4,
    usefulArea: 320,
    grossArea: 380,
    hasGarage: true,
    hasGarden: true,
    hasPool: true,
    condition: "as_new",
    energyCertificate: "A",
    description:
      "Moradia isolada com piscina privada, jardim maduro e acabamentos de excelência. Localização sossegada a 5 minutos do centro de Cascais e das melhores praias da linha.",
    targetAudience: ["luxo", "familia", "estrangeiro"],
    strengths: "Piscina privada, jardim, localização premium",
    weaknesses: null,
    tone: "luxury",
    status: "active",
    createdBy: "joao",
  },
  {
    key: "t1-porto",
    title: "Apartamento T1 renovado em Cedofeita",
    commercialTitle: null,
    location: "Cedofeita, Porto",
    price: 175000,
    propertyType: "t1",
    dealType: "sale",
    bedrooms: 1,
    bathrooms: 1,
    usefulArea: 55,
    grossArea: 60,
    hasGarage: false,
    hasGarden: false,
    hasPool: false,
    condition: "renovated",
    energyCertificate: "C",
    description:
      "T1 completamente remodelado em 2024, no coração de Cedofeita. Ideal para investimento ou primeira habitação. Excelentes acessos e comércio local.",
    targetAudience: ["jovem_casal", "investidor", "estudante"],
    strengths: "Remodelado, localização central",
    weaknesses: null,
    tone: "young",
    status: "reserved",
    createdBy: "marta",
  },
  {
    key: "t2-braga",
    title: "T2 para arrendar em Braga",
    commercialTitle: null,
    location: "Braga",
    price: 750,
    propertyType: "t2",
    dealType: "rent",
    bedrooms: 2,
    bathrooms: 1,
    usefulArea: 80,
    grossArea: 85,
    hasGarage: false,
    hasGarden: false,
    hasPool: false,
    condition: "used",
    energyCertificate: "D",
    description:
      "Apartamento T2 bem localizado, próximo do centro histórico de Braga e de transportes públicos. Pronto a habitar.",
    targetAudience: ["familia", "jovem_casal"],
    strengths: "Localização central, pronto a habitar",
    weaknesses: null,
    tone: "family",
    status: "active",
    createdBy: "joao",
  },
  {
    key: "loft-setubal",
    title: "Loft T0 moderno em Setúbal",
    commercialTitle: null,
    location: "Setúbal",
    price: 120000,
    propertyType: "studio",
    dealType: "sale",
    bedrooms: 0,
    bathrooms: 1,
    usefulArea: 38,
    grossArea: 40,
    hasGarage: false,
    hasGarden: false,
    hasPool: false,
    condition: "new",
    energyCertificate: "A",
    description:
      "Loft compacto e funcional, acabamentos modernos, ideal para investimento em arrendamento de curta duração.",
    targetAudience: ["investidor", "jovem_casal"],
    strengths: "Acabamentos modernos, baixo custo de manutenção",
    weaknesses: null,
    tone: "direct",
    status: "sold",
    createdBy: "rui",
  },
  {
    key: "quinta-sintra",
    title: "Quinta com terreno em Sintra",
    commercialTitle: null,
    location: "Sintra",
    price: 620000,
    propertyType: "land",
    dealType: "sale",
    bedrooms: 0,
    bathrooms: 0,
    usefulArea: null,
    grossArea: null,
    hasGarage: false,
    hasGarden: false,
    hasPool: false,
    condition: "to_renovate",
    energyCertificate: null,
    description:
      "Quinta com cerca de 2 hectares, casa de pedra para recuperar e vista sobre a serra de Sintra. Potencial para turismo rural ou habitação.",
    targetAudience: ["investidor", "luxo"],
    strengths: "Terreno amplo, vista serra, potencial turístico",
    weaknesses: "Casa precisa de obra profunda",
    tone: "investment",
    status: "active",
    createdBy: "beatriz",
  },
];

interface ContactSeed {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  type: ContactType;
  source: ContactSource;
  interest: ContactInterest;
  budget: number | null;
  desiredLocation: string | null;
  desiredTypology: PropertyType | null;
  status: ContactStatus;
  notes: string | null;
  nextAction: string | null;
  relatedProperty: string | null;
  owner: string;
  gdprConsent: boolean;
}

const CONTACTS: ContactSeed[] = [
  {
    key: "sofia",
    name: "Sofia Martins",
    phone: "+351 912 345 678",
    email: "sofia.martins@example.com",
    type: "buyer",
    source: "instagram",
    interest: "buy",
    budget: 500000,
    desiredLocation: "Lisboa",
    desiredTypology: "t3",
    status: "visit_scheduled",
    notes: "Muito interessada na vista rio, quer levar o marido a uma segunda visita.",
    nextAction: "Agendar 2ª visita para o fim de semana",
    relatedProperty: "t3-lisboa",
    owner: "marta",
    gdprConsent: true,
  },
  {
    key: "tiago",
    name: "Tiago Ferreira",
    phone: "+351 933 222 111",
    email: "tiago.ferreira@example.com",
    type: "buyer",
    source: "idealista",
    interest: "buy",
    budget: 1000000,
    desiredLocation: "Cascais",
    desiredTypology: "villa",
    status: "negotiation",
    notes: "Já fez proposta inicial, a negociar condições de pagamento.",
    nextAction: "Confirmar resposta à contraproposta",
    relatedProperty: "villa-cascais",
    owner: "joao",
    gdprConsent: true,
  },
  {
    key: "ana",
    name: "Ana Rodrigues",
    phone: "+351 925 555 333",
    email: "ana.rodrigues@example.com",
    type: "buyer",
    source: "website",
    interest: "buy",
    budget: 200000,
    desiredLocation: "Porto",
    desiredTypology: "t1",
    status: "closed",
    notes: "Negócio fechado, à espera da escritura.",
    nextAction: "Agendar escritura",
    relatedProperty: "t1-porto",
    owner: "marta",
    gdprConsent: true,
  },
  {
    key: "pedro",
    name: "Pedro Lopes",
    phone: "+351 916 777 444",
    email: null,
    type: "tenant",
    source: "whatsapp",
    interest: "rent",
    budget: 800,
    desiredLocation: "Braga",
    desiredTypology: "t2",
    status: "contacted",
    notes: null,
    nextAction: "Confirmar disponibilidade para visita",
    relatedProperty: "t2-braga",
    owner: "joao",
    gdprConsent: true,
  },
  {
    key: "helena",
    name: "Helena Costa",
    phone: "+351 967 888 222",
    email: "helena.costa@example.com",
    type: "seller",
    source: "referral",
    interest: "sell",
    budget: null,
    desiredLocation: "Setúbal",
    desiredTypology: null,
    status: "closed",
    notes: "Vendeu o loft, processo concluído.",
    nextAction: null,
    relatedProperty: "loft-setubal",
    owner: "rui",
    gdprConsent: true,
  },
  {
    key: "miguel",
    name: "Miguel Alves",
    phone: "+351 938 111 999",
    email: "miguel.alves@example.com",
    type: "investor",
    source: "facebook",
    interest: "invest",
    budget: 700000,
    desiredLocation: "Sintra",
    desiredTypology: "land",
    status: "qualified",
    notes: "Procura terrenos com potencial turístico.",
    nextAction: "Enviar dossier da Quinta de Sintra",
    relatedProperty: "quinta-sintra",
    owner: "marta",
    gdprConsent: false,
  },
  {
    key: "claudia",
    name: "Cláudia Nunes",
    phone: "+351 921 444 555",
    email: null,
    type: "buyer",
    source: "walk_in",
    interest: "buy",
    budget: 300000,
    desiredLocation: "Lisboa",
    desiredTypology: null,
    status: "new",
    notes: "Passou pela loja, ainda sem critérios definidos.",
    nextAction: "Ligar para perceber preferências",
    relatedProperty: null,
    owner: "joao",
    gdprConsent: false,
  },
  {
    key: "ricardo",
    name: "Ricardo Teixeira",
    phone: "+351 910 222 888",
    email: "ricardo.teixeira@example.com",
    type: "partner",
    source: "phone_call",
    interest: "invest",
    budget: null,
    desiredLocation: null,
    desiredTypology: null,
    status: "lost",
    notes: "Optou por outra agência.",
    nextAction: null,
    relatedProperty: null,
    owner: "rui",
    gdprConsent: true,
  },
  {
    key: "beatrizg",
    name: "Beatriz Gomes",
    phone: "+351 939 666 222",
    email: "beatriz.gomes@example.com",
    type: "tenant",
    source: "instagram",
    interest: "rent",
    budget: 900,
    desiredLocation: "Braga",
    desiredTypology: "t2",
    status: "proposal_sent",
    notes: "Proposta de arrendamento enviada, aguarda resposta do proprietário.",
    nextAction: "Follow-up em 48h",
    relatedProperty: "t2-braga",
    owner: "joao",
    gdprConsent: true,
  },
];

interface TaskSeed {
  key: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  type: TaskType;
  status: TaskStatus;
  dueOffsetDays: number;
  assignedTo: string;
  createdBy: string;
  contact: string | null;
  property: string | null;
}

const TASKS: TaskSeed[] = [
  {
    key: "call-sofia",
    title: "Ligar para Sofia Martins",
    description: "Confirmar detalhes da 2ª visita ao apartamento.",
    priority: "high",
    type: "call",
    status: "pending",
    dueOffsetDays: 0,
    assignedTo: "marta",
    createdBy: "marta",
    contact: "sofia",
    property: null,
  },
  {
    key: "visit-cascais",
    title: "Visita — Moradia em Cascais",
    description: "Acompanhar o Tiago Ferreira na visita à moradia.",
    priority: "high",
    type: "visit",
    status: "pending",
    dueOffsetDays: 1,
    assignedTo: "joao",
    createdBy: "joao",
    contact: "tiago",
    property: "villa-cascais",
  },
  {
    key: "doc-ana",
    title: "Preparar documentação — Ana Rodrigues",
    description: "Reunir documentos para a escritura do T1 no Porto.",
    priority: "medium",
    type: "documentation",
    status: "completed",
    dueOffsetDays: -1,
    assignedTo: "marta",
    createdBy: "rui",
    contact: "ana",
    property: "t1-porto",
  },
  {
    key: "followup-pedro",
    title: "Follow-up Pedro Lopes",
    description: "Confirmar disponibilidade para visitar o T2 em Braga.",
    priority: "medium",
    type: "follow_up",
    status: "pending",
    dueOffsetDays: 3,
    assignedTo: "joao",
    createdBy: "joao",
    contact: "pedro",
    property: "t2-braga",
  },
  {
    key: "listing-sintra",
    title: "Angariação — Quinta em Sintra",
    description: "Validar limites do terreno e regularizar documentação da quinta.",
    priority: "urgent",
    type: "listing",
    status: "in_progress",
    dueOffsetDays: 0,
    assignedTo: "rui",
    createdBy: "beatriz",
    contact: null,
    property: "quinta-sintra",
  },
  {
    key: "publish-braga",
    title: "Publicar T2 de Braga nos portais",
    description: "Atualizar fotos e publicar o anúncio no Idealista e no site.",
    priority: "low",
    type: "publication",
    status: "pending",
    dueOffsetDays: 2,
    assignedTo: "carla",
    createdBy: "carla",
    contact: null,
    property: "t2-braga",
  },
  {
    key: "meeting-team",
    title: "Reunião de equipa semanal",
    description: "Rever pipeline comercial e prioridades da semana.",
    priority: "medium",
    type: "meeting",
    status: "pending",
    dueOffsetDays: 1,
    assignedTo: "beatriz",
    createdBy: "beatriz",
    contact: null,
    property: null,
  },
  {
    key: "followup-miguel",
    title: "Follow-up Miguel Alves",
    description: "Enviar dossier da Quinta de Sintra.",
    priority: "high",
    type: "follow_up",
    status: "pending",
    dueOffsetDays: 0,
    assignedTo: "marta",
    createdBy: "marta",
    contact: "miguel",
    property: "quinta-sintra",
  },
  {
    key: "close-helena",
    title: "Fecho de negócio — Helena Costa",
    description: "Tratar da entrega de chaves e assinatura final.",
    priority: "high",
    type: "documentation",
    status: "completed",
    dueOffsetDays: -5,
    assignedTo: "rui",
    createdBy: "rui",
    contact: "helena",
    property: "loft-setubal",
  },
  {
    key: "call-claudia",
    title: "Contactar Cláudia Nunes",
    description: "Perceber critérios de procura e orçamento.",
    priority: "medium",
    type: "call",
    status: "pending",
    dueOffsetDays: 1,
    assignedTo: "joao",
    createdBy: "joao",
    contact: "claudia",
    property: null,
  },
];

interface CommissionSeed {
  key: string;
  property: string;
  agent: string;
  propertyValue: number;
  agencyPct: number;
  agentPct: number;
  status: CommissionStatus;
  expectedCloseOffsetDays: number;
}

const COMMISSIONS: CommissionSeed[] = [
  { key: "t3-lisboa", property: "t3-lisboa", agent: "marta", propertyValue: 485000, agencyPct: 5, agentPct: 50, status: "expected", expectedCloseOffsetDays: 20 },
  { key: "villa-cascais", property: "villa-cascais", agent: "joao", propertyValue: 950000, agencyPct: 5, agentPct: 55, status: "negotiating", expectedCloseOffsetDays: 30 },
  { key: "t1-porto", property: "t1-porto", agent: "marta", propertyValue: 175000, agencyPct: 5, agentPct: 50, status: "closed", expectedCloseOffsetDays: -5 },
  { key: "loft-setubal", property: "loft-setubal", agent: "rui", propertyValue: 120000, agencyPct: 6, agentPct: 50, status: "paid", expectedCloseOffsetDays: -10 },
  { key: "quinta-sintra", property: "quinta-sintra", agent: "marta", propertyValue: 620000, agencyPct: 5, agentPct: 50, status: "expected", expectedCloseOffsetDays: 45 },
];

const SHIFTS: ShiftType[] = ["on_duty", "visits", "store", "prospecting", "rest"];

interface FeedPostSeed {
  key: string;
  type: FeedPostType;
  title: string;
  content: string;
  author: string;
  relatedProperty: string | null;
  isPinned: boolean;
  isFeatured: boolean;
}

async function main() {
  const admin = createClient(SUPABASE_URL as string, SERVICE_ROLE_KEY as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Seeding agency "${DEMO_AGENCY_NAME}"...`);
  const agencyId = id("agency:albi-imobiliaria");
  const { error: agencyError } = await admin
    .from("agencies")
    .upsert({ id: agencyId, name: DEMO_AGENCY_NAME, primary_color: "#0e3d39" }, { onConflict: "id" });
  if (agencyError) throw agencyError;

  console.log("Creating team (Supabase Auth users + profiles)...");
  const profileIdByKey = new Map<string, string>();
  for (const member of TEAM) {
    const userId = await getOrCreateAuthUser(admin, member.email, SEED_PASSWORD, member.fullName);
    profileIdByKey.set(member.key, userId);

    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        agency_id: agencyId,
        full_name: member.fullName,
        email: member.email,
        role: member.role,
      },
      { onConflict: "id" }
    );
    if (error) throw error;
  }

  console.log("Seeding properties + photos...");
  const propertyIdByKey = new Map<string, string>();
  for (const property of PROPERTIES) {
    const propertyId = id(`property:${property.key}`);
    propertyIdByKey.set(property.key, propertyId);

    const coverUrl = `https://picsum.photos/seed/imoboost-${property.key}-1/1200/800`;
    const { error } = await admin.from("properties").upsert(
      {
        id: propertyId,
        agency_id: agencyId,
        created_by: profileIdByKey.get(property.createdBy) ?? null,
        title: property.title,
        commercial_title: property.commercialTitle,
        location: property.location,
        price: property.price,
        property_type: property.propertyType,
        deal_type: property.dealType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        useful_area: property.usefulArea,
        gross_area: property.grossArea,
        has_garage: property.hasGarage,
        has_garden: property.hasGarden,
        has_pool: property.hasPool,
        condition: property.condition,
        energy_certificate: property.energyCertificate,
        description: property.description,
        target_audience: property.targetAudience,
        strengths: property.strengths,
        weaknesses: property.weaknesses,
        tone: property.tone,
        status: property.status,
        cover_image_url: coverUrl,
      },
      { onConflict: "id" }
    );
    if (error) throw error;

    const images = [
      { suffix: "1", label: "main", isMain: true },
      { suffix: "2", label: "exterior", isMain: false },
    ] as const;

    const { error: imagesError } = await admin.from("property_images").upsert(
      images.map((image) => ({
        id: id(`property-image:${property.key}:${image.suffix}`),
        property_id: propertyId,
        agency_id: agencyId,
        url: `https://picsum.photos/seed/imoboost-${property.key}-${image.suffix}/1200/800`,
        label: image.label,
        is_main: image.isMain,
        status: "approved",
      })),
      { onConflict: "id" }
    );
    if (imagesError) throw imagesError;
  }

  console.log("Seeding marketing campaigns...");
  const campaigns = [
    {
      key: "t3-lisboa",
      property: "t3-lisboa",
      title: "Pack de Promoção — Apartamento T3 com vista rio",
      status: "ready" as const,
      createdBy: "rui",
      assets: [
        { type: "commercial_title" as const, title: "Título comercial", content: "Vista Rio Deslumbrante no Coração de Alcântara" },
        {
          type: "instagram_caption" as const,
          title: "Legenda Instagram",
          content:
            "🏙️ Vista rio todos os dias. Apartamento T3 renovado em Alcântara, a dois minutos da Doca. Agenda já a tua visita! #Lisboa #Alcântara #ImoBoost",
        },
      ],
    },
    {
      key: "villa-cascais",
      property: "villa-cascais",
      title: "Pack de Promoção — Moradia V4 em Cascais",
      status: "approved" as const,
      createdBy: "joao",
      assets: [
        { type: "commercial_title" as const, title: "Título comercial", content: "Refúgio de Luxo a Minutos da Praia de Cascais" },
        {
          type: "instagram_caption" as const,
          title: "Legenda Instagram",
          content:
            "✨ Piscina privada, jardim e a poucos minutos da praia. Esta moradia V4 em Cascais é o refúgio que procuras. Marca já a tua visita exclusiva. #Cascais #Luxo #ImoBoost",
        },
      ],
    },
  ];

  for (const campaign of campaigns) {
    const campaignId = id(`campaign:${campaign.key}`);
    const { error } = await admin.from("campaigns").upsert(
      {
        id: campaignId,
        agency_id: agencyId,
        property_id: propertyIdByKey.get(campaign.property),
        created_by: profileIdByKey.get(campaign.createdBy) ?? null,
        title: campaign.title,
        status: campaign.status,
        generated_content: {},
      },
      { onConflict: "id" }
    );
    if (error) throw error;

    const { error: assetsError } = await admin.from("campaign_assets").upsert(
      campaign.assets.map((asset, index) => ({
        id: id(`campaign-asset:${campaign.key}:${index}`),
        agency_id: agencyId,
        campaign_id: campaignId,
        type: asset.type,
        title: asset.title,
        content: asset.content,
        status: "approved",
      })),
      { onConflict: "id" }
    );
    if (assetsError) throw assetsError;
  }

  console.log("Seeding contacts...");
  const contactIdByKey = new Map<string, string>();
  for (const contact of CONTACTS) {
    const contactId = id(`contact:${contact.key}`);
    contactIdByKey.set(contact.key, contactId);

    const { error } = await admin.from("contacts").upsert(
      {
        id: contactId,
        agency_id: agencyId,
        owner_id: profileIdByKey.get(contact.owner) ?? null,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        type: contact.type,
        source: contact.source,
        interest: contact.interest,
        budget: contact.budget,
        desired_location: contact.desiredLocation,
        desired_typology: contact.desiredTypology,
        status: contact.status,
        notes: contact.notes,
        next_action: contact.nextAction,
        related_property_id: contact.relatedProperty ? propertyIdByKey.get(contact.relatedProperty) : null,
        gdpr_consent: contact.gdprConsent,
      },
      { onConflict: "id" }
    );
    if (error) throw error;
  }

  console.log("Seeding tasks...");
  for (const task of TASKS) {
    const { error } = await admin.from("tasks").upsert(
      {
        id: id(`task:${task.key}`),
        agency_id: agencyId,
        assigned_to: profileIdByKey.get(task.assignedTo) ?? null,
        created_by: profileIdByKey.get(task.createdBy) ?? null,
        contact_id: task.contact ? contactIdByKey.get(task.contact) : null,
        property_id: task.property ? propertyIdByKey.get(task.property) : null,
        title: task.title,
        description: task.description,
        priority: task.priority,
        type: task.type,
        due_date: daysFromNow(task.dueOffsetDays),
        status: task.status,
      },
      { onConflict: "id" }
    );
    if (error) throw error;
  }

  console.log("Seeding commissions...");
  for (const commission of COMMISSIONS) {
    const { error } = await admin.from("commissions").upsert(
      {
        id: id(`commission:${commission.key}`),
        agency_id: agencyId,
        agent_id: profileIdByKey.get(commission.agent) ?? null,
        property_id: propertyIdByKey.get(commission.property),
        property_value: commission.propertyValue,
        agency_commission_percentage: commission.agencyPct,
        agent_percentage: commission.agentPct,
        status: commission.status,
        expected_close_date: daysFromNow(commission.expectedCloseOffsetDays),
      },
      { onConflict: "id" }
    );
    if (error) throw error;
  }

  console.log("Seeding this week's schedule...");
  const monday = mondayOfThisWeek();
  const teamKeys = TEAM.map((member) => member.key);
  const schedules = [];
  for (let p = 0; p < teamKeys.length; p += 1) {
    for (let day = 0; day < 5; day += 1) {
      const date = new Date(monday);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().slice(0, 10);
      const shiftType = SHIFTS[(p + day) % SHIFTS.length];
      schedules.push({
        id: id(`schedule:${teamKeys[p]}:${dateStr}`),
        agency_id: agencyId,
        user_id: profileIdByKey.get(teamKeys[p]),
        date: dateStr,
        shift_type: shiftType,
      });
    }
  }
  const { error: schedulesError } = await admin.from("schedules").upsert(schedules, { onConflict: "id" });
  if (schedulesError) throw schedulesError;

  console.log("Seeding feed posts...");
  const setubalDealValue = formatCurrency(120000);
  const feedPosts: FeedPostSeed[] = [
    {
      key: "welcome",
      type: "management_notice",
      title: "Bem-vindos ao ImoBoost AI",
      content:
        "A partir de hoje toda a equipa passa a usar o ImoBoost AI para gerir imóveis, leads e comunicação interna. Qualquer dúvida, fala comigo!",
      author: "beatriz",
      relatedProperty: null,
      isPinned: true,
      isFeatured: false,
    },
    {
      key: "new-agent",
      type: "new_agent",
      title: "Novo agente na equipa: João Pereira",
      content: "Juntem-se a nós a dar as boas-vindas ao João, que reforça a equipa comercial a partir desta semana.",
      author: "beatriz",
      relatedProperty: null,
      isPinned: false,
      isFeatured: false,
    },
    {
      key: "featured-cascais",
      type: "featured_property",
      title: "Destaque: Moradia V4 com piscina em Cascais",
      content: "Um dos imóveis mais exclusivos da nossa carteira. Partilhem com os vossos contactos!",
      author: "joao",
      relatedProperty: "villa-cascais",
      isPinned: false,
      isFeatured: true,
    },
    {
      key: "sale-setubal",
      type: "sale_achievement",
      title: "Negócio fechado: Loft T0 moderno em Setúbal",
      content: `Rui Mendes fechou o negócio "Loft T0 moderno em Setúbal", no valor de ${setubalDealValue}. Parabéns!`,
      author: "rui",
      relatedProperty: "loft-setubal",
      isPinned: false,
      isFeatured: false,
    },
    {
      key: "openhouse-sintra",
      type: "open_house",
      title: "Casa aberta este sábado — Quinta em Sintra",
      content: "Vamos receber visitas sem marcação prévia este sábado entre as 14h e as 17h. Tragam os vossos clientes investidores!",
      author: "marta",
      relatedProperty: "quinta-sintra",
      isPinned: false,
      isFeatured: false,
    },
    {
      key: "training",
      type: "training",
      title: "Formação: Como usar o Estúdio de Marketing AI",
      content: "Quinta-feira às 10h, sessão prática sobre como gerar packs de promoção completos em minutos.",
      author: "carla",
      relatedProperty: null,
      isPinned: false,
      isFeatured: false,
    },
  ];

  const postIdByKey = new Map<string, string>();
  for (const post of feedPosts) {
    const postId = id(`feed-post:${post.key}`);
    postIdByKey.set(post.key, postId);

    const { error } = await admin.from("feed_posts").upsert(
      {
        id: postId,
        agency_id: agencyId,
        author_id: profileIdByKey.get(post.author) ?? null,
        type: post.type,
        title: post.title,
        content: post.content,
        related_property_id: post.relatedProperty ? propertyIdByKey.get(post.relatedProperty) : null,
        is_pinned: post.isPinned,
        is_featured: post.isFeatured,
      },
      { onConflict: "id" }
    );
    if (error) throw error;
  }

  console.log("Seeding feed likes + comments...");
  const likes = [
    { post: "welcome", user: "rui" },
    { post: "welcome", user: "marta" },
    { post: "welcome", user: "joao" },
    { post: "sale-setubal", user: "beatriz" },
    { post: "sale-setubal", user: "carla" },
  ];
  const { error: likesError } = await admin.from("feed_likes").upsert(
    likes.map((like) => ({
      id: id(`feed-like:${like.post}:${like.user}`),
      agency_id: agencyId,
      post_id: postIdByKey.get(like.post),
      user_id: profileIdByKey.get(like.user),
    })),
    { onConflict: "id" }
  );
  if (likesError) throw likesError;

  const comments = [
    { post: "welcome", user: "marta", content: "Excelente iniciativa!" },
    { post: "sale-setubal", user: "joao", content: "Parabéns Rui, grande negócio!" },
    { post: "sale-setubal", user: "carla", content: "Vamos celebrar isto na reunião de equipa!" },
  ];
  const { error: commentsError } = await admin.from("feed_comments").upsert(
    comments.map((comment, index) => ({
      id: id(`feed-comment:${comment.post}:${index}`),
      agency_id: agencyId,
      post_id: postIdByKey.get(comment.post),
      user_id: profileIdByKey.get(comment.user),
      content: comment.content,
    })),
    { onConflict: "id" }
  );
  if (commentsError) throw commentsError;

  console.log("\nDone. Demo login:");
  console.log(`  email:    ${DEMO_CREDENTIALS.email}`);
  console.log(`  password: ${DEMO_CREDENTIALS.password}`);
  console.log("\nOther team members share the same password:");
  for (const member of TEAM.slice(1)) {
    console.log(`  ${member.fullName} (${member.role}) — ${member.email}`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
