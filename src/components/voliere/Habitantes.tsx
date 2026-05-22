import { useRef, useState } from "react";
import {
  EMBLEMES,
  Habitante,
  ROLES_SUGGESTIONS,
  VoliereState,
  uid,
} from "@/lib/voliere";

export function Habitantes({
  state,
  setState,
}: {
  state: VoliereState;
  setState: React.Dispatch<React.SetStateAction<VoliereState>>;
}) {
  const [editing, setEditing] = useState<Habitante | null>(null);
  const [creating, setCreating] = useState(false);

  const ajouter = (h: Habitante) => {
    setState((s) => ({ ...s, habitantes: [...s.habitantes, h] }));
    setCreating(false);
  };

  const modifier = (h: Habitante) => {
    setState((s) => ({
      ...s,
      habitantes: s.habitantes.map((x) => (x.id === h.id ? h : x)),
    }));
    setEditing(null);
  };

  const supprimer = (id: string) => {
    if (!confirm("Retirer cette habitante du royaume ?")) return;
    setState((s) => ({ ...s, habitantes: s.habitantes.filter((x) => x.id !== id) }));
  };

  const deplacer = (id: string, dir: -1 | 1) => {
    setState((s) => {
      const arr = [...s.habitantes];
      const i = arr.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, habitantes: arr };
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="pixel text-[10px] text-copper">REGISTRE DES VISAGES</p>
          <p className="italic text-ivory/70 text-sm">
            « Le royaume se peuple de celles qui le font vivre. »
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-rpg text-[10px] px-4 py-2">
          ➕ Ajouter une habitante
        </button>
      </div>

      {state.habitantes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-3 opacity-50">👥</div>
          <h3 className="pixel text-xs text-gold mb-2">Le royaume est désert</h3>
          <p className="text-ivory/60 italic max-w-md mx-auto">
            Aucune habitante n'a encore rejoint la Volière. Ajoutez la première âme du royaume.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.habitantes.map((h, i) => (
            <CarteHabitante
              key={h.id}
              h={h}
              index={i}
              total={state.habitantes.length}
              onEdit={() => setEditing(h)}
              onDelete={() => supprimer(h.id)}
              onMove={(d) => deplacer(h.id, d)}
            />
          ))}
        </div>
      )}

      {creating && (
        <FormHabitante
          onClose={() => setCreating(false)}
          onSave={ajouter}
        />
      )}
      {editing && (
        <FormHabitante
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={modifier}
        />
      )}
    </div>
  );
}

function CarteHabitante({
  h,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
}: {
  h: Habitante;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (d: -1 | 1) => void;
}) {
  return (
    <article className="panel-rpg p-3 relative animate-letter">
      {/* Emblème en coin */}
      <div className="absolute -top-2 -right-2 inventory-slot w-10 h-10 flex items-center justify-center text-xl chest-icon z-10">
        {h.embleme || "✦"}
      </div>

      {/* Portrait */}
      <div className="inventory-slot mx-auto w-28 h-28 flex items-center justify-center overflow-hidden mb-3 mt-1">
        {h.portrait ? (
          <img
            src={h.portrait}
            alt={`Portrait de ${h.nom}`}
            className="w-full h-full object-cover"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <span className="text-5xl opacity-50">👤</span>
        )}
      </div>

      {/* Nom + titre sur parchemin */}
      <div className="parchment-premium px-3 py-2 text-center mb-2" style={{ boxShadow: "0 0 0 2px #3a2818, 0 0 0 3px #d4a64f, 2px 2px 0 #1a0f08" }}>
        <h3 className="royal-heading text-lg font-bold leading-tight">{h.nom || "Sans nom"}</h3>
        {h.titre && (
          <p className="text-[11px] italic text-[#5a3a18] mt-0.5">« {h.titre} »</p>
        )}
      </div>

      <ul className="text-[11px] space-y-1 text-ivory/85 px-1 min-h-[48px]">
        {h.role && (
          <li>
            <span className="pixel text-[9px] text-copper mr-1">RÔLE</span>
            {h.role}
          </li>
        )}
        {h.relation && (
          <li>
            <span className="pixel text-[9px] text-copper mr-1">LIEN</span>
            {h.relation}
          </li>
        )}
        {h.note && (
          <li className="italic text-ivory/60 pt-1 border-t border-gold/20">{h.note}</li>
        )}
      </ul>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1 pt-2 border-t border-gold/20">
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="pixel text-[10px] px-2 py-1 text-ivory/60 hover:text-gold disabled:opacity-20"
          title="Monter"
        >
          ▲
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="pixel text-[10px] px-2 py-1 text-ivory/60 hover:text-gold disabled:opacity-20"
          title="Descendre"
        >
          ▼
        </button>
        <button onClick={onEdit} className="ml-auto btn-rpg text-[9px] px-2 py-1">
          ✏ Modifier
        </button>
        <button onClick={onDelete} className="btn-rpg-ruby text-[9px] px-2 py-1">
          🗑
        </button>
      </div>
    </article>
  );
}

function FormHabitante({
  initial,
  onClose,
  onSave,
}: {
  initial?: Habitante;
  onClose: () => void;
  onSave: (h: Habitante) => void;
}) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [relation, setRelation] = useState(initial?.relation ?? "");
  const [embleme, setEmbleme] = useState(initial?.embleme ?? "🌹");
  const [portrait, setPortrait] = useState<string | undefined>(initial?.portrait);
  const [note, setNote] = useState(initial?.note ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null | undefined) => {
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) {
      alert("Image trop lourde (max ~1,5 Mo). Essayez une image plus petite.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPortrait(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    onSave({
      id: initial?.id ?? uid(),
      nom: nom.trim(),
      titre: titre.trim(),
      role: role.trim(),
      relation: relation.trim(),
      embleme,
      portrait,
      note: note.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm flex items-center justify-center p-4 animate-letter"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="panel-rpg p-5 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-3"
      >
        <h2 className="pixel text-sm text-gold text-center mb-2 text-pixel-shadow">
          {initial ? "✏ Modifier l'habitante" : "➕ Nouvelle habitante"}
        </h2>

        {/* Portrait + emblème */}
        <div className="flex items-center gap-4">
          <div className="inventory-slot w-24 h-24 flex items-center justify-center overflow-hidden flex-shrink-0">
            {portrait ? (
              <img src={portrait} alt="aperçu" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
            ) : (
              <span className="text-4xl opacity-50">👤</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-rpg text-[10px] px-3 py-2"
              >
                🖼 Choisir un portrait
              </button>
              {portrait && (
                <button
                  type="button"
                  onClick={() => setPortrait(undefined)}
                  className="btn-rpg-ruby text-[10px] px-3 py-2"
                >
                  Retirer
                </button>
              )}
            </div>
            <p className="text-[10px] text-ivory/50">PNG, JPG ou WEBP. Max ~1,5 Mo.</p>
          </div>
        </div>

        <label className="block">
          <span className="text-[10px] pixel text-copper block mb-1">Emblème personnel</span>
          <div className="flex flex-wrap gap-1">
            {EMBLEMES.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmbleme(e)}
                className={`w-9 h-9 text-lg flex items-center justify-center transition ${
                  embleme === e
                    ? "inventory-slot scale-110"
                    : "border border-border hover:border-gold"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] pixel text-copper block mb-1">Nom *</span>
          <input
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={inputCls}
            placeholder="Le nom porté dans le royaume"
          />
        </label>

        <label className="block">
          <span className="text-[10px] pixel text-copper block mb-1">Titre dans le royaume</span>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className={inputCls}
            placeholder="ex : Dame des Jardins, Promise Bien-Aimée…"
          />
        </label>

        <label className="block">
          <span className="text-[10px] pixel text-copper block mb-1">Rôle</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            list="roles-suggestions"
            className={inputCls}
            placeholder="villageoise, intendante, alliée…"
          />
          <datalist id="roles-suggestions">
            {ROLES_SUGGESTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="text-[10px] pixel text-copper block mb-1">Relation avec l'héroïne</span>
          <input
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className={inputCls}
            placeholder="amie d'enfance, sœur de cœur, mentore…"
          />
        </label>

        <label className="block">
          <span className="text-[10px] pixel text-copper block mb-1">Note (facultatif)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputCls} min-h-[60px]`}
            placeholder="Détails, souvenirs, particularités…"
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 pixel text-[10px] py-3 border-2 border-border text-ivory/70 hover:text-ivory"
          >
            Annuler
          </button>
          <button type="submit" className="flex-1 btn-rpg-emerald text-[10px] py-3">
            {initial ? "💾 Sauvegarder" : "🕊 Accueillir"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-input border-2 border-border px-3 py-2 text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold";
