"use client";

import { useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// DÉMO — lot « Assignation & suivi ».
// Initiales d'attribution (AM, SD…), assignation à un membre, création manuelle
// (briefing admin), filtre par personne, réglage admin « qui peut assigner »,
// et toggle Manager/Employé pour voir la vue selon le rôle. Maquette, état local.
// THROWAWAY. Couleur = PRIORITÉ sur les tâches ; la couleur membre vit seulement
// sur la pastille initiales (avatar) — jamais comme statut de tâche.
// ════════════════════════════════════════════════════════════════════════

type Member = { id: string; name: string; initials: string; color: string; role: "admin" | "member" };
type Priority = "haute" | "moyenne" | "basse";
type Status = "proposed" | "validated" | "done";
type Due = "today" | "week" | null;
type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  assigneeId: string | null;
  due: Due;
  source: "voice" | "manual";
};

const MEMBERS: Member[] = [
  { id: "u1", name: "Allan Morjon", initials: "AM", color: "#0059bb", role: "admin" },
  { id: "u2", name: "Sarah Diallo", initials: "SD", color: "#F39C12", role: "member" },
  { id: "u3", name: "Karim Benali", initials: "KB", color: "#2ECC71", role: "member" },
  { id: "u4", name: "Léa Martin", initials: "LM", color: "#9B59B6", role: "member" },
];
const byId = (id: string | null) => MEMBERS.find((m) => m.id === id) ?? null;

const PRIORITY: Record<Priority, { dot: string; label: string }> = {
  haute: { dot: "bg-error", label: "Haute" },
  moyenne: { dot: "bg-secondary", label: "Moyenne" },
  basse: { dot: "bg-primary", label: "Basse" },
};
const STATUS: Record<Status, { label: string; cls: string }> = {
  proposed: { label: "À confirmer", cls: "bg-azure text-secondary" },
  validated: { label: "Active", cls: "bg-azure text-primary" },
  done: { label: "Terminé", cls: "bg-surface-container text-on-surface-variant" },
};
const DUE_LABEL: Record<"today" | "week", string> = {
  today: "aujourd'hui",
  week: "cette semaine",
};

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Rappeler le client Dupont avant 18h", priority: "haute", status: "validated", assigneeId: "u2", due: "today", source: "voice" },
  { id: "t2", title: "Recompléter le stock de gants taille L", priority: "basse", status: "proposed", assigneeId: null, due: "week", source: "voice" },
  { id: "t3", title: "Vérifier la chambre froide n°2", priority: "moyenne", status: "done", assigneeId: "u3", due: "today", source: "manual" },
  { id: "t4", title: "Former le nouveau sur la ligne 3", priority: "moyenne", status: "validated", assigneeId: "u1", due: "week", source: "manual" },
];

// Pastille initiales (couleur du membre). Visuellement un avatar → pas de conflit
// avec la couleur de priorité.
function Initials({ m, size = 30, onClick, dim }: { m: Member | null; size?: number; onClick?: () => void; dim?: boolean }) {
  const style = { width: size, height: size, background: m ? m.color : undefined };
  const cls = `grid shrink-0 place-items-center rounded-full text-[11px] font-bold transition-transform ${
    m ? "text-white" : "border border-dashed border-outline-variant text-outline"
  } ${onClick ? "active:scale-95" : ""} ${dim ? "opacity-30" : ""}`;
  const content = m ? m.initials : "?";
  return onClick ? (
    <button type="button" onClick={onClick} style={style} className={cls} aria-label={m ? m.name : "Assigner"}>
      {content}
    </button>
  ) : (
    <span style={style} className={cls} aria-hidden>
      {content}
    </span>
  );
}

export default function DemoTasks() {
  const [role, setRole] = useState<"admin" | "member">("admin");
  const [assignMode, setAssignMode] = useState<"admin_only" | "everyone">("admin_only");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filterId, setFilterId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const me = role === "admin" ? MEMBERS[0] : MEMBERS[1];
  const canAssign = role === "admin" || assignMode === "everyone";

  const shown = filterId ? tasks.filter((t) => t.assigneeId === filterId) : tasks;

  const assign = (taskId: string, memberId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assigneeId: memberId } : t)));
    setAssigningId(null);
  };

  return (
    <main className="mx-auto w-full max-w-md px-5 pb-16 pt-5">
      {/* ── Bandeau de contrôle DÉMO : rôle + réglage admin ── */}
      <div className="mb-5 rounded-card bg-card p-4 shadow-card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Aperçu en tant que
        </p>
        <div className="flex gap-2">
          {(["admin", "member"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`h-10 flex-1 rounded-pill text-sm font-semibold transition-colors ${
                role === r ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {r === "admin" ? "Manager (Allan)" : "Employé (Sarah)"}
            </button>
          ))}
        </div>

        {/* Réglage admin : qui peut assigner (visible au manager seulement) */}
        {role === "admin" ? (
          <div className="mt-3 border-t border-outline-variant pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Réglage · Qui peut assigner des tâches
            </p>
            <div className="flex gap-2">
              {(["admin_only", "everyone"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAssignMode(mode)}
                  className={`h-10 flex-1 rounded-pill text-xs font-semibold transition-colors ${
                    assignMode === mode ? "bg-secondary text-white" : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {mode === "admin_only" ? "Admin seulement" : "Tout le monde"}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 border-t border-outline-variant pt-3 text-xs text-on-surface-variant">
            {canAssign
              ? "Le manager a ouvert l'assignation à tous : vous pouvez vous attribuer/réassigner des tâches."
              : "Seul le manager assigne les tâches (réglage actuel). Vous voyez les vôtres et l'avancement."}
          </p>
        )}
      </div>

      {/* ── En-tête + filtre par personne ── */}
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-secondary">Tâches</h1>
        <span className="text-xs text-on-surface-variant">{shown.length} affichée{shown.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterId(null)}
          className={`h-9 shrink-0 rounded-pill px-3 text-xs font-semibold transition-colors ${
            !filterId ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          Tous
        </button>
        {MEMBERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilterId(filterId === m.id ? null : m.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-pill py-1 pl-1 pr-3 text-xs font-semibold transition-colors ${
              filterId === m.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <Initials m={m} size={24} />
            {m.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* ── Création manuelle (briefing) ── */}
      {canAssign && (
        <NewTask
          me={me}
          onCancel={() => setCreating(false)}
          creating={creating}
          onOpen={() => setCreating(true)}
          onAdd={(t) => {
            setTasks((prev) => [t, ...prev]);
            setCreating(false);
          }}
        />
      )}

      {/* ── Liste ── */}
      <ul className="mt-4 flex flex-col gap-3">
        {shown.map((t) => {
          const a = byId(t.assigneeId);
          const p = PRIORITY[t.priority];
          const s = STATUS[t.status];
          return (
            <li key={t.id} className={`overflow-hidden rounded-card bg-card shadow-card ${t.status === "done" ? "opacity-70" : ""}`}>
              <div className="flex">
                <span aria-hidden className={`w-[3px] shrink-0 ${t.status === "proposed" ? "bg-primary" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-surface-container px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-on-surface">
                      <span className={`h-2 w-2 rounded-full ${p.dot}`} aria-hidden />
                      {p.label}
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <p className={`min-w-0 flex-1 text-sm font-medium leading-snug text-on-surface ${t.status === "done" ? "line-through" : ""}`}>
                      {t.title}
                    </p>
                    {/* Pastille initiales = assigné. Tap pour (ré)assigner si autorisé. */}
                    <Initials m={a} onClick={canAssign ? () => setAssigningId(t.id) : undefined} />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                    <span aria-hidden>{t.source === "voice" ? "🎙" : "✍️"}</span>
                    <span>
                      {a ? a.name.split(" ")[0] : "Non assignée"}
                      {t.due ? ` · ${DUE_LABEL[t.due]}` : ""}
                    </span>
                  </div>

                  {/* Mini-picker d'assignation */}
                  {assigningId === t.id && (
                    <div className="mt-3 rounded-field bg-surface-container-low p-2">
                      <p className="mb-2 px-1 text-xs font-semibold text-on-surface-variant">Assigner à…</p>
                      <div className="flex flex-wrap gap-2">
                        {MEMBERS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => assign(t.id, m.id)}
                            className="flex items-center gap-1.5 rounded-pill bg-card px-2 py-1 text-xs font-medium text-on-surface shadow-card active:scale-95"
                          >
                            <Initials m={m} size={22} />
                            {m.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="rounded-card bg-card p-6 text-center text-sm text-on-surface-variant shadow-card">
            Aucune tâche pour ce filtre.
          </li>
        )}
      </ul>

      <p className="mx-auto mt-6 max-w-md text-center text-xs text-outline">
        Maquette « Assignation & suivi » — lot distinct de l&apos;onboarding.
      </p>
    </main>
  );
}

// ── Création manuelle d'une tâche (briefing) ─────────────────────────────
function NewTask({
  me,
  creating,
  onOpen,
  onCancel,
  onAdd,
}: {
  me: Member;
  creating: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onAdd: (t: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("moyenne");
  const [assigneeId, setAssigneeId] = useState<string>(me.id);
  const [due, setDue] = useState<Due>("today");

  if (!creating) {
    return (
      <button
        onClick={onOpen}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
      >
        + Nouvelle tâche (briefing)
      </button>
    );
  }

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      id: `t${Date.now()}`,
      title: title.trim(),
      priority,
      status: "validated",
      assigneeId,
      due,
      source: "manual",
    });
    setTitle("");
    setPriority("moyenne");
    setAssigneeId(me.id);
    setDue("today");
  };

  return (
    <div className="rounded-card bg-card p-4 shadow-card">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        placeholder="Ex. Contrôler la palette retour fournisseur"
        className="w-full rounded-field bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Priorité</p>
      <div className="flex gap-2">
        {(["haute", "moyenne", "basse"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-field text-xs font-semibold transition-colors ${
              priority === p ? "bg-surface-container text-on-surface" : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${PRIORITY[p].dot}`} aria-hidden />
            {PRIORITY[p].label}
          </button>
        ))}
      </div>

      <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Assigné à</p>
      <div className="flex flex-wrap gap-2">
        {MEMBERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setAssigneeId(m.id)}
            className={`flex items-center gap-1.5 rounded-pill px-2 py-1 text-xs font-medium transition-colors ${
              assigneeId === m.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <Initials m={m} size={22} />
            {m.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Échéance</p>
      <div className="flex gap-2">
        {(["today", "week"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDue(d)}
            className={`h-9 flex-1 rounded-field text-xs font-semibold transition-colors ${
              due === d ? "bg-surface-container text-on-surface" : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            {d === "today" ? "Aujourd'hui" : "Cette semaine"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onCancel}
          className="h-12 rounded-pill bg-azure px-5 text-sm font-semibold text-primary transition-all hover:brightness-95"
        >
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!title.trim()}
          className="h-12 flex-1 rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-40"
        >
          Créer & assigner
        </button>
      </div>
    </div>
  );
}
