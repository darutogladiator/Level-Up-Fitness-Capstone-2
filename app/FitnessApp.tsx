"use client";

import {
  Activity,
  Apple,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  Flame,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  UserRound,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import type {
  DashboardData,
  NutritionEntry,
  Profile,
  Quest,
  RecommendationPlan,
  UserIdentity,
  Workout,
} from "@/lib/types";

type View =
  | "command"
  | "workouts"
  | "nutrition"
  | "quests"
  | "coach"
  | "insights"
  | "profile";

type ModalState =
  | { type: "workout"; workout?: Workout }
  | { type: "nutrition" }
  | null;

const navItems = [
  { id: "command" as View, label: "Command", icon: Home },
  { id: "workouts" as View, label: "Workouts", icon: Dumbbell },
  { id: "nutrition" as View, label: "Nutrition", icon: Utensils },
  { id: "quests" as View, label: "Daily quests", icon: ClipboardCheck },
  { id: "coach" as View, label: "AI coach", icon: Bot },
  { id: "insights" as View, label: "Insights", icon: BarChart3 },
  { id: "profile" as View, label: "Profile", icon: UserRound },
];

function localDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "LU"
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function SignInGate() {
  return (
    <main className="signin-shell">
      <section className="signin-card">
        <BrandMark />
        <p className="eyebrow">Level Up Fitness · secure access</p>
        <h1>Your next level starts with one completed quest.</h1>
        <p>
          Sign in to keep workouts, nutrition, quests, XP, recommendations, and
          progress connected to your account.
        </p>
        <a className="primary-button" href="/signin-with-chatgpt?return_to=%2F">
          <UserRound size={18} /> Sign in with ChatGPT <ChevronRight size={17} />
        </a>
        <div className="signin-trust">
          <ShieldCheck size={17} />
          Identity is handled by the hosting platform. Fitness records remain
          separated by signed-in email.
        </div>
      </section>
    </main>
  );
}

function EmptyState({
  icon: Icon,
  title,
  copy,
  action,
}: {
  icon: typeof Dumbbell;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={22} />
      </span>
      <strong>{title}</strong>
      <p>{copy}</p>
      {action}
    </div>
  );
}

function ProgressBar({
  value,
  max,
  tone = "cyan",
}: {
  value: number;
  max: number;
  tone?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`progress-track ${tone}`} aria-label={`${percent}% complete`}>
      <i style={{ width: `${percent}%` }} />
    </div>
  );
}

// Assigned ownership area: Dario — dashboard, gamification, XP, levels, ranks, and final integration.
function DashboardView({
  data,
  busy,
  onView,
  onQuest,
  onOpenWorkout,
  onLoadShowcase,
}: {
  data: DashboardData;
  busy: boolean;
  onView: (view: View) => void;
  onQuest: (quest: Quest) => void;
  onOpenWorkout: () => void;
  onLoadShowcase: () => void;
}) {
  const complete = data.quests.filter((quest) => quest.done).length;
  const recent = data.workouts.slice(0, 3);
  return (
    <div className="view-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">
            <span>Daily protocol</span> Operation: Ascend
          </p>
          <h1>Consistency becomes progression.</h1>
          <p>
            Welcome back, {data.profile.displayName.split(" ")[0]}. Complete the
            next action, collect XP, and make tomorrow’s starting point stronger.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onOpenWorkout}>
              <Zap size={17} /> Log today’s workout <ChevronRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => onView("coach")}>
              <Bot size={16} /> Generate plan
            </button>
          </div>
        </div>
        <div className="level-orbit">
          <span className="orbit-line orbit-a" />
          <span className="orbit-line orbit-b" />
          <div className="level-core">
            <small>Level</small>
            <strong>{data.xp.level}</strong>
            <span>
              Rank {data.xp.rank} · {data.xp.title}
            </span>
          </div>
          <em className="orbit-tag tag-a">{formatNumber(data.xp.total)} XP</em>
          <em className="orbit-tag tag-b">{data.xp.progress}%</em>
        </div>
      </section>

      <section className="stats-grid" aria-label="Fitness summary">
        {[
          { icon: Flame, label: "Active streak", value: `${data.stats.streak} days`, detail: "Consecutive training days", tone: "amber" },
          { icon: Dumbbell, label: "This week", value: `${data.stats.sessionsThisWeek} sessions`, detail: `${formatNumber(data.stats.totalVolume)} lb volume`, tone: "cyan" },
          { icon: Activity, label: "Calories burned", value: formatNumber(data.stats.caloriesBurned), detail: "From saved workouts", tone: "violet" },
          { icon: Apple, label: "Protein today", value: `${data.stats.proteinToday} / ${data.profile.proteinTarget}g`, detail: `${data.stats.caloriesToday} calories logged`, tone: "green" },
        ].map(({ icon: Icon, label, value, detail, tone }) => (
          <article className="stat-card" key={label}>
            <span className={`stat-icon ${tone}`}>
              <Icon size={18} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel quest-board">
          <header className="panel-heading">
            <div>
              <p className="eyebrow">Today’s objectives</p>
              <h2>Daily quest board</h2>
            </div>
            <button className="text-button" onClick={() => onView("quests")}>
              {complete}/{data.quests.length} complete <ChevronRight size={14} />
            </button>
          </header>
          <div className="quest-list">
            {data.quests.map((quest) => (
              <button
                className={`quest-row ${quest.done ? "done" : ""}`}
                key={quest.id}
                onClick={() => onQuest(quest)}
                disabled={busy}
              >
                <span className={`quest-check ${quest.type}`}>
                  {quest.done ? <Check size={15} /> : <Target size={15} />}
                </span>
                <span>
                  <strong>{quest.title}</strong>
                  <small>{quest.detail}</small>
                </span>
                <em>+{quest.xp} XP</em>
              </button>
            ))}
          </div>
        </article>

        <article className="panel rank-panel">
          <p className="eyebrow">Rank progression</p>
          <div className="rank-lockup">
            <span>{data.xp.rank}</span>
            <div>
              <h2>{data.xp.title}</h2>
              <p>{data.xp.currentLevelXp} / {data.xp.nextLevelXp} XP to next level</p>
            </div>
          </div>
          <ProgressBar value={data.xp.currentLevelXp} max={data.xp.nextLevelXp} tone="violet" />
          <div className="rank-meta">
            <span><Trophy size={15} /> Total XP</span>
            <strong>{formatNumber(data.xp.total)}</strong>
          </div>
          {data.workouts.length === 0 && (
            <button className="secondary-button wide" onClick={onLoadShowcase} disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={16} />}
              Load showcase journey
            </button>
          )}
        </article>
      </section>

      <section className="panel recent-panel">
        <header className="panel-heading">
          <div>
            <p className="eyebrow">Verified activity</p>
            <h2>Recent workouts</h2>
          </div>
          <button className="text-button" onClick={() => onView("workouts")}>
            Full history <ChevronRight size={14} />
          </button>
        </header>
        {recent.length ? (
          <div className="compact-list">
            {recent.map((workout) => (
              <div key={workout.id}>
                <span className="list-icon"><Dumbbell size={16} /></span>
                <div>
                  <strong>{workout.exercise}</strong>
                  <small>{workout.category} · {formatDate(workout.workoutDate)}</small>
                </div>
                <span>{workout.sets} × {workout.reps}</span>
                <em>{workout.weight ? `${workout.weight} lb` : `${workout.durationMinutes} min`}</em>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="No workout records yet"
            copy="Log the first session or load the persistent showcase journey."
            action={
              <button className="secondary-button" onClick={onOpenWorkout}>
                <Plus size={15} /> Log workout
              </button>
            }
          />
        )}
      </section>
    </div>
  );
}

// Assigned ownership area: Johnkerby — workout history, editing, deletion, and progress tracking.
function WorkoutsView({
  data,
  onAdd,
  onEdit,
  onDelete,
}: {
  data: DashboardData;
  onAdd: () => void;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}) {
  return (
    <div className="view-stack">
      <PageTitle
        eyebrow="Training archive"
        title="Every session becomes evidence."
        copy="Create, edit, and remove workout records. Volume, streaks, calories, quests, and XP update from the saved history."
        action={
          <button className="primary-button" onClick={onAdd}>
            <Plus size={16} /> Log workout
          </button>
        }
      />
      <section className="panel">
        {data.workouts.length ? (
          <div className="record-list">
            {data.workouts.map((workout) => (
              <article key={workout.id}>
                <span className="record-date">
                  <small>{new Date(`${workout.workoutDate}T12:00:00`).toLocaleString("en-US", { month: "short" })}</small>
                  <strong>{workout.workoutDate.slice(-2)}</strong>
                </span>
                <div className="record-main">
                  <span>{workout.category}</span>
                  <h3>{workout.exercise}</h3>
                  <p>{workout.notes || "No session notes"}</p>
                </div>
                <div className="record-metrics">
                  <span><strong>{workout.sets} × {workout.reps}</strong><small>sets × reps</small></span>
                  <span><strong>{workout.weight} lb</strong><small>working weight</small></span>
                  <span><strong>{workout.durationMinutes} min</strong><small>duration</small></span>
                  <span><strong>{workout.calories}</strong><small>calories</small></span>
                </div>
                <div className="record-actions">
                  <button onClick={() => onEdit(workout)} aria-label={`Edit ${workout.exercise}`}>
                    <Pencil size={15} />
                  </button>
                  <button className="danger" onClick={() => onDelete(workout)} aria-label={`Delete ${workout.exercise}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="Your training archive is empty"
            copy="Record a real session to begin calculating progress and XP."
            action={<button className="primary-button" onClick={onAdd}><Plus size={15} /> Log workout</button>}
          />
        )}
      </section>
    </div>
  );
}

function NutritionView({
  data,
  onAdd,
  onDelete,
}: {
  data: DashboardData;
  onAdd: () => void;
  onDelete: (entry: NutritionEntry) => void;
}) {
  const today = localDateKey();
  const entries = data.nutrition.filter((entry) => entry.entryDate === today);
  const totals = entries.reduce(
    (sum, entry) => ({
      calories: sum.calories + entry.calories,
      protein: sum.protein + entry.protein,
      carbs: sum.carbs + entry.carbs,
      fat: sum.fat + entry.fat,
      water: sum.water + entry.waterGlasses,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
  );
  return (
    <div className="view-stack">
      <PageTitle
        eyebrow="Nutrition protocol"
        title="Fuel the next level."
        copy="Track meals, calories, macronutrients, and hydration. Reaching the daily protein target automatically completes its quest."
        action={<button className="primary-button" onClick={onAdd}><Plus size={16} /> Add nutrition</button>}
      />
      <section className="macro-grid">
        {[
          ["Calories", totals.calories, data.profile.calorieTarget, "amber"],
          ["Protein", totals.protein, data.profile.proteinTarget, "cyan"],
          ["Carbs", totals.carbs, 280, "violet"],
          ["Hydration", totals.water, 8, "green"],
        ].map(([label, value, max, tone]) => (
          <article className="panel macro-card" key={String(label)}>
            <span>{label}</span>
            <strong>{value}{label === "Protein" ? "g" : label === "Carbs" ? "g" : label === "Hydration" ? " glasses" : ""}</strong>
            <small>Target {max}{label === "Protein" || label === "Carbs" ? "g" : ""}</small>
            <ProgressBar value={Number(value)} max={Number(max)} tone={String(tone)} />
          </article>
        ))}
      </section>
      <section className="panel">
        <header className="panel-heading">
          <div><p className="eyebrow">Today</p><h2>Nutrition entries</h2></div>
          <span className="status-badge">{entries.length} records</span>
        </header>
        {entries.length ? (
          <div className="nutrition-list">
            {entries.map((entry) => (
              <article key={entry.id}>
                <span className="list-icon"><Apple size={16} /></span>
                <div><strong>{entry.meal}</strong><small>{entry.protein}g protein · {entry.carbs}g carbs · {entry.fat}g fat</small></div>
                <span>{entry.calories} kcal</span>
                <button className="icon-danger" onClick={() => onDelete(entry)} aria-label={`Delete ${entry.meal}`}><Trash2 size={15} /></button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={Apple} title="Nothing logged today" copy="Add a meal or hydration entry to start today’s nutrition totals." />
        )}
      </section>
    </div>
  );
}

function QuestsView({
  quests,
  busy,
  onToggle,
}: {
  quests: Quest[];
  busy: boolean;
  onToggle: (quest: Quest) => void;
}) {
  const done = quests.filter((quest) => quest.done).length;
  return (
    <div className="view-stack">
      <PageTitle
        eyebrow="Daily objectives"
        title="Turn the plan into proof."
        copy="Training, movement, nutrition, and recovery contribute to the same progression loop."
      />
      <section className="quest-layout">
        <div className="panel mission-stack">
          {quests.map((quest, index) => (
            <button
              className={`mission-card ${quest.done ? "done" : ""}`}
              key={quest.id}
              onClick={() => onToggle(quest)}
              disabled={busy}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i className={quest.type}>{quest.done ? <Check size={17} /> : <Target size={17} />}</i>
              <div><small>{quest.type}</small><strong>{quest.title}</strong><p>{quest.detail}</p></div>
              <em>{quest.done ? "Complete" : `+${quest.xp} XP`}</em>
            </button>
          ))}
        </div>
        <aside className="panel completion-panel">
          <div className="completion-ring" style={{ "--progress": `${Math.round((done / quests.length) * 100)}%` } as React.CSSProperties}>
            <span><strong>{done}/{quests.length}</strong><small>complete</small></span>
          </div>
          <h2>Daily completion</h2>
          <p>Quest XP is recorded in an immutable ledger, preventing duplicate rewards for the same objective and date.</p>
        </aside>
      </section>
    </div>
  );
}

// Assigned ownership area: Aryan — goal intake, AI plan generation, structured display, and safety messaging.
function CoachView({
  profile,
  recommendation,
  busy,
  onGenerate,
}: {
  profile: Profile;
  recommendation: RecommendationPlan | null;
  busy: boolean;
  onGenerate: (payload: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({
    goal: profile.goal,
    experienceLevel: profile.experienceLevel,
    equipment: profile.equipment,
    scheduleDays: profile.scheduleDays,
    sessionMinutes: profile.sessionMinutes,
    limitations: "",
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    onGenerate(form);
  }
  return (
    <div className="view-stack">
      <PageTitle
        eyebrow="Adaptive guidance"
        title="A plan built around your reality."
        copy="The coach uses structured inputs and returns an explainable weekly plan. When the AI service is unavailable, a deterministic fallback keeps the demo reliable."
      />
      <section className="coach-layout">
        <form className="panel form-panel" onSubmit={submit}>
          <header className="panel-heading"><div><p className="eyebrow">Plan inputs</p><h2>Recommendation request</h2></div><Bot size={19} /></header>
          <FormField label="Primary goal"><input required value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></FormField>
          <div className="form-grid">
            <FormField label="Experience level">
              <select value={form.experienceLevel} onChange={(event) => setForm({ ...form, experienceLevel: event.target.value })}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </FormField>
            <FormField label="Days per week"><input type="number" min="2" max="6" value={form.scheduleDays} onChange={(event) => setForm({ ...form, scheduleDays: Number(event.target.value) })} /></FormField>
            <FormField label="Minutes per session"><input type="number" min="20" max="180" value={form.sessionMinutes} onChange={(event) => setForm({ ...form, sessionMinutes: Number(event.target.value) })} /></FormField>
            <FormField label="Equipment"><input required value={form.equipment} onChange={(event) => setForm({ ...form, equipment: event.target.value })} /></FormField>
          </div>
          <FormField label="Limitations or pain considerations">
            <textarea rows={3} placeholder="Optional. Do not include private medical records." value={form.limitations} onChange={(event) => setForm({ ...form, limitations: event.target.value })} />
          </FormField>
          <button className="primary-button wide" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
            {busy ? "Building protocol…" : "Generate workout protocol"}
          </button>
        </form>
        <div className="panel recommendation-panel">
          {recommendation ? (
            <>
              <header className="recommendation-head">
                <div><p className="eyebrow">Latest protocol</p><h2>{recommendation.title}</h2></div>
                <span className={`engine-badge ${recommendation.engine}`}>{recommendation.engine === "openai" ? "OpenAI" : "Adaptive fallback"}</span>
              </header>
              <p className="recommendation-summary">{recommendation.summary}</p>
              <div className="rationale">
                <strong>Why this plan</strong>
                {recommendation.rationale.map((reason) => <p key={reason}><Check size={13} /> {reason}</p>)}
              </div>
              <div className="plan-days">
                {recommendation.days.map((day) => (
                  <details key={day.day}>
                    <summary><span>{day.day}</span><strong>{day.focus}</strong><em>{day.durationMinutes} min</em></summary>
                    <div>
                      {day.exercises.map((exercise) => (
                        <article key={`${day.day}-${exercise.name}`}>
                          <strong>{exercise.name}</strong>
                          <span>{exercise.sets} sets · {exercise.reps}</span>
                          <small>{exercise.note}</small>
                        </article>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              <p className="safety-note"><ShieldCheck size={15} /> {recommendation.safetyNote}</p>
            </>
          ) : (
            <EmptyState icon={Bot} title="No protocol generated yet" copy="Complete the form to create and save a structured plan." />
          )}
        </div>
      </section>
    </div>
  );
}

function InsightsView({ data }: { data: DashboardData }) {
  const maxVolume = Math.max(...data.progress.map((point) => point.volume), 1);
  return (
    <div className="view-stack">
      <PageTitle
        eyebrow="Performance intelligence"
        title="Growth you can explain."
        copy="These metrics are calculated from the signed-in user’s saved workout history, not hard-coded dashboard values."
      />
      <section className="stats-grid insight-cards">
        {[
          ["Training volume", `${formatNumber(data.stats.totalVolume)} lb`, "Rolling seven days"],
          ["Estimated 1RM", `${formatNumber(data.stats.estimatedOneRepMax)} lb`, "Epley estimate from best set"],
          ["Consistency", `${data.stats.consistency}%`, "Completed vs planned sessions"],
          ["Current streak", `${data.stats.streak} days`, "Consecutive workout dates"],
        ].map(([label, value, detail]) => (
          <article className="stat-card" key={label}><span className="stat-icon cyan"><BarChart3 size={18} /></span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
        ))}
      </section>
      <section className="insights-grid">
        <article className="panel chart-panel">
          <header className="panel-heading"><div><p className="eyebrow">Eight-week signal</p><h2>Training volume</h2></div><span className="status-badge">Live records</span></header>
          <div className="bar-chart" aria-label="Training volume over eight weeks">
            {data.progress.map((point) => (
              <div key={point.label}>
                <span title={`${formatNumber(point.volume)} pounds`} style={{ height: `${Math.max(5, Math.round((point.volume / maxVolume) * 100))}%` }}><i>{point.sessions}</i></span>
                <small>{point.label}</small>
              </div>
            ))}
          </div>
          <div className="chart-key"><span><i /> Volume</span><span>Number above bar = sessions</span></div>
        </article>
        <article className="panel system-insight">
          <span className="insight-icon"><Bot size={21} /></span>
          <p className="eyebrow">System insight</p>
          <h2>{data.stats.consistency >= 75 ? "Consistency is becoming a strength." : "Protect the next scheduled session."}</h2>
          <p>
            {data.stats.consistency >= 75
              ? `You completed ${data.stats.consistency}% of your four-week schedule. Add load gradually and preserve recovery.`
              : `Current consistency is ${data.stats.consistency}%. A shorter session completed on schedule is more valuable than an ideal session skipped.`}
          </p>
          <div><span>Evidence used</span><strong>{data.workouts.length} saved workouts</strong><strong>{data.stats.sessionsThisWeek} sessions this week</strong><strong>{formatNumber(data.stats.totalVolume)} lb weekly volume</strong></div>
        </article>
      </section>
    </div>
  );
}

// Assigned ownership area: Khang — profile, personalization, navigation, settings, responsive UX, and QA.
function ProfileView({
  profile,
  busy,
  onSave,
  onLoadShowcase,
}: {
  profile: Profile;
  busy: boolean;
  onSave: (payload: Record<string, unknown>) => void;
  onLoadShowcase: () => void;
}) {
  const [form, setForm] = useState(profile);
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(form);
  }
  return (
    <div className="view-stack">
      <PageTitle eyebrow="Hunter profile" title="Personalize the system." copy="Your profile controls nutrition targets and the context used by the recommendation engine." />
      <section className="profile-layout">
        <aside className="panel identity-card">
          <span className={`avatar large ${profile.accent}`}>{initials(profile.displayName)}</span>
          <h2>{profile.displayName}</h2>
          <p>{profile.email}</p>
          <span className="status-badge"><ShieldCheck size={13} /> Authenticated</span>
          <a className="secondary-button wide" href="/signout-with-chatgpt?return_to=%2F"><LogOut size={15} /> Sign out</a>
        </aside>
        <form className="panel form-panel" onSubmit={submit}>
          <header className="panel-heading"><div><p className="eyebrow">Settings</p><h2>Training preferences</h2></div><Settings size={18} /></header>
          <div className="form-grid">
            <FormField label="Display name"><input required value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></FormField>
            <FormField label="Experience level"><select value={form.experienceLevel} onChange={(event) => setForm({ ...form, experienceLevel: event.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></FormField>
          </div>
          <FormField label="Primary goal"><input required value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></FormField>
          <FormField label="Available equipment"><input required value={form.equipment} onChange={(event) => setForm({ ...form, equipment: event.target.value })} /></FormField>
          <div className="form-grid">
            <FormField label="Days per week"><input type="number" min="2" max="7" value={form.scheduleDays} onChange={(event) => setForm({ ...form, scheduleDays: Number(event.target.value) })} /></FormField>
            <FormField label="Session minutes"><input type="number" min="20" max="180" value={form.sessionMinutes} onChange={(event) => setForm({ ...form, sessionMinutes: Number(event.target.value) })} /></FormField>
            <FormField label="Calorie target"><input type="number" min="1000" max="6000" value={form.calorieTarget} onChange={(event) => setForm({ ...form, calorieTarget: Number(event.target.value) })} /></FormField>
            <FormField label="Protein target (g)"><input type="number" min="40" max="400" value={form.proteinTarget} onChange={(event) => setForm({ ...form, proteinTarget: Number(event.target.value) })} /></FormField>
          </div>
          <fieldset className="accent-picker"><legend>Interface accent</legend>{["cyan", "violet", "green", "amber"].map((accent) => <label key={accent} className={accent}><input type="radio" name="accent" checked={form.accent === accent} onChange={() => setForm({ ...form, accent })} /><span />{accent}</label>)}</fieldset>
          <button className="primary-button wide" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />} Save profile</button>
          <button className="text-button showcase-loader" type="button" onClick={onLoadShowcase} disabled={busy}><Sparkles size={14} /> Load or repair showcase journey</button>
        </form>
      </section>
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <section className="page-title">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>
      {action}
    </section>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

function WorkoutModal({
  workout,
  busy,
  onClose,
  onSubmit,
}: {
  workout?: Workout;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>, id?: string) => void;
}) {
  const [form, setForm] = useState({
    workoutDate: workout?.workoutDate ?? localDateKey(),
    exercise: workout?.exercise ?? "Barbell bench press",
    category: workout?.category ?? "Strength",
    sets: workout?.sets ?? 4,
    reps: workout?.reps ?? 8,
    weight: workout?.weight ?? 135,
    durationMinutes: workout?.durationMinutes ?? 45,
    calories: workout?.calories ?? 300,
    notes: workout?.notes ?? "",
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form, workout?.id);
  }
  return (
    <Modal title={workout ? "Edit workout" : "Log workout"} eyebrow="Training record" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid"><FormField label="Date"><input type="date" required value={form.workoutDate} onChange={(event) => setForm({ ...form, workoutDate: event.target.value })} /></FormField><FormField label="Category"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Strength</option><option>Cardio</option><option>Mobility</option><option>Sports</option><option>Recovery</option></select></FormField></div>
        <FormField label="Exercise or session name"><input required value={form.exercise} onChange={(event) => setForm({ ...form, exercise: event.target.value })} /></FormField>
        <div className="form-grid four"><FormField label="Sets"><input type="number" min="1" max="50" value={form.sets} onChange={(event) => setForm({ ...form, sets: Number(event.target.value) })} /></FormField><FormField label="Reps"><input type="number" min="1" max="200" value={form.reps} onChange={(event) => setForm({ ...form, reps: Number(event.target.value) })} /></FormField><FormField label="Weight (lb)"><input type="number" min="0" max="2000" value={form.weight} onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })} /></FormField><FormField label="Minutes"><input type="number" min="1" max="600" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} /></FormField></div>
        <FormField label="Calories burned"><input type="number" min="0" max="10000" value={form.calories} onChange={(event) => setForm({ ...form, calories: Number(event.target.value) })} /></FormField>
        <FormField label="Session notes"><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></FormField>
        <button className="primary-button wide" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{workout ? "Save changes" : "Complete and award XP"}</button>
      </form>
    </Modal>
  );
}

function NutritionModal({
  busy,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({ entryDate: localDateKey(), meal: "Post-workout meal", calories: 650, protein: 45, carbs: 75, fat: 18, waterGlasses: 1 });
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }
  return (
    <Modal title="Add nutrition" eyebrow="Fuel record" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid"><FormField label="Date"><input type="date" required value={form.entryDate} onChange={(event) => setForm({ ...form, entryDate: event.target.value })} /></FormField><FormField label="Meal or entry"><input required value={form.meal} onChange={(event) => setForm({ ...form, meal: event.target.value })} /></FormField></div>
        <div className="form-grid four"><FormField label="Calories"><input type="number" min="0" value={form.calories} onChange={(event) => setForm({ ...form, calories: Number(event.target.value) })} /></FormField><FormField label="Protein (g)"><input type="number" min="0" value={form.protein} onChange={(event) => setForm({ ...form, protein: Number(event.target.value) })} /></FormField><FormField label="Carbs (g)"><input type="number" min="0" value={form.carbs} onChange={(event) => setForm({ ...form, carbs: Number(event.target.value) })} /></FormField><FormField label="Fat (g)"><input type="number" min="0" value={form.fat} onChange={(event) => setForm({ ...form, fat: Number(event.target.value) })} /></FormField></div>
        <FormField label="Water glasses"><input type="number" min="0" max="30" value={form.waterGlasses} onChange={(event) => setForm({ ...form, waterGlasses: Number(event.target.value) })} /></FormField>
        <button className="primary-button wide" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Apple size={16} />}Save nutrition entry</button>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header><div><p className="eyebrow">{eyebrow}</p><h2 id="modal-title">{title}</h2></div><button onClick={onClose} aria-label="Close"><X size={19} /></button></header>
        {children}
      </section>
    </div>
  );
}

export default function FitnessApp({ initialUser }: { initialUser: UserIdentity | null }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<View>("command");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(initialUser));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [dateKey] = useState(localDateKey);

  const load = useCallback(async () => {
    if (!initialUser) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/bootstrap?date=${dateKey}`, { cache: "no-store" });
      const payload = (await response.json()) as DashboardData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to load the dashboard.");
      setData(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, [dateKey, initialUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function mutate(
    url: string,
    options: RequestInit,
    success: string,
    closeModal = false,
  ) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
      if (closeModal) setModal(null);
      await load();
      setToast(payload.message || success);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request could not be completed.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!initialUser) return <SignInGate />;
  if (loading && !data) {
    return <main className="loading-screen"><BrandMark /><LoaderCircle className="spin" size={26} /><span>Initializing fitness system…</span></main>;
  }
  if (!data) {
    return (
      <main className="loading-screen error-screen">
        <ShieldCheck size={28} />
        <h1>System connection interrupted</h1>
        <p>{error}</p>
        <button className="primary-button" onClick={() => void load()}><RefreshCw size={16} /> Try again</button>
      </main>
    );
  }

  function selectView(next: View) {
    setView(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleQuest(quest: Quest) {
    await mutate("/api/quests", { method: "POST", body: JSON.stringify({ questId: quest.id, complete: !quest.done, date: dateKey }) }, quest.done ? "Quest reopened." : `Quest complete · +${quest.xp} XP`);
  }

  async function saveWorkout(payload: Record<string, unknown>, id?: string) {
    await mutate("/api/workouts", { method: id ? "PATCH" : "POST", body: JSON.stringify(id ? { ...payload, id } : payload) }, id ? "Workout updated." : "Workout logged and XP awarded.", true);
  }

  async function deleteWorkout(workout: Workout) {
    if (!window.confirm(`Delete ${workout.exercise}? Its workout XP will also be removed.`)) return;
    await mutate(`/api/workouts?id=${encodeURIComponent(workout.id)}`, { method: "DELETE" }, "Workout deleted.");
  }

  async function saveNutrition(payload: Record<string, unknown>) {
    await mutate("/api/nutrition", { method: "POST", body: JSON.stringify(payload) }, "Nutrition entry saved.", true);
  }

  async function deleteNutrition(entry: NutritionEntry) {
    if (!window.confirm(`Delete ${entry.meal}?`)) return;
    await mutate(`/api/nutrition?id=${encodeURIComponent(entry.id)}`, { method: "DELETE" }, "Nutrition entry deleted.");
  }

  async function generatePlan(payload: Record<string, unknown>) {
    await mutate("/api/recommendations", { method: "POST", body: JSON.stringify(payload) }, "New workout protocol generated.");
  }

  async function saveProfile(payload: Record<string, unknown>) {
    await mutate("/api/profile", { method: "PATCH", body: JSON.stringify(payload) }, "Profile updated.");
  }

  async function loadShowcase() {
    await mutate("/api/demo", { method: "POST", body: JSON.stringify({ date: dateKey }) }, "Persistent showcase journey is ready.");
  }

  return (
    <div className={`app-shell accent-${data.profile.accent}`}>
      <div className={`sidebar-scrim ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button>
        <button className="brand" onClick={() => selectView("command")}><BrandMark /><span><strong>Level Up</strong><small>Fitness system</small></span></button>
        <div className="system-status"><i /><span>System online</span><small>full-stack build</small></div>
        <nav aria-label="Primary navigation">
          <p>System</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => selectView(item.id)}><Icon size={18} /><span>{item.label}</span></button>;
          })}
        </nav>
        <div className="sidebar-rank"><Trophy size={18} /><div><small>Current rank</small><strong>{data.xp.rank} · {data.xp.title}</strong></div><ProgressBar value={data.xp.currentLevelXp} max={data.xp.nextLevelXp} /></div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="topbar-context"><i /><span>{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</span><small>Day protocol active</small></div>
          <button className="profile-chip" onClick={() => selectView("profile")}><span className={`avatar ${data.profile.accent}`}>{initials(data.profile.displayName)}</span><div><strong>{data.profile.displayName}</strong><small>Level {data.xp.level}</small></div></button>
        </header>
        <main className="product-main">
          {error && <div className="error-banner"><ShieldCheck size={16} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={15} /></button></div>}
          {view === "command" && <DashboardView data={data} busy={busy} onView={selectView} onQuest={toggleQuest} onOpenWorkout={() => setModal({ type: "workout" })} onLoadShowcase={loadShowcase} />}
          {view === "workouts" && <WorkoutsView data={data} onAdd={() => setModal({ type: "workout" })} onEdit={(workout) => setModal({ type: "workout", workout })} onDelete={deleteWorkout} />}
          {view === "nutrition" && <NutritionView data={data} onAdd={() => setModal({ type: "nutrition" })} onDelete={deleteNutrition} />}
          {view === "quests" && <QuestsView quests={data.quests} busy={busy} onToggle={toggleQuest} />}
          {view === "coach" && <CoachView profile={data.profile} recommendation={data.recommendation} busy={busy} onGenerate={generatePlan} />}
          {view === "insights" && <InsightsView data={data} />}
          {view === "profile" && <ProfileView profile={data.profile} busy={busy} onSave={saveProfile} onLoadShowcase={loadShowcase} />}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => selectView(item.id)}><Icon size={18} /><span>{item.label === "Daily quests" ? "Quests" : item.label}</span></button>;
        })}
      </nav>
      {modal?.type === "workout" && <WorkoutModal workout={modal.workout} busy={busy} onClose={() => setModal(null)} onSubmit={saveWorkout} />}
      {modal?.type === "nutrition" && <NutritionModal busy={busy} onClose={() => setModal(null)} onSubmit={saveNutrition} />}
      <div className={`toast ${toast ? "show" : ""}`} role="status"><Check size={16} />{toast}</div>
    </div>
  );
}
