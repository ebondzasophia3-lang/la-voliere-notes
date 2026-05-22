import { useEffect, useMemo, useState } from "react";
import {
  Attention,
  CATEGORIES,
  Categorie,
  MessageEnvole,
  NoteOiseau,
  PROGRESSIONS,
  Progression,
  TITRES_CADEAUX,
  TITRES_REGULARITE,
  Titre,
  VoliereState,
  initialState,
  joursAvant,
  loadState,
  monnaie,
  saveState,
  uid,
} from "@/lib/voliere";
import { Feathers, Lantern, Oiseau } from "@/components/voliere/Ambiance";

type Tab = "registre" | "habitants" | "notes" | "archives" | "titres";

const DATE_ROYAUME = "22 / 05 / 2026";

export function Voliere() {
  const [state, setState] = useState<VoliereState>(initialState);
  const [tab, setTab] = useState<Tab>("registre");
  const [showForm, setShowForm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [conseil, setConseil] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.premierLancement) setShowWelcome(true);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Vérification titres
  useEffect(() => {
    const offerts = state.attentions.filter((a) => a.offert).length;
    const nouveauxTitres: Titre[] = [];
    const existants = new Set(state.titres.map((t) => t.cle));

    TITRES_CADEAUX.forEach((t) => {
      const cle = `cadeaux-${t.seuil}`;
      if (offerts >= t.seuil && !existants.has(cle)) {
        nouveauxTitres.push({ cle, nom: t.nom, date: new Date().toISOString() });
      }
    });
    TITRES_REGULARITE.forEach((t) => {
      if (t.verif(state.attentions) >= t.seuil && !existants.has(t.cle)) {
        nouveauxTitres.push({ cle: t.cle, nom: t.nom, date: new Date().toISOString() });
      }
    });
    if (nouveauxTitres.length > 0) {
      setState((s) => ({ ...s, titres: [...s.titres, ...nouveauxTitres] }));
      setConseil(`✨ Nouveau titre obtenu : ${nouveauxTitres[0].nom}`);
    }
  }, [state.attentions]);

  // Conseils automatiques
  useEffect(() => {
    if (state.attentions.length === 0) return;
    const proche = state.attentions.find((a) => {
      const j = joursAvant(a.dateImportante);
      return !a.offert && j !== null && j >= 0 && j <= 7;
    });
    if (proche) {
      setConseil(`🕊 Une célébration approche pour ${proche.habitant} (${joursAvant(proche.dateImportante)} jours).`);
      return;
    }
    const habitants = Array.from(new Set(state.attentions.map((a) => a.habitant)));
    const oublie = habitants.find((h) => {
      const dernierOffert = state.attentions
        .filter((a) => a.habitant === h && a.offert)
        .sort((a, b) => +new Date(b.offert!.date) - +new Date(a.offert!.date))[0];
      if (!dernierOffert) return false;
      const j = (Date.now() - +new Date(dernierOffert.offert!.date)) / (24 * 3600 * 1000);
      return j > 180;
    });
    if (oublie) {
      setConseil(`🕊 ${oublie} n'a reçu aucune attention depuis longtemps.`);
      return;
    }
    const aPreparer = state.attentions.find((a) => !a.offert && a.progression === "idee-apercue");
    if (aPreparer) setConseil(`🕊 L'idée pour ${aPreparer.habitant} mérite peut-être d'être préparée.`);
  }, [state.attentions, tab]);

  const stats = useMemo(() => {
    const offerts = state.attentions.filter((a) => a.offert).length;
    const budgetPrep = state.attentions.reduce((s, a) => s + (a.budgetPrevu || 0), 0);
    return {
      idees: state.attentions.length,
      offerts,
      titres: state.titres.length,
      archives: state.attentions.filter((a) => a.grandeJoie).length,
      envolees: state.envoles.length,
      budget: budgetPrep,
    };
  }, [state]);

  const titreActuel = useMemo(() => {
    const offerts = state.attentions.filter((a) => a.offert).length;
    const palier = [...TITRES_CADEAUX].reverse().find((t) => offerts >= t.seuil);
    return palier?.nom ?? "Visiteuse de la Volière";
  }, [state.attentions]);

  return (
    <div className="relative min-h-screen">
      <Feathers />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <header className="card-aged rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none text-[200px] leading-none select-none">
            🪶
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="pixel text-[10px] text-copper tracking-widest mb-2">REGISTRE ROYAL</p>
              <h1 className="pixel text-2xl md:text-4xl text-gold text-glow">LA VOLIÈRE</h1>
              <p className="mt-3 italic text-ivory/80 max-w-xl">
                Un registre vivant des attentions du royaume. <Oiseau />
              </p>
              <p className="mt-2 text-xs text-ivory/50 pixel">Date du Royaume : {DATE_ROYAUME}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="parchment rounded px-3 py-2 text-xs">
                <Lantern /> Titre actuel
                <div className="font-serif text-base font-bold">{titreActuel}</div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="pixel text-[11px] bg-copper hover:bg-gold hover:text-night text-ivory px-4 py-3 rounded border border-gold/40 transition-all hover:scale-[1.02] active:scale-95"
              >
                ➕ NOUVEAU MESSAGE
              </button>
            </div>
          </div>
        </header>

        {/* Conseil */}
        {conseil && (
          <div className="card-aged rounded-lg p-4 mb-6 flex items-start gap-3 animate-letter">
            <span className="text-2xl">🪶</span>
            <div className="flex-1">
              <p className="pixel text-[10px] text-copper mb-1">CONSEILLÈRE DE LA VOLIÈRE</p>
              <p className="text-ivory">{conseil}</p>
            </div>
            <button onClick={() => setConseil(null)} className="text-ivory/40 hover:text-ivory">✕</button>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <StatCard label="Idées" value={stats.idees} icon="🪶" />
          <StatCard label="Cadeaux offerts" value={stats.offerts} icon="🎁" />
          <StatCard label="Titres" value={stats.titres} icon="🏆" />
          <StatCard label="Grandes joies" value={stats.archives} icon="📜" />
          <StatCard label="Envolées" value={stats.envolees} icon="🕊" />
          <StatCard label="Budget préparé" value={stats.budget} icon="💰" monnaie />
        </section>

        {/* Tabs */}
        <nav className="flex flex-wrap gap-2 mb-4">
          {(["registre", "habitants", "notes", "archives", "titres"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pixel text-[10px] px-3 py-2 rounded border transition-all ${
                tab === t
                  ? "bg-gold text-night border-gold"
                  : "bg-card text-ivory/70 border-border hover:border-copper hover:text-ivory"
              }`}
            >
              {t === "registre" && "📖 REGISTRE"}
              {t === "habitants" && "👥 HABITANTS"}
              {t === "notes" && "📜 NOTES DES OISEAUX"}
              {t === "archives" && "🏛 ARCHIVES"}
              {t === "titres" && "🏆 TITRES"}
            </button>
          ))}
        </nav>

        <main className="card-aged rounded-2xl p-5 md:p-8 min-h-[400px]">
          {tab === "registre" && <Registre state={state} setState={setState} />}
          {tab === "habitants" && <Habitants state={state} />}
          {tab === "notes" && <Notes state={state} setState={setState} />}
          {tab === "archives" && <Archives state={state} />}
          {tab === "titres" && <Titres state={state} />}
        </main>

        <footer className="mt-10 text-center italic text-ivory/60 text-sm max-w-2xl mx-auto">
          « Les présents préparés avec patience et discrétion illuminent le Royaume par la joie
          qu'ils procurent. »
        </footer>
      </div>

      {showForm && (
        <FormulaireAttention
          onClose={() => setShowForm(false)}
          onSave={(att) => {
            setState((s) => ({
              ...s,
              attentions: [...s.attentions, att],
              premierLancement: false,
            }));
            setShowForm(false);
          }}
        />
      )}

      {showWelcome && (
        <Modal onClose={() => { setShowWelcome(false); setState((s) => ({ ...s, premierLancement: false })); }}>
          <div className="text-center space-y-4 p-2">
            <div className="text-6xl animate-wing">🕊</div>
            <h2 className="pixel text-lg text-gold text-glow">LA VOLIÈRE OUVRE SES PORTES</h2>
            <p className="italic text-ivory/80">Les oiseaux attendent leurs premiers messages.</p>
            <button
              onClick={() => { setShowWelcome(false); setState((s) => ({ ...s, premierLancement: false })); }}
              className="pixel text-[10px] bg-copper text-ivory px-4 py-3 rounded hover:bg-gold hover:text-night"
            >
              ENTRER DANS LE ROYAUME
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, monnaie: m }: { label: string; value: number; icon: string; monnaie?: boolean }) {
  const mon = m ? monnaie(value) : null;
  return (
    <div className="card-aged rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="pixel text-lg text-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-ivory/60 mt-1">{label}</div>
      {mon && (
        <div className="text-[10px] text-copper mt-1">
          {mon.emoji} {mon.nom}
        </div>
      )}
    </div>
  );
}

/* ============ REGISTRE ============ */
function Registre({ state, setState }: { state: VoliereState; setState: React.Dispatch<React.SetStateAction<VoliereState>> }) {
  const [filter, setFilter] = useState<Categorie | "tous">("tous");
  const liste = state.attentions
    .filter((a) => filter === "tous" || a.categorie === filter)
    .filter((a) => !a.offert)
    .sort((a, b) => {
      const ja = joursAvant(a.dateImportante) ?? 9999;
      const jb = joursAvant(b.dateImportante) ?? 9999;
      return ja - jb;
    });

  if (state.attentions.length === 0) {
    return <EmptyState icon="🪶" titre="Le registre est vierge" message="Aucune attention n'a encore été déposée dans la Volière. Cliquez sur « Nouveau Message » pour commencer." />;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterBtn active={filter === "tous"} onClick={() => setFilter("tous")}>Toutes</FilterBtn>
        {CATEGORIES.map((c) => (
          <FilterBtn key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.emoji} {c.label}
          </FilterBtn>
        ))}
      </div>

      {liste.length === 0 ? (
        <p className="text-ivory/60 italic text-center py-8">Aucune attention dans cette catégorie.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {liste.map((a) => (
            <CarteAttention key={a.id} attention={a} setState={setState} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
        active ? "bg-gold text-night border-gold" : "border-border text-ivory/70 hover:border-copper"
      }`}
    >
      {children}
    </button>
  );
}

function CarteAttention({ attention: a, setState }: { attention: Attention; setState: React.Dispatch<React.SetStateAction<VoliereState>> }) {
  const [expand, setExpand] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === a.categorie);
  const prog = PROGRESSIONS.find((p) => p.id === a.progression);
  const jours = joursAvant(a.dateImportante);
  const ratioRess = a.budgetPrevu > 0 ? Math.min(100, (a.ressourcesPretes / a.budgetPrevu) * 100) : 0;

  const setProgression = (p: Progression) => {
    setState((s) => ({
      ...s,
      attentions: s.attentions.map((x) => (x.id === a.id ? { ...x, progression: p } : x)),
    }));
  };

  const offrir = () => {
    const reception = prompt("Comment cette joie a-t-elle été reçue ? (facultatif)") ?? undefined;
    const coutReelStr = prompt("Coût réel du présent ?", String(a.budgetReel || a.budgetPrevu));
    const coutReel = coutReelStr ? Number(coutReelStr) || 0 : a.budgetPrevu;
    const grande = confirm("Inscrire dans les Archives des Grandes Joies ?");
    setState((s) => ({
      ...s,
      attentions: s.attentions.map((x) =>
        x.id === a.id
          ? {
              ...x,
              budgetReel: coutReel,
              progression: "present-offert" as Progression,
              offert: { date: new Date().toISOString(), reception },
              grandeJoie: grande,
            }
          : x,
      ),
    }));
  };

  const retirer = () => {
    const raison = prompt("Raison du retrait ?") ?? "Non précisée";
    const env: MessageEnvole = {
      id: uid(),
      idee: a.idee,
      habitant: a.habitant,
      date: new Date().toISOString(),
      raison,
    };
    setState((s) => ({
      ...s,
      attentions: s.attentions.filter((x) => x.id !== a.id),
      envoles: [...s.envoles, env],
    }));
  };

  const ajouterRessource = () => {
    const val = prompt("Montant à ajouter aux ressources ?");
    if (!val) return;
    const n = Number(val) || 0;
    setState((s) => ({
      ...s,
      attentions: s.attentions.map((x) => (x.id === a.id ? { ...x, ressourcesPretes: x.ressourcesPretes + n } : x)),
    }));
  };

  return (
    <article className="card-aged rounded-xl p-4 animate-letter hover:border-gold/50 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-xs text-copper">{cat?.emoji} {cat?.label}</div>
          <h3 className="font-serif text-xl font-bold text-gold">{a.habitant}</h3>
          <p className="text-sm text-ivory/80">{a.occasion}</p>
        </div>
        {jours !== null && jours >= 0 && (
          <div className="text-right">
            <div className="pixel text-[9px] text-ivory/60">DANS</div>
            <div className="pixel text-lg text-gold">{jours}j</div>
          </div>
        )}
      </div>

      <p className="italic text-ivory/90 my-2">« {a.idee} »</p>

      <div className="text-xs text-ivory/70 mb-3">
        {prog?.emoji} {prog?.label}
      </div>

      {a.budgetPrevu > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-ivory/60 mb-1">
            <span>Ressources : {a.ressourcesPretes} / {a.budgetPrevu}</span>
            <span>{monnaie(a.budgetPrevu).emoji} {monnaie(a.budgetPrevu).nom}</span>
          </div>
          <div className="h-2 rounded-full bg-night overflow-hidden border border-border">
            <div className="h-full bg-gradient-to-r from-copper to-gold transition-all" style={{ width: `${ratioRess}%` }} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setExpand((e) => !e)} className="text-[10px] pixel text-ivory/70 hover:text-gold">
          {expand ? "▲ FERMER" : "▼ DÉTAILS"}
        </button>
        <button onClick={ajouterRessource} className="text-[10px] pixel text-ivory/70 hover:text-gold">+ RESSOURCE</button>
        <button onClick={offrir} className="text-[10px] pixel bg-forest/60 text-ivory px-2 py-1 rounded hover:bg-forest">🎁 OFFRIR</button>
        <button onClick={retirer} className="text-[10px] pixel text-destructive hover:text-ivory ml-auto">🕊 RETIRER</button>
      </div>

      {expand && (
        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
          {a.pourquoi && <p><span className="text-copper text-xs">Pourquoi cela compte : </span>{a.pourquoi}</p>}
          {a.comment && <p><span className="text-copper text-xs">Comment cette idée est apparue : </span>{a.comment}</p>}
          <div className="flex flex-wrap gap-1 pt-2">
            {PROGRESSIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProgression(p.id)}
                disabled={a.progression === p.id}
                className={`text-[10px] px-2 py-1 rounded border ${
                  a.progression === p.id ? "bg-gold text-night border-gold" : "border-border text-ivory/60 hover:border-copper"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

/* ============ HABITANTS ============ */
function Habitants({ state }: { state: VoliereState }) {
  const habitants = useMemo(() => {
    const map = new Map<string, Attention[]>();
    state.attentions.forEach((a) => {
      if (!map.has(a.habitant)) map.set(a.habitant, []);
      map.get(a.habitant)!.push(a);
    });
    return Array.from(map.entries()).map(([nom, atts]) => {
      const offerts = atts.filter((a) => a.offert);
      const premier = offerts.sort((a, b) => +new Date(a.offert!.date) - +new Date(b.offert!.date))[0];
      return {
        nom,
        nbCadeaux: offerts.length,
        budgetTotal: offerts.reduce((s, a) => s + (a.budgetReel || 0), 0),
        premier: premier?.offert?.date,
        occasions: Array.from(new Set(atts.map((a) => a.occasion))).filter(Boolean),
        idees: atts.filter((a) => !a.offert).map((a) => a.idee),
      };
    });
  }, [state]);

  if (habitants.length === 0) {
    return <EmptyState icon="👥" titre="Aucun habitant enregistré" message="Les archives se souviennent des joies déjà offertes. Ajoutez une première attention pour peupler le royaume." />;
  }

  return (
    <div>
      <p className="italic text-ivory/70 mb-5 text-center">« Les archives se souviennent des joies déjà offertes. »</p>
      <div className="grid md:grid-cols-2 gap-4">
        {habitants.map((h) => (
          <div key={h.nom} className="card-aged rounded-xl p-4">
            <h3 className="font-serif text-xl text-gold mb-2">{h.nom}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-ivory/80">
              <div><span className="text-copper text-xs">Cadeaux offerts</span><div className="pixel text-gold">{h.nbCadeaux}</div></div>
              <div><span className="text-copper text-xs">Budget total</span><div className="pixel text-gold">{h.budgetTotal}</div></div>
              <div className="col-span-2"><span className="text-copper text-xs">Premier cadeau</span><div>{h.premier ? new Date(h.premier).toLocaleDateString("fr-FR") : "—"}</div></div>
              {h.occasions.length > 0 && <div className="col-span-2"><span className="text-copper text-xs">Occasions célébrées</span><div>{h.occasions.join(", ")}</div></div>}
              {h.idees.length > 0 && <div className="col-span-2"><span className="text-copper text-xs">Idées en cours</span><ul className="list-disc list-inside italic text-ivory/70">{h.idees.map((i, k) => <li key={k}>{i}</li>)}</ul></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ NOTES ============ */
function Notes({ state, setState }: { state: VoliereState; setState: React.Dispatch<React.SetStateAction<VoliereState>> }) {
  const [txt, setTxt] = useState("");
  const ajouter = () => {
    if (!txt.trim()) return;
    const n: NoteOiseau = { id: uid(), texte: txt.trim(), date: new Date().toISOString() };
    setState((s) => ({ ...s, notes: [n, ...s.notes] }));
    setTxt("");
  };

  return (
    <div>
      <p className="italic text-ivory/70 mb-4 text-center">📜 Notes des Oiseaux Messagers</p>
      <div className="flex gap-2 mb-5">
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ajouter()}
          placeholder="Une idée entendue, un objet aperçu, une envie observée…"
          className="flex-1 bg-input border border-border rounded px-3 py-2 text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
        />
        <button onClick={ajouter} className="pixel text-[10px] bg-copper text-ivory px-3 rounded hover:bg-gold hover:text-night">DÉPOSER</button>
      </div>

      {state.notes.length === 0 ? (
        <EmptyState icon="📜" titre="Aucune note" message="Les oiseaux n'ont encore rapporté aucun indice." />
      ) : (
        <ul className="space-y-2">
          {state.notes.map((n) => (
            <li key={n.id} className="parchment rounded p-3 animate-letter flex justify-between gap-3">
              <div>
                <p>{n.texte}</p>
                <p className="text-[10px] opacity-60 mt-1">{new Date(n.date).toLocaleString("fr-FR")}</p>
              </div>
              <button
                onClick={() => setState((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== n.id) }))}
                className="opacity-50 hover:opacity-100"
              >✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============ ARCHIVES ============ */
function Archives({ state }: { state: VoliereState }) {
  const offerts = state.attentions.filter((a) => a.offert);
  const grandes = offerts.filter((a) => a.grandeJoie);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="pixel text-sm text-gold mb-3">🏛 ARCHIVES DES JOIES OFFERTES</h3>
        {offerts.length === 0 ? (
          <EmptyState icon="🎁" titre="Aucune joie offerte" message="Aucun cadeau n'a encore été offert." />
        ) : (
          <ul className="space-y-2">
            {offerts.map((a) => (
              <li key={a.id} className="parchment rounded p-3 animate-letter">
                <div className="flex justify-between gap-2">
                  <div>
                    <b>{a.habitant}</b> — {a.occasion}
                    <p className="italic text-sm opacity-80">« {a.idee} »</p>
                    {a.offert?.reception && <p className="text-xs mt-1">Reçu : {a.offert.reception}</p>}
                  </div>
                  <div className="text-right text-xs opacity-70">
                    {new Date(a.offert!.date).toLocaleDateString("fr-FR")}
                    <div>Prévu : {a.budgetPrevu} / Réel : {a.budgetReel}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="pixel text-sm text-gold mb-3">🌟 ARCHIVES DES GRANDES JOIES</h3>
        {grandes.length === 0 ? (
          <p className="text-ivory/60 italic text-sm">Aucune grande joie consignée.</p>
        ) : (
          <ul className="space-y-2">
            {grandes.map((a) => (
              <li key={a.id} className="card-aged border-gold/40 rounded p-3">
                <b className="text-gold">{a.habitant}</b> — {a.occasion}
                <p className="italic text-sm">« {a.idee} »</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="pixel text-sm text-gold mb-3">🕊 ARCHIVES DES MESSAGES ENVOLÉS</h3>
        {state.envoles.length === 0 ? (
          <p className="text-ivory/60 italic text-sm">Aucun message n'a été retiré de la Volière.</p>
        ) : (
          <ul className="space-y-2">
            {state.envoles.map((e) => (
              <li key={e.id} className="text-sm text-ivory/70 border-l-2 border-copper pl-3">
                <b>{e.habitant}</b> — « {e.idee} » <span className="opacity-60">({e.raison})</span>
                <div className="text-[10px] opacity-50">{new Date(e.date).toLocaleDateString("fr-FR")}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ============ TITRES ============ */
function Titres({ state }: { state: VoliereState }) {
  const offerts = state.attentions.filter((a) => a.offert).length;
  return (
    <div>
      <h3 className="pixel text-sm text-gold mb-4">📜 REGISTRE DES BIENFAITS DU ROYAUME</h3>
      {state.titres.length === 0 ? (
        <EmptyState icon="🏆" titre="Aucun titre obtenu" message="Offrez des présents pour obtenir vos premiers titres royaux." />
      ) : (
        <ul className="space-y-2 mb-8">
          {state.titres.map((t) => (
            <li key={t.cle} className="parchment rounded p-3 flex justify-between animate-letter">
              <div>
                <b>🏆 {t.nom}</b>
                <div className="text-xs opacity-70">Obtenu le {new Date(t.date).toLocaleDateString("fr-FR")}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h4 className="pixel text-xs text-copper mb-3">PROCHAINS TITRES — Cadeaux ({offerts})</h4>
      <div className="grid md:grid-cols-2 gap-2">
        {TITRES_CADEAUX.map((t) => (
          <div key={t.seuil} className={`p-2 rounded border text-sm ${offerts >= t.seuil ? "border-gold/50 text-gold" : "border-border text-ivory/50"}`}>
            <span className="pixel text-[10px] mr-2">{t.seuil}</span> {t.nom}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ FORMULAIRE ============ */
function FormulaireAttention({ onClose, onSave }: { onClose: () => void; onSave: (a: Attention) => void }) {
  const [habitant, setHabitant] = useState("");
  const [occasion, setOccasion] = useState("");
  const [categorie, setCategorie] = useState<Categorie>("anniversaire");
  const [idee, setIdee] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [pourquoi, setPourquoi] = useState("");
  const [comment, setComment] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitant.trim() || !idee.trim()) return;
    onSave({
      id: uid(),
      habitant: habitant.trim(),
      occasion: occasion.trim(),
      categorie,
      idee: idee.trim(),
      budgetPrevu: Number(budget) || 0,
      budgetReel: 0,
      ressourcesPretes: 0,
      dateImportante: date,
      pourquoi: pourquoi.trim() || undefined,
      comment: comment.trim() || undefined,
      progression: "idee-apercue",
      cree: new Date().toISOString(),
    });
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <h2 className="pixel text-sm text-gold text-center mb-4">➕ NOUVEAU MESSAGE</h2>
        <Field label="Habitant du royaume *">
          <input required value={habitant} onChange={(e) => setHabitant(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Occasion">
          <input value={occasion} onChange={(e) => setOccasion(e.target.value)} className={inputCls} placeholder="Anniversaire, Noël…" />
        </Field>
        <Field label="Catégorie">
          <select value={categorie} onChange={(e) => setCategorie(e.target.value as Categorie)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </Field>
        <Field label="Idée cadeau *">
          <textarea required value={idee} onChange={(e) => setIdee(e.target.value)} className={`${inputCls} min-h-[60px]`} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Budget estimé">
            <input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Date importante">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Pourquoi cela compte (facultatif)">
          <textarea value={pourquoi} onChange={(e) => setPourquoi(e.target.value)} className={`${inputCls} min-h-[50px]`} />
        </Field>
        <Field label="Comment cette idée est apparue (facultatif)">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className={`${inputCls} min-h-[50px]`} />
        </Field>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 pixel text-[10px] py-3 rounded border border-border text-ivory/70 hover:border-copper">ANNULER</button>
          <button type="submit" className="flex-1 pixel text-[10px] py-3 rounded bg-copper text-ivory hover:bg-gold hover:text-night">🕊 DÉPOSER</button>
        </div>
      </form>
    </Modal>
  );
}

const inputCls = "w-full bg-input border border-border rounded px-3 py-2 text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] pixel text-copper block mb-1">{label}</span>
      {children}
    </label>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm flex items-center justify-center p-4 animate-letter" onClick={onClose}>
      <div className="card-aged rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, titre, message }: { icon: string; titre: string; message: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="pixel text-xs text-gold mb-2">{titre}</h3>
      <p className="text-ivory/60 italic max-w-md mx-auto">{message}</p>
    </div>
  );
}
