import type { CommunicationTone } from "@/lib/types/domain";

import {
  AUDIENCE_LABEL,
  DEAL_LABEL,
  GENERIC_HASHTAGS,
  TONE_ADJECTIVES,
  TONE_CLOSINGS,
  TYPOLOGY_LABEL,
  audienceLabel,
  hashSeed,
  pick,
} from "./mock-data";
import type {
  ContentCalendarDay,
  GeneratedCampaignContent,
  GeneratedTask,
  InstagramCarouselSlide,
  MetaAdContent,
  PropertyAIInput,
} from "./types";

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

function formatArea(area: number | null): string | null {
  if (!area) return null;
  return `${area} m²`;
}

function dealSuffix(input: PropertyAIInput): string {
  return input.dealType === "rent" ? "/mês" : "";
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function slugifyTag(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function featureList(input: PropertyAIInput): string[] {
  const features: string[] = [];
  if (input.bedrooms > 0) features.push(`${input.bedrooms} quarto${input.bedrooms > 1 ? "s" : ""}`);
  if (input.bathrooms > 0) features.push(`${input.bathrooms} casa${input.bathrooms > 1 ? "s" : ""} de banho`);
  const area = formatArea(input.usefulArea ?? input.grossArea);
  if (area) features.push(area);
  if (input.hasGarage) features.push("garagem");
  if (input.hasGarden) features.push("jardim");
  if (input.hasPool) features.push("piscina");
  if (input.energyCertificate) features.push(`certificado energético ${input.energyCertificate}`);
  return features;
}

function featureLine(input: PropertyAIInput): string {
  const parts: string[] = [];
  if (input.bedrooms > 0) parts.push(`🛏 ${input.bedrooms} quarto${input.bedrooms > 1 ? "s" : ""}`);
  if (input.bathrooms > 0) parts.push(`🛁 ${input.bathrooms} wc`);
  const area = formatArea(input.usefulArea ?? input.grossArea);
  if (area) parts.push(`📐 ${area}`);
  if (input.hasGarage) parts.push("🚗 garagem");
  if (input.hasGarden) parts.push("🌳 jardim");
  if (input.hasPool) parts.push("🏊 piscina");
  return parts.join("  ·  ");
}

function standoutFeature(input: PropertyAIInput): string {
  if (input.strengths) {
    const first = input.strengths.split(/[.\n;]/)[0]?.trim();
    if (first) return first.toLowerCase();
  }
  if (input.hasPool) return "com piscina privada";
  if (input.hasGarden) return "com jardim";
  if (input.hasGarage) return "com garagem incluída";
  if (input.bedrooms >= 4) return "com espaço para toda a família";
  return "pronto para a próxima etapa da sua vida";
}

export function generateCommercialTitle(input: PropertyAIInput, seed: number): string {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  const adjective = pick(TONE_ADJECTIVES[input.tone], seed, 1);
  const feature = standoutFeature(input);
  const templates = [
    `${typology} ${adjective} em ${input.location}`,
    `${typology} em ${input.location} — ${feature}`,
    `${typology} em ${input.location}: ${adjective} e ${feature}`,
    `À procura de ${typology.toLowerCase()} em ${input.location}? Este é ${adjective}`,
  ];
  return capitalize(pick(templates, seed, 2));
}

export function generateInstagramCaption(input: PropertyAIInput, seed: number): string {
  const audience = audienceLabel(input.targetAudience);
  const adjective = pick(TONE_ADJECTIVES[input.tone], seed, 3);
  const closing = pick(TONE_CLOSINGS[input.tone], seed, 4);
  const hooks = [
    `✨ Novo em ${DEAL_LABEL[input.dealType].forWhom} em ${input.location}!`,
    `📍 ${input.location} tem uma novidade para si.`,
    `🔑 Esta pode ser a sua próxima casa em ${input.location}.`,
  ];
  const hook = pick(hooks, seed, 5);
  const lines = [
    hook,
    "",
    `Um ${TYPOLOGY_LABEL[input.propertyType].toLowerCase()} ${adjective}, pensado para ${audience}.`,
    "",
    featureLine(input),
    "",
    `💶 ${formatPrice(input.price)}${dealSuffix(input)}`,
    "",
    closing,
  ];
  return lines.join("\n");
}

export function generatePortalDescription(input: PropertyAIInput, seed: number): string {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  const adjective1 = pick(TONE_ADJECTIVES[input.tone], seed, 6);
  const adjective2 = pick(TONE_ADJECTIVES[input.tone], seed, 7);
  const audience = audienceLabel(input.targetAudience);
  const features = featureList(input);

  const paragraphs = [
    `Localizado em ${input.location}, este ${typology.toLowerCase()} está disponível para ${DEAL_LABEL[input.dealType].forWhom} e distingue-se por ser ${adjective1} e ${adjective2}.`,
    features.length > 0
      ? `Composto por ${joinList(features)}, é um espaço pensado para ${audience}.`
      : `Um imóvel pensado para ${audience}.`,
    input.strengths ? `Pontos fortes: ${input.strengths}` : null,
    input.weaknesses
      ? `Vale ainda referir que ${input.weaknesses.charAt(0).toLowerCase()}${input.weaknesses.slice(1)} — um detalhe que a nossa equipa esclarece com todo o gosto durante a visita.`
      : null,
    input.energyCertificate ? `Certificado energético: classe ${input.energyCertificate}.` : null,
    pick(TONE_CLOSINGS[input.tone], seed, 8),
  ].filter((paragraph): paragraph is string => Boolean(paragraph));

  return paragraphs.join("\n\n");
}

export function generateFacebookCopy(input: PropertyAIInput, seed: number): string {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  const audience = audienceLabel(input.targetAudience);
  const closing = pick(TONE_CLOSINGS[input.tone], seed, 9);
  const agencySuffix = input.agencyName ? ` pela ${input.agencyName}` : "";
  return [
    `🏡 ${typology} para ${DEAL_LABEL[input.dealType].forWhom} em ${input.location}`,
    "",
    `Sabe aquele imóvel que parece ter sido feito à medida? É este. Ideal para ${audience}, com tudo o que precisa para o dia a dia.`,
    "",
    featureLine(input) || "Área e divisões pensadas ao detalhe.",
    "",
    `💶 ${formatPrice(input.price)}${dealSuffix(input)}`,
    "",
    `Apresentado em exclusivo${agencySuffix}. ${closing}`,
  ].join("\n");
}

export function generateWhatsappMessage(input: PropertyAIInput, seed: number): string {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  const greetings = ["Olá! 👋", "Boa tarde! 😊", "Olá, espero que esteja tudo bem!"];
  const greeting = pick(greetings, seed, 10);
  return [
    greeting,
    `Tenho ${typology.toLowerCase()} em ${input.location} para ${DEAL_LABEL[input.dealType].forWhom} que penso que vai ao encontro do que procura.`,
    featureLine(input),
    `Valor: ${formatPrice(input.price)}${dealSuffix(input)}.`,
    "Posso marcar uma visita esta semana? Fico a aguardar a sua disponibilidade.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateReelScript(input: PropertyAIInput, seed: number): string {
  const hookOptions = [
    `Já viu o imóvel que está a dar que falar em ${input.location}?`,
    `Isto em ${input.location} não devia estar tão acessível.`,
    "Pare de scrollar — isto pode ser a sua próxima casa.",
  ];
  const hook = pick(hookOptions, seed, 11);
  return [
    "[0-3s] HOOK (texto no ecrã + voz off)",
    `"${hook}"`,
    "",
    "[3-8s] Plano exterior / fachada",
    `Voz off: "Estamos em ${input.location}."`,
    "",
    "[8-16s] Sala / espaços principais",
    `Voz off: "${featureLine(input).replaceAll("·", "—") || "Espaços pensados ao detalhe."}"`,
    "",
    "[16-22s] Detalhe que surpreende (cozinha, vista, varanda, jardim)",
    `Texto no ecrã: "${capitalize(standoutFeature(input))}"`,
    "",
    "[22-27s] Plano final + preço",
    `Voz off: "${formatPrice(input.price)}${dealSuffix(input)}. Disponível para ${DEAL_LABEL[input.dealType].forWhom}."`,
    "",
    "[27-30s] CTA",
    'Texto no ecrã: "Manda-nos mensagem e marcamos a visita 🔑"',
  ].join("\n");
}

export function generateVideoScript(input: PropertyAIInput, seed: number): string {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  const adjective = pick(TONE_ADJECTIVES[input.tone], seed, 12);
  const audience = audienceLabel(input.targetAudience);
  const features = featureList(input);
  return [
    `Bem-vindo a este ${typology.toLowerCase()} em ${input.location}.`,
    `Um espaço ${adjective}, pensado para ${audience}.`,
    features.length > 0 ? `Conta com ${joinList(features)}.` : null,
    input.strengths ? `${capitalize(input.strengths)}.` : null,
    `Disponível para ${DEAL_LABEL[input.dealType].forWhom} por ${formatPrice(input.price)}${dealSuffix(input)}.`,
    "Marque já a sua visita e venha conhecer pessoalmente.",
  ]
    .filter((line): line is string => Boolean(line))
    .join(" ");
}

const TONE_HASHTAG: Record<CommunicationTone, string> = {
  premium: "#imobiliariopremium",
  emotional: "#novacasa",
  direct: "#boaoportunidade",
  young: "#primeiracasa",
  family: "#casadefamilia",
  luxury: "#luxuryrealestate",
  investment: "#investimentoimobiliario",
  minimalist: "#designminimalista",
};

export function generateHashtags(input: PropertyAIInput, seed: number): string[] {
  const locationTag = `#${slugifyTag(input.location)}`;
  const typologyTag = `#${input.propertyType.replaceAll("_", "")}`;
  const dealTag = input.dealType === "sale" ? "#compraevenda" : "#arrendamento";
  const base = [locationTag, typologyTag, dealTag, TONE_HASHTAG[input.tone], ...GENERIC_HASHTAGS];
  const seen = new Set<string>();
  const unique = base.filter((tag) => {
    if (seen.has(tag)) return false;
    seen.add(tag);
    return true;
  });
  return unique.slice(seed % 2, unique.length).concat(unique.slice(0, seed % 2)).slice(0, 12);
}

export function generateCtas(input: PropertyAIInput): string[] {
  const renderOrFinance = input.dealType === "rent" ? "renda" : "financiamento";
  return [
    "Marcar visita",
    "Falar com um consultor",
    `Saber mais sobre este ${TYPOLOGY_LABEL[input.propertyType].toLowerCase()}`,
    `Pedir simulação de ${renderOrFinance}`,
  ];
}

export function generateStoryParts(input: PropertyAIInput): [string, string, string] {
  return [
    `Parte 1/3 👀\nNovo ${TYPOLOGY_LABEL[input.propertyType].toLowerCase()} em ${input.location}`,
    `Parte 2/3 📐\n${featureLine(input) || "Espaços pensados ao detalhe"}`,
    `Parte 3/3 💶\n${formatPrice(input.price)}${dealSuffix(input)} — Desliza para saber mais ⬆️`,
  ];
}

export function generateInstagramCarousel(input: PropertyAIInput, seed: number): InstagramCarouselSlide[] {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  return [
    { slide: 1, headline: `${typology} em ${input.location}`, body: capitalize(standoutFeature(input)) },
    { slide: 2, headline: "Divisões", body: featureLine(input) || "Espaços versáteis e bem distribuídos." },
    {
      slide: 3,
      headline: "Porque vai gostar",
      body: input.strengths ?? capitalize(pick(TONE_ADJECTIVES[input.tone], seed, 13)),
    },
    { slide: 4, headline: "Localização", body: `${input.location} — perto de tudo o que precisa no dia a dia.` },
    { slide: 5, headline: "Valor", body: `${formatPrice(input.price)}${dealSuffix(input)}` },
    { slide: 6, headline: "Próximo passo", body: pick(TONE_CLOSINGS[input.tone], seed, 14) },
  ];
}

export function generateMetaAd(input: PropertyAIInput, seed: number): MetaAdContent {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  return {
    headline: `${typology} em ${input.location} — ${formatPrice(input.price)}${dealSuffix(input)}`,
    primaryText:
      `Está à procura de ${DEAL_LABEL[input.dealType].forWhom} em ${input.location}? ${capitalize(standoutFeature(input))}. ${featureLine(input)}`.trim(),
    description: pick(TONE_CLOSINGS[input.tone], seed, 15),
  };
}

export function generateNewsletter(input: PropertyAIInput): string {
  const typology = TYPOLOGY_LABEL[input.propertyType];
  const features = featureList(input);
  return [
    `🆕 ${typology} em destaque em ${input.location}`,
    "",
    `${capitalize(standoutFeature(input))}.${features.length > 0 ? ` Inclui ${joinList(features)}.` : ""}`,
    "",
    `${formatPrice(input.price)}${dealSuffix(input)} · ${DEAL_LABEL[input.dealType].forWhom}`,
    "",
    "[Ver imóvel] · [Marcar visita]",
  ].join("\n");
}

export function generateContentCalendar(input: PropertyAIInput): ContentCalendarDay[] {
  const typology = TYPOLOGY_LABEL[input.propertyType].toLowerCase();
  return [
    { day: 1, label: "Lançamento", channel: "Instagram", action: `Publicar carrossel de apresentação do ${typology}` },
    { day: 2, label: "Aquecimento", channel: "Stories", action: "Publicar sequência de stories com detalhes e CTA de visita" },
    { day: 3, label: "Alcance", channel: "Facebook", action: "Publicar copy completa com fotos e botão de contacto" },
    { day: 4, label: "Conversão direta", channel: "WhatsApp", action: "Enviar mensagem a contactos com interesse compatível" },
    { day: 5, label: "Vídeo", channel: "Reels/TikTok", action: "Publicar vídeo curto com tour rápido do imóvel" },
    { day: 6, label: "Prova social", channel: "Feed Interno", action: "Partilhar o imóvel com a equipa e pedir indicações" },
    { day: 7, label: "Impulso pago", channel: "Meta Ads", action: "Lançar anúncio segmentado para a audiência-alvo" },
  ];
}

export function generateCommercialTasksMock(input: PropertyAIInput): GeneratedTask[] {
  return [
    {
      title: `Validar fotografias do imóvel em ${input.location}`,
      description: "Confirmar que todas as fotos representam fielmente o imóvel antes da publicação.",
      type: "documentation",
      priority: "high",
      dueInDays: 1,
    },
    {
      title: "Publicar pack de promoção nos canais ativos",
      description: "Publicar a descrição, copy e imagens geradas nos portais e redes sociais da agência.",
      type: "publication",
      priority: "high",
      dueInDays: 2,
    },
    {
      title: "Agendar primeiras visitas",
      description: "Contactar leads compatíveis e agendar visitas para a primeira semana de campanha.",
      type: "visit",
      priority: "medium",
      dueInDays: 4,
    },
    {
      title: "Fazer follow-up com contactos interessados",
      description: "Confirmar interesse e esclarecer dúvidas de quem reagiu à campanha.",
      type: "follow_up",
      priority: "medium",
      dueInDays: 6,
    },
    {
      title: "Rever desempenho da campanha",
      description: "Analisar alcance, leads gerados e ajustar copy ou canais se necessário.",
      type: "documentation",
      priority: "low",
      dueInDays: 7,
    },
  ];
}

export function generateMockCampaignContent(input: PropertyAIInput, variant = 0): GeneratedCampaignContent {
  const seed = hashSeed(input.id) + variant * 97;
  return {
    commercialTitle: generateCommercialTitle(input, seed),
    instagramCaption: generateInstagramCaption(input, seed),
    portalDescription: generatePortalDescription(input, seed),
    facebookCopy: generateFacebookCopy(input, seed),
    whatsappMessage: generateWhatsappMessage(input, seed),
    reelScript: generateReelScript(input, seed),
    videoScript: generateVideoScript(input, seed),
    hashtags: generateHashtags(input, seed),
    ctas: generateCtas(input),
    storyParts: generateStoryParts(input),
    instagramCarousel: generateInstagramCarousel(input, seed),
    metaAd: generateMetaAd(input, seed),
    newsletter: generateNewsletter(input),
    contentCalendar: generateContentCalendar(input),
    commercialTasks: generateCommercialTasksMock(input),
  };
}
