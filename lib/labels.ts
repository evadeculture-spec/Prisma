import type {
  AssetType,
  CommunicationTone,
  ContactInterest,
  ContactSource,
  ContactType,
  DealType,
  FeedPostType,
  ImageLabel,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
  ShiftType,
  TaskPriority,
  TaskType,
  VideoFormat,
  VideoType,
} from "@/lib/types/domain";

export const TYPOLOGY_LABEL: Record<PropertyType, string> = {
  t0: "Apartamento T0",
  t1: "Apartamento T1",
  t2: "Apartamento T2",
  t3: "Apartamento T3",
  t4: "Apartamento T4",
  t5: "Apartamento T5",
  t6_plus: "Apartamento T6+",
  studio: "Estúdio",
  villa: "Moradia",
  land: "Terreno",
  store: "Loja",
  office: "Escritório",
  warehouse: "Armazém",
  garage: "Garagem",
  other: "Imóvel",
};

export const DEAL_TYPE_LABEL: Record<DealType, string> = {
  sale: "Venda",
  rent: "Arrendamento",
};

export const CONDITION_LABEL: Record<PropertyCondition, string> = {
  new: "Novo",
  as_new: "Como novo",
  used: "Usado",
  renovated: "Renovado",
  to_renovate: "Para renovar",
  under_construction: "Em construção",
};

export const IMAGE_LABEL: Record<ImageLabel, string> = {
  main: "Principal",
  living_room: "Sala",
  kitchen: "Cozinha",
  bedroom: "Quarto",
  bathroom: "Casa de banho",
  exterior: "Exterior",
  view: "Vista",
  floor_plan: "Planta",
  other: "Outro",
};

export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  investor: "Investidor",
  tenant: "Inquilino",
  partner: "Parceiro",
};

export const CONTACT_SOURCE_LABEL: Record<ContactSource, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  idealista: "Idealista",
  website: "Website",
  referral: "Referência",
  phone_call: "Chamada telefónica",
  walk_in: "Visita espontânea",
  whatsapp: "WhatsApp",
  other: "Outro",
};

export const CONTACT_INTEREST_LABEL: Record<ContactInterest, string> = {
  buy: "Comprar",
  sell: "Vender",
  rent: "Arrendar",
  invest: "Investir",
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  call: "Chamada",
  visit: "Visita",
  publication: "Publicação",
  follow_up: "Follow-up",
  meeting: "Reunião",
  documentation: "Documentação",
  listing: "Angariação",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const SHIFT_TYPE_LABEL: Record<ShiftType, string> = {
  on_duty: "Plantão",
  visits: "Visitas",
  store: "Loja",
  prospecting: "Prospeção",
  rest: "Descanso",
};

export const FEED_POST_TYPE_LABEL: Record<FeedPostType, string> = {
  internal_news: "Notícia Interna",
  partnership: "Parceria",
  featured_property: "Imóvel em Destaque",
  training: "Formação",
  management_notice: "Aviso da Direção",
  sale_achievement: "Venda Concluída",
  new_agent: "Novo Agente",
  event: "Evento",
  open_house: "Casa Aberta",
  campaign: "Campanha",
};

export const TONE_LABEL: Record<CommunicationTone, string> = {
  premium: "Premium",
  emotional: "Emocional",
  direct: "Direto",
  young: "Jovem",
  family: "Família",
  luxury: "Luxo",
  investment: "Investimento",
  minimalist: "Minimalista",
};

export const VIDEO_TYPE_LABEL: Record<VideoType, string> = {
  cinematic_tour: "Tour Cinematográfico",
  luxury_real_estate: "Imobiliário de Luxo",
  social_reel: "Reel Social",
  before_after: "Antes/Depois",
  lifestyle: "Lifestyle",
};

export const VIDEO_FORMAT_LABEL: Record<VideoFormat, string> = {
  vertical_9_16: "Vertical (9:16)",
  square_1_1: "Quadrado (1:1)",
  horizontal_16_9: "Horizontal (16:9)",
};

export const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  reserved: "Reservado",
  sold: "Vendido",
  rented: "Arrendado",
  archived: "Arquivado",
};

export const TARGET_AUDIENCE_LABEL: Record<string, string> = {
  familia: "Famílias",
  jovem_casal: "Jovens casais",
  investidor: "Investidores",
  estudante: "Estudantes",
  reforma: "Reforma",
  luxo: "Público de luxo",
  estrangeiro: "Compradores estrangeiros",
};

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  commercial_title: "Título comercial",
  instagram_caption: "Legenda Instagram",
  portal_description: "Descrição para portais",
  facebook_copy: "Copy Facebook",
  whatsapp_message: "Mensagem WhatsApp",
  reel_script: "Guião de Reel",
  video_script: "Guião de vídeo",
  hashtags: "Hashtags",
  cta: "Chamadas para ação",
  story_sequence: "Sequência de Stories",
  instagram_carousel: "Carrossel Instagram",
  meta_ad: "Anúncio Meta Ads",
  newsletter: "Newsletter",
  content_calendar: "Calendário de publicações",
};
