// La Crypte — état, types, logique

export type Mode = "hebdo" | "mensuel";

export type Depot = {
  id: string;
  date: string; // ISO
  montant: number;
  objectifId: string;
  mode: Mode;
  note?: string;
  raison?: string;
};

export type Objectif = {
  id: string;
  nom: string;
  emoji: string;
  cible: number;
  concept: string;
  palette: { base: string; accent: string; gem: string };
};

export type Titre = {
  id: string;
  palier: number;
  nom: string;
};

export type CrypteState = {
  depots: Depot[];
  objectifs: Objectif[];
  titres: Titre[];
};

export const DATE_DEBUT = new Date("2026-05-20T00:00:00");
export const DATE_FIN = new Date("2028-12-31T23:59:59");

export const OBJECTIFS_DEFAUT: Objectif[] = [
  {
    id: "reserve-dragon",
    nom: "Réserve du Dragon",
    emoji: "🐉",
    cible: 4500,
    concept: "Fonds d'urgence",
    palette: { base: "#0F1115", accent: "#D4A64F", gem: "#C64545" },
  },
  {
    id: "refuge-familier",
    nom: "Refuge du Familier",
    emoji: "🐾",
    cible: 1600,
    concept: "Adoption chien",
    palette: { base: "#1D3B2A", accent: "#B56A3A", gem: "#3AA874" },
  },
  {
    id: "droit-passage",
    nom: "Droit de Passage",
    emoji: "🗝",
    cible: 2000,
    concept: "Permis de conduire",
    palette: { base: "#18222E", accent: "#B8C3CC", gem: "#4E7BFF" },
  },
];

export const initialState: CrypteState = {
  depots: [],
  objectifs: OBJECTIFS_DEFAUT,
  titres: [],
};

const STORAGE_KEY = "la-crypte:v1";

export function loadState(): CrypteState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as CrypteState;
    // Toujours s'assurer que les 3 objectifs par défaut existent
    const objectifs = OBJECTIFS_DEFAUT.map(
      (def) => parsed.objectifs?.find((o) => o.id === def.id) ?? def,
    );
    return { depots: parsed.depots ?? [], objectifs, titres: parsed.titres ?? [] };
  } catch {
    return initialState;
  }
}

export function saveState(state: CrypteState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Monnaie du royaume
export function monnaieRoyaume(total: number): { rang: string; emoji: string } {
  if (total >= 1000) return { rang: "Diamants", emoji: "💎" };
  if (total >= 500) return { rang: "Cristaux", emoji: "🔮" };
  if (total >= 300) return { rang: "Rubis", emoji: "♦️" };
  if (total >= 100) return { rang: "Or", emoji: "🟡" };
  if (total >= 75) return { rang: "Argent", emoji: "⚪" };
  if (total >= 56) return { rang: "Poussière d'argent", emoji: "✨" };
  if (total >= 48) return { rang: "Électrum", emoji: "🔸" };
  if (total >= 35) return { rang: "Laiton", emoji: "🟤" };
  if (total >= 25) return { rang: "Bronze", emoji: "🟫" };
  if (total >= 15) return { rang: "Cuivre", emoji: "🟧" };
  if (total >= 5) return { rang: "Fer", emoji: "⬛" };
  return { rang: "—", emoji: "·" };
}

// Calendrier
export function calendrier(now = new Date()) {
  const total = DATE_FIN.getTime() - DATE_DEBUT.getTime();
  const ecoule = Math.min(Math.max(now.getTime() - DATE_DEBUT.getTime(), 0), total);
  const restant = Math.max(DATE_FIN.getTime() - now.getTime(), 0);
  const jour = 1000 * 60 * 60 * 24;
  return {
    jours: Math.ceil(restant / jour),
    semaines: Math.ceil(restant / (jour * 7)),
    mois: Math.max(
      0,
      (DATE_FIN.getFullYear() - now.getFullYear()) * 12 +
        (DATE_FIN.getMonth() - now.getMonth()),
    ),
    pourcentEcoule: Math.round((ecoule / total) * 100),
  };
}

// Stats
function isoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function isoMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function statistiques(depots: Depot[]) {
  const total = depots.reduce((s, d) => s + d.montant, 0);
  const parSemaine = new Map<string, number>();
  const parMois = new Map<string, number>();
  for (const d of depots) {
    const dt = new Date(d.date);
    parSemaine.set(isoWeek(dt), (parSemaine.get(isoWeek(dt)) ?? 0) + d.montant);
    parMois.set(isoMonth(dt), (parMois.get(isoMonth(dt)) ?? 0) + d.montant);
  }
  const meilleureSemaine = Math.max(0, ...parSemaine.values());
  const meilleurMois = Math.max(0, ...parMois.values());
  const moyenne = depots.length ? total / depots.length : 0;

  // Série actuelle / record (en semaines consécutives avec dépôt)
  const semainesAvecDepot = Array.from(parSemaine.keys()).sort();
  let serieActuelle = 0;
  let recordSerie = 0;
  let courant = 0;
  let prev: string | null = null;
  for (const w of semainesAvecDepot) {
    if (prev === null) {
      courant = 1;
    } else {
      // semaine suivante ?
      const [yA, wA] = prev.split("-W").map(Number);
      const [yB, wB] = w.split("-W").map(Number);
      const consec = (yB === yA && wB === wA + 1) || (yB === yA + 1 && wA >= 52 && wB === 1);
      courant = consec ? courant + 1 : 1;
    }
    recordSerie = Math.max(recordSerie, courant);
    prev = w;
  }
  // Série actuelle : compte uniquement si la dernière semaine = semaine courante ou précédente
  if (semainesAvecDepot.length) {
    const lastW = semainesAvecDepot[semainesAvecDepot.length - 1];
    const nowW = isoWeek(new Date());
    if (lastW === nowW) serieActuelle = courant;
    else serieActuelle = 0;
  }

  const tries = [...depots].sort((a, b) => a.date.localeCompare(b.date));
  return {
    total,
    meilleureSemaine,
    meilleurMois,
    moyenne,
    nombre: depots.length,
    serieActuelle,
    recordSerie,
    premier: tries[0]?.date ?? null,
    dernier: tries[tries.length - 1]?.date ?? null,
  };
}

// Titres : 1 titre tous les 90 €
const NOMS_TITRES = [
  "Veilleuse de la Première Pièce",
  "Gardienne de la Bougie",
  "Apprentie du Trésor",
  "Protectrice des Coffres",
  "Sentinelle de la Crypte",
  "Dépositaire des Lunes",
  "Gardienne de l'Or Ancien",
  "Maîtresse des Cristaux",
  "Veilleuse du Dragon",
  "Architecte du Royaume",
  "Reine des Réserves",
  "Souveraine des Gemmes",
  "Protectrice des Lendemains",
  "Gardienne de l'Aube",
  "Dame de la Source Enchantée",
  "Patriarche des Diamants",
  "Détentrice du Sceau Ancien",
  "Régente de la Voûte",
  "Gardienne du Futur Stable",
  "Légende de la Crypte",
];

export function titresPour(total: number): Titre[] {
  const titres: Titre[] = [];
  const n = Math.floor(total / 90);
  for (let i = 1; i <= n; i++) {
    titres.push({
      id: `t-${i}`,
      palier: i * 90,
      nom: NOMS_TITRES[(i - 1) % NOMS_TITRES.length] +
        (i > NOMS_TITRES.length ? ` ⋅ ${Math.floor((i - 1) / NOMS_TITRES.length) + 1}` : ""),
    });
  }
  return titres;
}

export const MESSAGES_DYNAMIQUES = [
  "Le dragon protège vos richesses.",
  "Le sanctuaire prospère.",
  "Chaque pièce déposée forge votre avenir.",
  "Les coffres gagnent en poids.",
  "La Crypte se remplit lentement.",
  "Votre patience construit quelque chose de grand.",
  "Le futur devient plus stable.",
  "Encore un peu.",
  "Votre royaume se prépare.",
  "Les richesses anciennes s'accumulent.",
];

export function totalParObjectif(depots: Depot[], objectifId: string) {
  return depots.filter((d) => d.objectifId === objectifId).reduce((s, d) => s + d.montant, 0);
}

export function formatEuro(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
