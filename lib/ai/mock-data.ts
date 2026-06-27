import { TYPOLOGY_LABEL } from "@/lib/labels";
import type { CommunicationTone, DealType } from "@/lib/types/domain";

export { TYPOLOGY_LABEL };

export function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pick<T>(items: readonly T[], seed: number, salt = 0): T {
  if (items.length === 0) throw new Error("pick() recebeu uma lista vazia");
  const index = (seed + salt) % items.length;
  return items[index];
}

export const DEAL_LABEL: Record<DealType, { noun: string; verb: string; forWhom: string }> = {
  sale: { noun: "venda", verb: "comprar", forWhom: "compra" },
  rent: { noun: "arrendamento", verb: "arrendar", forWhom: "arrendamento" },
};

export const AUDIENCE_LABEL: Record<string, string> = {
  familia: "famílias que procuram espaço e conforto no dia a dia",
  família: "famílias que procuram espaço e conforto no dia a dia",
  investidor: "investidores atentos à rentabilidade e valorização do imóvel",
  jovem_casal: "jovens casais que querem dar o próximo passo",
  "jovem casal": "jovens casais que querem dar o próximo passo",
  luxo: "quem procura exclusividade, design e sofisticação",
  reforma: "quem está a planear uma reforma tranquila e confortável",
  estudante: "estudantes que precisam de boa localização e praticidade",
  estrangeiro: "compradores internacionais à procura de uma vida em Portugal",
  default: "quem procura o imóvel certo, no momento certo",
};

export function audienceLabel(targetAudience: string[]): string {
  const first = targetAudience[0]?.toLowerCase().replaceAll(" ", "_");
  return AUDIENCE_LABEL[first ?? "default"] ?? AUDIENCE_LABEL.default;
}

export const TONE_ADJECTIVES: Record<CommunicationTone, string[]> = {
  premium: ["sofisticado", "distinto", "cuidado ao detalhe", "elegante"],
  emotional: ["acolhedor", "cheio de luz", "feito para criar memórias", "especial"],
  direct: ["pronto a habitar", "sem rodeios: ótima relação qualidade-preço", "prático", "objetivo"],
  young: ["fresco", "vibrante", "com energia própria", "moderno"],
  family: ["acolhedor para toda a família", "espaçoso", "seguro e tranquilo", "pensado para o dia a dia"],
  luxury: ["exclusivo", "de end-to-end premium", "incomparável", "para quem não troca qualidade por nada"],
  investment: ["com elevado potencial de valorização", "estratégico", "de rentabilidade comprovada", "bem posicionado no mercado"],
  minimalist: ["limpo nas linhas", "funcional", "sem excessos", "essencial"],
};

export const TONE_CLOSINGS: Record<CommunicationTone, string[]> = {
  premium: [
    "Marque a sua visita privada e descubra um imóvel à altura das suas expectativas.",
    "Agende já uma visita exclusiva — este imóvel não fica disponível por muito tempo.",
  ],
  emotional: [
    "Vamos marcar uma visita? Há casas que sentimos logo à entrada — esta pode ser a sua.",
    "Fale connosco e venha sentir este espaço de perto. Pode ser o início de uma nova fase.",
  ],
  direct: [
    "Contacte-nos hoje e marque a visita. Resposta rápida, sem complicações.",
    "Disponível para visita esta semana. Fale connosco e agende já.",
  ],
  young: [
    "Bora ver isto ao vivo? Manda-nos mensagem e marcamos a visita 🔑",
    "Curtiste? Desliza para os detalhes e fala connosco para marcar a visita.",
  ],
  family: [
    "Vamos mostrar à sua família este espaço? Marque a visita com a nossa equipa.",
    "Traga a família e venha conhecer o que pode ser a próxima casa de todos.",
  ],
  luxury: [
    "Reserve uma visita privada e exclusiva com a nossa equipa especializada.",
    "Disponibilizamos visita acompanhada e confidencial, mediante marcação.",
  ],
  investment: [
    "Solicite a análise de rentabilidade e agende uma visita com a nossa equipa comercial.",
    "Fale com um dos nossos consultores para conhecer o potencial de retorno deste imóvel.",
  ],
  minimalist: [
    "Visita mediante marcação. Contacte-nos.",
    "Saiba mais e agende a sua visita.",
  ],
};

export const GENERIC_HASHTAGS = [
  "#imobiliario", "#imoveisportugal", "#casanova", "#imobiliariaportugal",
  "#mercadoimobiliario", "#comprarcasa", "#arrendarcasa", "#realestateportugal",
];
