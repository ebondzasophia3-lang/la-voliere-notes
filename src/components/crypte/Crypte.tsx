import { useEffect, useMemo, useState } from "react";
import {
  CrypteState,
  Depot,
  Mode,
  Objectif,
  calendrier,
  formatDate,
  formatEuro,
  initialState,
  loadState,
  MESSAGES_DYNAMIQUES,
  monnaieRoyaume,
  saveState,
  statistiques,
  titresPour,
  totalParObjectif,
  uid,
} from "@/lib/crypte";
import { Candle, Coin, Dragon, Dust, Sparkle, Well } from "@/components/crypte/Ambiance";

type Tab = "sanctuaire" | "depots" | "archives" | "titres";

export function Crypte() {
  const [state, setState] = useState<CrypteState>(initialState);
  const [tab, setTab] = useState<Tab>("sanctuaire");
  const [hydrated, setHydrated] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showRitual, setShowRitual] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    const t = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES_DYNAMIQUES.length);
      setNow(new Date());
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => statistiques(state.depots), [state.depots]);
  const titres = useMemo(() => titresPour(stats.total), [stats.total]);
  const totalCible = state.objectifs.reduce((s, o) => s + o.cible, 0);
  const progressionGlobale = totalCible > 0 ? Math.min(100, (stats.total / totalCible) * 100) : 0;
  const monnaie = monnaieRoyaume(stats.total);
  const cal = calendrier(now);

  function ajouterDepot(d: Omit<Depot, "id">) {
    setState((s) => ({ ...s, depots: [...s.depots, { ...d, id: uid() }] }));
    setSparkleKey((k) => k + 1);
  }

  function rituelOubli() {
    setState({ ...initialState, objectifs: initialState.objectifs });
    setShowRitual(false);
    setTab("sanctuaire");
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-[#F5F0E8]" style={{ fontFamily: "var(--font-pixel)" }}>
      {/* Fond crypte */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #18222E 0%, #0F1115 60%), radial-gradient(circle at 20% 80%, #1D3B2A33, transparent 50%), radial-gradient(circle at 80% 70%, #6554C033, transparent 55%)",
      }} />
      <Dust count={36} />
      <Sparkle trigger={sparkleKey} />

      <div className="relative z-10 mx-auto max-w-5xl px-3 py-6 md:px-6">
        <Header monnaie={monnaie} total={stats.total} />

        <DragonBanner pourcent={progressionGlobale} cal={cal} />

        <Tabs tab={tab} setTab={setTab} />

        <p className="my-4 text-center text-xs md:text-sm text-[#CFC8BD] animate-crypte-fade">
          ✦ {MESSAGES_DYNAMIQUES[messageIndex]} ✦
        </p>

        {tab === "sanctuaire" && (
          <Sanctuaire
            objectifs={state.objectifs}
            depots={state.depots}
            onAddDepot={() => setShowForm(true)}
            stats={stats}
            cal={cal}
          />
        )}
        {tab === "depots" && (
          <DepotsList depots={state.depots} objectifs={state.objectifs} />
        )}
        {tab === "archives" && (
          <Archives stats={stats} depots={state.depots} />
        )}
        {tab === "titres" && <TitresPanel titres={titres} total={stats.total} />}

        <footer className="mt-10 border-t-2 border-[#D4A64F]/30 pt-4 text-center">
          <button
            onClick={() => setShowRitual(true)}
            className="text-[10px] md:text-xs text-[#C64545] hover:text-[#F5D06A] transition pixel"
          >
            🕯 Rituel d'Oubli
          </button>
          <p className="mt-4 text-[10px] md:text-xs text-[#CFC8BD] italic" style={{ fontFamily: "serif" }}>
            « Le Royaume avance. Vos richesses grandissent lentement sous la protection de la Crypte. » 🏛🐉✨
          </p>
        </footer>
      </div>

      {showForm && (
        <DepotForm
          objectifs={state.objectifs}
          onClose={() => setShowForm(false)}
          onSubmit={(d) => {
            ajouterDepot(d);
            setShowForm(false);
          }}
        />
      )}
      {showRitual && (
        <RitualConfirm onCancel={() => setShowRitual(false)} onConfirm={rituelOubli} />
      )}
    </div>
  );
}

function Header({ monnaie, total }: { monnaie: { rang: string; emoji: string }; total: number }) {
  return (
    <header className="relative border-2 border-[#D4A64F]/60 bg-[#0F1115]/80 p-4 shadow-[0_0_24px_#D4A64F33] rounded-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-base md:text-xl pixel text-[#F5D06A] drop-shadow-[2px_2px_0_#000]">
            🏛 LA CRYPTE
          </h1>
          <p className="mt-1 text-[10px] md:text-xs text-[#CFC8BD]" style={{ fontFamily: "serif" }}>
            Sanctuaire des richesses confiées au futur.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#CFC8BD]">Richesses Protégées</div>
          <div className="text-lg md:text-2xl pixel text-[#F5D06A] drop-shadow-[2px_2px_0_#000]">
            {formatEuro(total)}
          </div>
          <div className="text-[10px] text-[#B8C3CC]">
            {monnaie.emoji} Rang : {monnaie.rang}
          </div>
        </div>
      </div>
    </header>
  );
}

function DragonBanner({ pourcent, cal }: { pourcent: number; cal: ReturnType<typeof calendrier> }) {
  return (
    <section className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="border-2 border-[#6554C0]/50 bg-[#18222E]/70 p-3 rounded-sm flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[#CFC8BD]">Gardienne du Sanctuaire</div>
          <div className="pixel text-[#5FC7FF] text-xs md:text-sm mt-1">🐉 Éveil du Dragon</div>
          <div className="text-[10px] text-[#B8C3CC]">31 / 12 / 2028</div>
        </div>
        <Dragon />
      </div>

      <div className="border-2 border-[#4AB8B8]/50 bg-[#18222E]/70 p-3 rounded-sm">
        <div className="text-[10px] text-[#CFC8BD] text-center">Source enchantée</div>
        <Well pourcent={pourcent} />
        <div className="text-center text-[10px] text-[#B8C3CC] mt-1">Progression globale</div>
      </div>

      <div className="border-2 border-[#D4A64F]/50 bg-[#18222E]/70 p-3 rounded-sm">
        <div className="text-[10px] text-[#CFC8BD]">⏳ Temps restant</div>
        <ul className="mt-1 space-y-0.5 text-[10px] md:text-xs">
          <li>📅 <span className="pixel text-[#F5D06A]">{cal.jours}</span> jours</li>
          <li>📆 <span className="pixel text-[#F5D06A]">{cal.semaines}</span> semaines</li>
          <li>🗓 <span className="pixel text-[#F5D06A]">{cal.mois}</span> mois</li>
          <li>📈 <span className="pixel text-[#F5D06A]">{cal.pourcentEcoule}%</span> écoulé</li>
        </ul>
      </div>
    </section>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "sanctuaire", label: "🏛 Sanctuaire" },
    { id: "depots", label: "📜 Dépôts" },
    { id: "archives", label: "🗝 Archives" },
    { id: "titres", label: "👑 Titres" },
  ];
  return (
    <nav className="mt-4 flex flex-wrap gap-1 border-b-2 border-[#D4A64F]/30">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`pixel text-[10px] md:text-xs px-2 md:px-3 py-2 border-2 -mb-[2px] transition ${
            tab === t.id
              ? "border-[#D4A64F] bg-[#18222E] text-[#F5D06A]"
              : "border-transparent text-[#CFC8BD] hover:text-[#F5D06A]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function Sanctuaire({
  objectifs,
  depots,
  onAddDepot,
  stats,
  cal,
}: {
  objectifs: Objectif[];
  depots: Depot[];
  onAddDepot: () => void;
  stats: ReturnType<typeof statistiques>;
  cal: ReturnType<typeof calendrier>;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="pixel text-xs md:text-sm text-[#F5D06A]">Coffres du Royaume</h2>
        <button
          onClick={onAddDepot}
          className="pixel text-[10px] md:text-xs border-2 border-[#D4A64F] bg-[#1D3B2A] text-[#F5F0E8] px-3 py-2 hover:bg-[#D4A64F] hover:text-[#0F1115] transition shadow-[2px_2px_0_#000]"
        >
          ✚ Déposer
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {objectifs.map((o) => {
          const t = totalParObjectif(depots, o.id);
          const pct = Math.min(100, (t / o.cible) * 100);
          return (
            <article
              key={o.id}
              className="relative border-2 p-3 rounded-sm overflow-hidden"
              style={{ borderColor: o.palette.accent, background: `${o.palette.base}cc` }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs md:text-sm pixel" style={{ color: o.palette.accent }}>
                  {o.emoji} {o.nom}
                </div>
                <span className="text-base" aria-hidden style={{ color: o.palette.gem }}>
                  {pct >= 100 ? "💎" : "🗝"}
                </span>
              </div>
              <div className="text-[10px] text-[#CFC8BD] mt-1">{o.concept}</div>

              <div className="mt-3 h-3 border-2 border-black/60 bg-black/40 relative">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${o.palette.accent}, ${o.palette.gem})`,
                    boxShadow: `0 0 8px ${o.palette.gem}`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] md:text-xs">
                <span className="pixel text-[#F5F0E8]">{formatEuro(t)}</span>
                <span className="text-[#CFC8BD]">/ {formatEuro(o.cible)}</span>
              </div>
              <div className="mt-1 text-[10px] text-[#B8C3CC]">{Math.round(pct)}% protégé</div>
            </article>
          );
        })}
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <StatBox label="Total dépôts" value={String(stats.nombre)} />
        <StatBox label="Meilleure semaine" value={formatEuro(stats.meilleureSemaine)} />
        <StatBox label="Meilleur mois" value={formatEuro(stats.meilleurMois)} />
        <StatBox label="Moyenne / dépôt" value={formatEuro(stats.moyenne)} />
        <StatBox label="🔥 Flamme actuelle" value={`${stats.serieActuelle} sem.`} />
        <StatBox label="Record de flamme" value={`${stats.recordSerie} sem.`} />
      </section>

      <div className="flex justify-between gap-2 flex-wrap text-2xl">
        <Candle /><Coin /><Coin delay={1} /><Coin delay={2} /><Coin delay={3} /><Candle />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#D4A64F]/40 bg-[#0F1115]/80 p-3 rounded-sm">
      <div className="text-[10px] text-[#CFC8BD]">{label}</div>
      <div className="pixel text-sm md:text-base text-[#F5D06A] drop-shadow-[1px_1px_0_#000] mt-1">
        {value}
      </div>
    </div>
  );
}

function DepotsList({ depots, objectifs }: { depots: Depot[]; objectifs: Objectif[] }) {
  if (depots.length === 0) {
    return (
      <EmptyParchemin>
        La Crypte attend votre premier dépôt. Aucune pièce n'a encore été confiée au futur.
      </EmptyParchemin>
    );
  }
  const tries = [...depots].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <ul className="grid gap-2">
      {tries.map((d) => {
        const o = objectifs.find((x) => x.id === d.objectifId);
        return (
          <li key={d.id} className="border-2 border-[#D4A64F]/40 bg-[#0F1115]/80 p-3 rounded-sm">
            <div className="flex justify-between items-center text-[10px] md:text-xs">
              <span className="pixel text-[#F5D06A]">{formatEuro(d.montant)}</span>
              <span className="text-[#CFC8BD]">{formatDate(d.date)} · {d.mode}</span>
            </div>
            <div className="text-[10px] md:text-xs mt-1" style={{ color: o?.palette.accent }}>
              {o ? `${o.emoji} ${o.nom}` : "—"}
            </div>
            {d.raison && (
              <p className="mt-2 text-[10px] md:text-xs italic text-[#0F1115] parchment-bg px-2 py-1 rounded">
                « {d.raison} »
              </p>
            )}
            {d.note && <p className="mt-1 text-[10px] text-[#CFC8BD]">📝 {d.note}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function Archives({
  stats,
  depots,
}: {
  stats: ReturnType<typeof statistiques>;
  depots: Depot[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="border-2 border-[#D4A64F]/40 bg-[#0F1115]/80 p-3 rounded-sm">
        <h3 className="pixel text-xs md:text-sm text-[#F5D06A]">📜 Archives de la Crypte</h3>
        <ul className="mt-2 space-y-1 text-[10px] md:text-xs">
          <li>Premier dépôt : <span className="pixel text-[#F5D06A]">{stats.premier ? formatDate(stats.premier) : "—"}</span></li>
          <li>Dernier dépôt : <span className="pixel text-[#F5D06A]">{stats.dernier ? formatDate(stats.dernier) : "—"}</span></li>
          <li>Historique total : <span className="pixel text-[#F5D06A]">{stats.nombre}</span> dépôts</li>
          <li>Volume total : <span className="pixel text-[#F5D06A]">{formatEuro(stats.total)}</span></li>
        </ul>
      </div>
      <div className="border-2 border-[#C64545]/40 bg-[#0F1115]/80 p-3 rounded-sm">
        <h3 className="pixel text-xs md:text-sm text-[#C64545]">🔥 Flamme de Persévérance</h3>
        <p className="mt-2 text-[10px] md:text-xs text-[#CFC8BD]">
          <span className="pixel text-[#F5D06A]">{stats.serieActuelle}</span> semaines sans interrompre la progression.
        </p>
        <p className="text-[10px] md:text-xs text-[#CFC8BD] mt-1">
          Record : <span className="pixel text-[#F5D06A]">{stats.recordSerie}</span> semaines.
        </p>
      </div>
      {depots.length === 0 && (
        <div className="md:col-span-2">
          <EmptyParchemin>Les archives sont vierges. Le rouleau attend ses premières lignes.</EmptyParchemin>
        </div>
      )}
    </div>
  );
}

function TitresPanel({ titres, total }: { titres: ReturnType<typeof titresPour>; total: number }) {
  if (titres.length === 0) {
    return (
      <EmptyParchemin>
        Aucun titre encore. Le premier sera décerné aux 90 € protégés.
        {" "}Il vous manque {formatEuro(Math.max(0, 90 - total))}.
      </EmptyParchemin>
    );
  }
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {titres.map((t) => (
        <li
          key={t.id}
          className="border-2 border-[#D4A64F]/50 bg-gradient-to-br from-[#18222E] to-[#0F1115] p-3 rounded-sm"
        >
          <div className="flex justify-between items-center text-[10px] md:text-xs">
            <span className="pixel text-[#F5D06A]">👑 {t.nom}</span>
            <span className="text-[#B8C3CC]">{formatEuro(t.palier)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyParchemin({ children }: { children: React.ReactNode }) {
  return (
    <div className="parchment-bg rounded p-4 md:p-6 text-center text-[#0F1115] italic text-[11px] md:text-sm" style={{ fontFamily: "serif" }}>
      {children}
    </div>
  );
}

function DepotForm({
  objectifs,
  onClose,
  onSubmit,
}: {
  objectifs: Objectif[];
  onClose: () => void;
  onSubmit: (d: Omit<Depot, "id">) => void;
}) {
  const [montant, setMontant] = useState("");
  const [objectifId, setObjectifId] = useState(objectifs[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("hebdo");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [raison, setRaison] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const m = parseFloat(montant);
    if (!m || m <= 0 || !objectifId) return;
    onSubmit({
      montant: m,
      objectifId,
      mode,
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
      raison: raison.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border-2 border-[#D4A64F] bg-[#0F1115] p-4 rounded-sm shadow-[0_0_40px_#D4A64F66]"
      >
        <h3 className="pixel text-xs md:text-sm text-[#F5D06A]">✚ Nouveau Dépôt</h3>
        <div className="mt-3 grid gap-3">
          <label className="text-[10px] md:text-xs text-[#CFC8BD]">
            Montant (€)
            <input
              type="number" min="0" step="0.01" value={montant}
              onChange={(e) => setMontant(e.target.value)}
              required
              className="mt-1 w-full bg-[#18222E] border-2 border-[#D4A64F]/40 px-2 py-2 text-[#F5F0E8] pixel text-sm focus:outline-none focus:border-[#D4A64F]"
            />
          </label>
          <label className="text-[10px] md:text-xs text-[#CFC8BD]">
            Coffre
            <select
              value={objectifId}
              onChange={(e) => setObjectifId(e.target.value)}
              className="mt-1 w-full bg-[#18222E] border-2 border-[#D4A64F]/40 px-2 py-2 text-[#F5F0E8] text-xs focus:outline-none focus:border-[#D4A64F]"
            >
              {objectifs.map((o) => (
                <option key={o.id} value={o.id}>{o.emoji} {o.nom}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] md:text-xs text-[#CFC8BD]">
              Mode
              <select
                value={mode} onChange={(e) => setMode(e.target.value as Mode)}
                className="mt-1 w-full bg-[#18222E] border-2 border-[#D4A64F]/40 px-2 py-2 text-[#F5F0E8] text-xs focus:outline-none focus:border-[#D4A64F]"
              >
                <option value="hebdo">Hebdomadaire</option>
                <option value="mensuel">Mensuel</option>
              </select>
            </label>
            <label className="text-[10px] md:text-xs text-[#CFC8BD]">
              Date
              <input
                type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full bg-[#18222E] border-2 border-[#D4A64F]/40 px-2 py-2 text-[#F5F0E8] text-xs focus:outline-none focus:border-[#D4A64F]"
              />
            </label>
          </div>
          <label className="text-[10px] md:text-xs text-[#CFC8BD]">
            Note facultative
            <input
              value={note} onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full bg-[#18222E] border-2 border-[#D4A64F]/40 px-2 py-2 text-[#F5F0E8] text-xs focus:outline-none focus:border-[#D4A64F]"
            />
          </label>
          <label className="text-[10px] md:text-xs text-[#CFC8BD]">
            Pourquoi je protège mon futur aujourd'hui
            <textarea
              value={raison} onChange={(e) => setRaison(e.target.value)}
              rows={3}
              className="mt-1 w-full parchment-bg px-2 py-2 text-[#0F1115] text-xs focus:outline-none italic"
              style={{ fontFamily: "serif" }}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="pixel text-[10px] border-2 border-[#CFC8BD]/40 px-3 py-2 text-[#CFC8BD] hover:text-[#F5D06A]">
            Annuler
          </button>
          <button type="submit" className="pixel text-[10px] border-2 border-[#D4A64F] bg-[#1D3B2A] text-[#F5F0E8] px-3 py-2 hover:bg-[#D4A64F] hover:text-[#0F1115] shadow-[2px_2px_0_#000]">
            🪙 Confier
          </button>
        </div>
      </form>
    </div>
  );
}

function RitualConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md border-2 border-[#C64545] bg-[#0F1115] p-4 rounded-sm shadow-[0_0_40px_#C6454566]">
        <h3 className="pixel text-xs md:text-sm text-[#C64545]">🕯 Rituel d'Oubli</h3>
        <p className="mt-3 text-[10px] md:text-xs text-[#CFC8BD] italic" style={{ fontFamily: "serif" }}>
          « Les gardiennes de la Crypte effaceront entièrement les archives. Le temps repartira à zéro. »
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="pixel text-[10px] border-2 border-[#CFC8BD]/40 px-3 py-2 text-[#CFC8BD]">Annuler</button>
          <button onClick={onConfirm} className="pixel text-[10px] border-2 border-[#C64545] bg-[#C64545] text-[#0F1115] px-3 py-2 shadow-[2px_2px_0_#000] hover:bg-[#F5D06A] hover:border-[#F5D06A]">
            Accomplir le rituel
          </button>
        </div>
      </div>
    </div>
  );
}
