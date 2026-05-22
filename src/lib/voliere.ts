// Types et stockage local pour La Volière
export type Categorie =
  | "anniversaire"
  | "fete"
  | "petite-attention"
  | "grand-evenement"
  | "accomplissement"
  | "juste-parce-que"
  | "long-terme";

export type Progression =
  | "idee-apercue"
  | "observation-confirmee"
  | "preparation-commencee"
  | "ressources-pretes"
  | "present-offert";

export interface Attention {
  id: string;
  habitant: string;
  occasion: string;
  categorie: Categorie;
  idee: string;
  budgetPrevu: number;
  budgetReel: number;
  ressourcesPretes: number;
  dateImportante: string; // ISO
  pourquoi?: string;
  comment?: string;
  progression: Progression;
  cree: string;
  offert?: { date: string; reception?: string };
  grandeJoie?: boolean;
}

export interface NoteOiseau {
  id: string;
  texte: string;
  date: string;
}

export interface MessageEnvole {
  id: string;
  idee: string;
  habitant: string;
  date: string;
  raison: string;
}

export interface Titre {
  cle: string;
  nom: string;
  date: string;
}

export interface Habitante {
  id: string;
  nom: string;
  titre: string;
  role: string;
  relation: string;
  embleme: string;
  portrait?: string;
  note?: string;
}

export const ROLES_SUGGESTIONS = [
  "villageoise",
  "intendante",
  "instructrice",
  "marchande",
  "gardienne",
  "habitante du royaume",
  "noble étrangère",
  "princesse d'un autre royaume",
  "alliée du royaume",
  "promise",
  "compagnonne",
];

export const EMBLEMES = ["🌹","🪶","🕊","🌙","⭐","🍃","🔮","👑","🗝","📜","🦋","🌸","⚜","🛡","🏹","🪷","🦌","🐺","🦊","🐉"];

export interface VoliereState {
  attentions: Attention[];
  notes: NoteOiseau[];
  envoles: MessageEnvole[];
  titres: Titre[];
  habitantes: Habitante[];
  premierLancement: boolean;
}

export const CATEGORIES: { id: Categorie; label: string; emoji: string }[] = [
  { id: "anniversaire", label: "Anniversaire", emoji: "🎂" },
  { id: "fete", label: "Fête", emoji: "🎄" },
  { id: "petite-attention", label: "Petite Attention", emoji: "💌" },
  { id: "grand-evenement", label: "Grand Événement", emoji: "🌟" },
  { id: "accomplissement", label: "Accomplissement", emoji: "🎓" },
  { id: "juste-parce-que", label: "Juste Parce Que", emoji: "🌸" },
  { id: "long-terme", label: "Long Terme", emoji: "🎁" },
];

export const PROGRESSIONS: { id: Progression; label: string; emoji: string }[] = [
  { id: "idee-apercue", label: "Idée Aperçue", emoji: "🌱" },
  { id: "observation-confirmee", label: "Observation Confirmée", emoji: "🕊" },
  { id: "preparation-commencee", label: "Préparation Commencée", emoji: "📜" },
  { id: "ressources-pretes", label: "Ressources Prêtes", emoji: "💰" },
  { id: "present-offert", label: "Présent Offert", emoji: "🎁" },
];

const STORAGE_KEY = "la-voliere-v1";

export const initialState: VoliereState = {
  attentions: [],
  notes: [],
  envoles: [],
  titres: [],
  premierLancement: true,
};

export function loadState(): VoliereState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

export function saveState(state: VoliereState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Monnaie du royaume basée sur un nombre (idées, cadeaux, budget...)
export function monnaie(n: number): { emoji: string; nom: string } {
  if (n >= 1000) return { emoji: "🔮", nom: "Cristaux Ancestraux" };
  if (n >= 500) return { emoji: "💎", nom: "Diamants Anciens" };
  if (n >= 300) return { emoji: "🔴", nom: "Rubis du Dragon" };
  if (n >= 200) return { emoji: "🟣", nom: "Améthystes Royales" };
  if (n >= 150) return { emoji: "🟢", nom: "Émeraudes du Royaume" };
  if (n >= 100) return { emoji: "🔷", nom: "Saphirs" };
  if (n >= 85) return { emoji: "🟡", nom: "Pièces d'Or" };
  if (n >= 70) return { emoji: "✨", nom: "Éclats d'Or" };
  if (n >= 56) return { emoji: "⚪", nom: "Pièces d'Argent" };
  if (n >= 48) return { emoji: "🌙", nom: "Éclats d'Argent" };
  if (n >= 35) return { emoji: "🪵", nom: "Pièces de Bronze" };
  if (n >= 25) return { emoji: "⚫", nom: "Pièces de Fer" };
  if (n >= 15) return { emoji: "⚙", nom: "Pièces d'Étain" };
  if (n >= 5) return { emoji: "🟤", nom: "Pièces de Cuivre" };
  return { emoji: "🪶", nom: "Éclats de Cuivre" };
}

export const TITRES_CADEAUX: { seuil: number; nom: string }[] = [
  { seuil: 3, nom: "Gardienne des Premières Joies" },
  { seuil: 5, nom: "Dame des Présents du Royaume" },
  { seuil: 8, nom: "Intendante des Fêtes Royales" },
  { seuil: 12, nom: "Protectrice des Petites Joies" },
  { seuil: 15, nom: "Gardienne des Festivités" },
  { seuil: 20, nom: "Dame Bienfaitrice du Royaume" },
  { seuil: 30, nom: "Pourvoyeuse des Habitants" },
  { seuil: 40, nom: "Protectrice des Foyers du Royaume" },
  { seuil: 50, nom: "Grande Intendante Royale" },
  { seuil: 75, nom: "Reine des Présents" },
  { seuil: 100, nom: "Souveraine des Joies du Royaume" },
];

export const TITRES_REGULARITE: { cle: string; seuil: number; nom: string; verif: (a: Attention[]) => number }[] = [
  {
    cle: "veilleuse-celebrations",
    seuil: 5,
    nom: "Veilleuse des Célébrations",
    verif: (atts) =>
      atts.filter((a) => {
        if (!a.offert || !a.dateImportante) return false;
        const diff = new Date(a.dateImportante).getTime() - new Date(a.offert.date).getTime();
        return diff > 7 * 24 * 3600 * 1000;
      }).length,
  },
  {
    cle: "gardienne-preparatifs",
    seuil: 10,
    nom: "Gardienne des Préparatifs Royaux",
    verif: (atts) =>
      atts.filter((a) => {
        if (!a.offert || !a.dateImportante) return false;
        const diff = new Date(a.dateImportante).getTime() - new Date(a.offert.date).getTime();
        return diff > 30 * 24 * 3600 * 1000;
      }).length,
  },
  {
    cle: "protectrice-petites-joies",
    seuil: 20,
    nom: "Protectrice des Petites Joies",
    verif: (atts) => atts.filter((a) => a.offert && a.categorie === "petite-attention").length,
  },
];

export function joursAvant(iso: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (24 * 3600 * 1000));
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
