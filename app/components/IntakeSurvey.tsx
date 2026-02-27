'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Zap,
  Flame,
  Activity,
  Check,
} from 'lucide-react';
import { UserProfile } from '../lib/types';
import { generateProgramAsync } from '../lib/program-engine';

// ─── Form state type ───────────────────────────────────────────────────────────
interface FormData {
  physiqueGoal: UserProfile['physiqueGoal'] | null;
  experienceLevel: UserProfile['experienceLevel'] | null;
  daysPerWeek: UserProfile['daysPerWeek'] | null;
  equipment: UserProfile['equipment'] | null;
  hasKahuna: boolean;
  age: number | null;
  biologicalSex: UserProfile['biologicalSex'] | null;
  injuries: string;
}

const TOTAL_STEPS = 6;

// ─── Physique goal options ─────────────────────────────────────────────────────
const PHYSIQUE_GOALS = [
  {
    id: 'hypertrophy' as const,
    label: 'Build Muscle',
    desc: 'Maximize muscle volume & density',
    icon: Dumbbell,
    gradient: 'bg-gradient-to-br from-indigo-900/40 to-indigo-600/20',
    border: 'border-indigo-800/30',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'strength' as const,
    label: 'Get Strong',
    desc: 'Optimize strength & power output',
    icon: Zap,
    gradient: 'bg-gradient-to-br from-amber-900/40 to-amber-600/20',
    border: 'border-amber-800/30',
    iconColor: 'text-amber-400',
  },
  {
    id: 'metabolic' as const,
    label: 'Lean Out',
    desc: 'Preserve muscle while reducing body fat',
    icon: Flame,
    gradient: 'bg-gradient-to-br from-emerald-900/40 to-emerald-600/20',
    border: 'border-emerald-800/30',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'athletic' as const,
    label: 'Athletic',
    desc: 'Build functional fitness & conditioning',
    icon: Activity,
    gradient: 'bg-gradient-to-br from-cyan-900/40 to-cyan-600/20',
    border: 'border-cyan-800/30',
    iconColor: 'text-cyan-400',
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner' as const,
    label: 'Beginner',
    desc: 'Less than 1 year of consistent training',
  },
  {
    id: 'intermediate' as const,
    label: 'Intermediate',
    desc: '1-3 years, comfortable with compound lifts',
  },
  {
    id: 'advanced' as const,
    label: 'Advanced',
    desc: '3+ years, trained with structured programming',
  },
];

const EQUIPMENT_OPTIONS = [
  {
    id: 'full-gym' as const,
    label: 'Full Gym',
    desc: 'Commercial gym with all equipment',
  },
  {
    id: 'home-gym' as const,
    label: 'Home Gym',
    desc: 'Dumbbells, barbells, and a rack',
  },
  {
    id: 'bodyweight' as const,
    label: 'Bodyweight',
    desc: 'Minimal or no equipment',
  },
];

// ─── Goal labels for summary ───────────────────────────────────────────────────
const goalLabel = (g: UserProfile['physiqueGoal'] | null) =>
  PHYSIQUE_GOALS.find((p) => p.id === g)?.label ?? '—';
const equipLabel = (e: UserProfile['equipment'] | null) =>
  EQUIPMENT_OPTIONS.find((o) => o.id === e)?.label ?? '—';
const expLabel = (e: UserProfile['experienceLevel'] | null) =>
  EXPERIENCE_LEVELS.find((o) => o.id === e)?.label ?? '—';

// ─── Component ─────────────────────────────────────────────────────────────────
export default function IntakeSurvey() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<FormData>({
    physiqueGoal: null,
    experienceLevel: null,
    daysPerWeek: null,
    equipment: null,
    hasKahuna: false,
    age: null,
    biologicalSex: null,
    injuries: '',
  });

  const progress = (step / TOTAL_STEPS) * 100;

  // ── can we proceed from current step? ──────────────────────────────────────
  const canContinue = () => {
    if (step === 1) return form.physiqueGoal !== null;
    if (step === 2) return form.experienceLevel !== null;
    if (step === 3) return form.daysPerWeek !== null;
    if (step === 4) return form.equipment !== null;
    if (step === 5) return form.age !== null && form.biologicalSex !== null && form.age > 0;
    return true; // step 6 always ok
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setGenerating(true);
    const profile: UserProfile = {
      physiqueGoal: form.physiqueGoal!,
      experienceLevel: form.experienceLevel!,
      daysPerWeek: form.daysPerWeek!,
      equipment: form.equipment!,
      hasKahuna: form.equipment === 'home-gym' ? form.hasKahuna : false,
      age: form.age!,
      biologicalSex: form.biologicalSex!,
      injuries: form.injuries.trim() ? form.injuries.split(',').map((s) => s.trim()) : [],
      createdAt: new Date().toISOString(),
    };

    const program = await generateProgramAsync(profile);

    localStorage.setItem('fitcoach_profile', JSON.stringify(profile));
    localStorage.setItem('fitcoach_program', JSON.stringify(program));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center p-6 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full pointer-events-none" style={{ filter: 'blur(120px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full pointer-events-none" style={{ filter: 'blur(120px)' }} />

      <div className="w-full max-w-xl z-10 flex flex-col flex-1 pt-8 md:pt-16">
        {/* ── Header / progress ───────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-sm tracking-[0.2em] text-zinc-400 font-medium uppercase">
            FitCoach — Step {step} of {TOTAL_STEPS}
          </p>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Step content ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col pt-10 md:pt-16">

          {/* STEP 1 — Physique Goal */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Define your{' '}
                <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  physiological objective.
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {PHYSIQUE_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = form.physiqueGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setForm((f) => ({ ...f, physiqueGoal: goal.id }))}
                      className={`relative text-left p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center gap-3
                        ${goal.gradient} ${goal.border}
                        ${isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                          : 'hover:bg-zinc-800/50'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      <Icon size={36} className={goal.iconColor} />
                      <div className="text-center">
                        <h3 className="text-base font-semibold mb-1">{goal.label}</h3>
                        <p className="text-xs text-zinc-400 leading-snug">{goal.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Training Experience */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                What&apos;s your{' '}
                <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  training history?
                </span>
              </h2>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const isSelected = form.experienceLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setForm((f) => ({ ...f, experienceLevel: lvl.id }))}
                      className={`w-full text-left p-6 rounded-2xl border backdrop-blur-md transition-all duration-300
                        ${isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                          : 'border-zinc-700/60 bg-zinc-900/40 hover:bg-zinc-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-medium mb-1">{lvl.label}</h3>
                          <p className="text-sm text-zinc-400">{lvl.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 ml-4">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Training Frequency */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Establish your{' '}
                <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  training frequency.
                </span>
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {([5, 6, 7] as const).map((days) => {
                  const isSelected = form.daysPerWeek === days;
                  return (
                    <button
                      key={days}
                      onClick={() => setForm((f) => ({ ...f, daysPerWeek: days }))}
                      className={`p-8 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                          : 'border-zinc-700/60 bg-zinc-900/40 hover:bg-zinc-800/50'
                        }`}
                    >
                      <span className="text-5xl font-light mb-2">{days}</span>
                      <span className="text-xs text-zinc-400 tracking-wider uppercase text-center">
                        Days / Week
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 — Equipment */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                What&apos;s your{' '}
                <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  training environment?
                </span>
              </h2>
              <div className="space-y-3">
                {EQUIPMENT_OPTIONS.map((opt) => {
                  const isSelected = form.equipment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setForm((f) => ({ ...f, equipment: opt.id }))}
                      className={`w-full text-left p-6 rounded-2xl border backdrop-blur-md transition-all duration-300
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                          : 'border-zinc-700/60 bg-zinc-900/40 hover:bg-zinc-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-medium mb-1">{opt.label}</h3>
                          <p className="text-sm text-zinc-400">{opt.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 ml-4">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Kahuna add-on — shown only when Home Gym is selected */}
              {form.equipment === 'home-gym' && (
                <button
                  onClick={() => setForm((f) => ({ ...f, hasKahuna: !f.hasKahuna }))}
                  className={`w-full text-left p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between
                    ${form.hasKahuna
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                      : 'border-zinc-700/40 bg-zinc-900/20 hover:bg-zinc-800/30'
                    }`}
                >
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">
                      I have a smith machine / cable system
                    </p>
                    <p className="text-xs text-zinc-500">
                      e.g. Kahuna all-in-one — unlocks 36 cable + smith exercises
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-all ${
                    form.hasKahuna
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-zinc-600 bg-transparent'
                  }`}>
                    {form.hasKahuna && <Check size={14} className="text-white" />}
                  </div>
                </button>
              )}
            </div>
          )}

          {/* STEP 5 — Personal Details */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Tell us{' '}
                <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  about yourself.
                </span>
              </h2>

              {/* Age + Sex row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm tracking-[0.15em] text-zinc-400 font-medium uppercase">
                    Age
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={99}
                    value={form.age ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        age: e.target.value ? parseInt(e.target.value, 10) : null,
                      }))
                    }
                    placeholder="25"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-white text-lg font-light focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Biological Sex */}
                <div className="space-y-2">
                  <label className="text-sm tracking-[0.15em] text-zinc-400 font-medium uppercase">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-[54px]">
                    {(['male', 'female'] as const).map((sex) => (
                      <button
                        key={sex}
                        onClick={() => setForm((f) => ({ ...f, biologicalSex: sex }))}
                        className={`rounded-xl border text-sm font-medium transition-all duration-300 capitalize
                          ${form.biologicalSex === sex
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/50'
                          }`}
                      >
                        {sex.charAt(0).toUpperCase() + sex.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Injuries / limitations */}
              <div className="space-y-2">
                <label className="text-sm tracking-[0.15em] text-zinc-400 font-medium uppercase">
                  Injuries & Limitations
                </label>
                <textarea
                  rows={3}
                  value={form.injuries}
                  onChange={(e) => setForm((f) => ({ ...f, injuries: e.target.value }))}
                  placeholder="Any injuries or limitations? (optional)"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm font-light focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 6 — Ready */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Your program{' '}
                <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  is ready.
                </span>
              </h2>

              {/* Summary card */}
              <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4">
                <SummaryRow label="Goal" value={goalLabel(form.physiqueGoal)} />
                <div className="h-px bg-zinc-800/50" />
                <SummaryRow label="Experience" value={expLabel(form.experienceLevel)} />
                <div className="h-px bg-zinc-800/50" />
                <SummaryRow label="Frequency" value={form.daysPerWeek ? `${form.daysPerWeek} days / week` : '—'} />
                <div className="h-px bg-zinc-800/50" />
                <SummaryRow label="Equipment" value={
                  equipLabel(form.equipment) + (form.equipment === 'home-gym' && form.hasKahuna ? ' + Kahuna' : '')
                } />
                {form.age && (
                  <>
                    <div className="h-px bg-zinc-800/50" />
                    <SummaryRow label="Age" value={String(form.age)} />
                  </>
                )}
                {form.biologicalSex && (
                  <>
                    <div className="h-px bg-zinc-800/50" />
                    <SummaryRow
                      label="Sex"
                      value={form.biologicalSex.charAt(0).toUpperCase() + form.biologicalSex.slice(1)}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-4 pb-4">
          <button
            onClick={handleBack}
            className={`p-4 text-zinc-400 hover:text-white transition-colors ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ArrowLeft size={24} />
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canContinue()}
              className="flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={generating}
              className="flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Building program…</span>
                </>
              ) : (
                <>
                  <span>Generate My Program</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-zinc-500 tracking-wider uppercase">{label}</span>
      <span className="text-base font-medium text-white">{value}</span>
    </div>
  );
}
