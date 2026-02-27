'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, BookOpen, Play } from 'lucide-react';
import type { WorkoutProgram, WorkoutDay } from '../lib/types';
import {
  loadProgram,
  saveProgram,
  generateProgramAsync,
  getTodaysDay,
  handleMissedDays,
  getPhaseName,
  getSplitName,
  getSplitScienceContext,
} from '../lib/program-engine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estimateDuration(day: WorkoutDay): string {
  if (day.isRest || day.exercises.length === 0) return '';
  const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const avgRest =
    day.exercises.reduce((sum, ex) => sum + ex.restSeconds, 0) / day.exercises.length;
  const minutes = (totalSets * (avgRest + 45)) / 60;
  const rounded = Math.max(5, Math.round(minutes / 5) * 5);
  return `~${rounded}m`;
}

function movementCount(day: WorkoutDay): string {
  const n = day.exercises.length;
  return `${n} movement${n !== 1 ? 's' : ''}`;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        let prog = loadProgram();

        if (!prog) {
          const raw = localStorage.getItem('fitcoach_profile');
          if (!raw) {
            // No profile → back to intake
            router.replace('/');
            return;
          }
          const profile = JSON.parse(raw);
          prog = await generateProgramAsync(profile);
          saveProgram(prog);
        }

        // Handle missed days
        prog = handleMissedDays(prog);
        saveProgram(prog);

        setProgram(prog);
      } catch (err) {
        console.error('[Dashboard] init error:', err);
        setError('Something went wrong. Please restart intake.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  // ── Reset handler ───────────────────────────────────────────────────────────
  function handleReset() {
    localStorage.removeItem('fitcoach_profile');
    localStorage.removeItem('fitcoach_program');
    router.push('/');
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(99,102,241,0.10)', filter: 'blur(120px)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(16,185,129,0.10)', filter: 'blur(120px)' }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
          <p className="text-zinc-400 text-sm tracking-widest uppercase">Building your program…</p>
        </div>
      </div>
    );
  }

  // ── Error / no program ──────────────────────────────────────────────────────
  if (!program) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden p-6">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(99,102,241,0.10)', filter: 'blur(120px)' }}
        />
        <p className="text-zinc-400 text-sm text-center max-w-xs">
          {error ?? 'No program found. Please complete the intake.'}
        </p>
        <button
          onClick={handleReset}
          className="mt-6 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-all text-sm"
        >
          Start Intake
        </button>
      </div>
    );
  }

  // ── Computed values ─────────────────────────────────────────────────────────
  const phaseName = getPhaseName(program);
  const splitName = getSplitName(program);
  const scienceContext = getSplitScienceContext(program);
  const currentWeek = program.weeks[program.currentWeekIndex];
  const todaysDay: WorkoutDay | null = getTodaysDay(program);
  const isDeloadWeek = currentWeek?.isDeload ?? false;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-x-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(99,102,241,0.07)', filter: 'blur(140px)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(16,185,129,0.07)', filter: 'blur(140px)' }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <p className="text-sm tracking-[0.2em] text-zinc-400 uppercase font-medium mb-1">
              Current Phase
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold">{phaseName}</h1>
              {isDeloadWeek && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full uppercase tracking-wider">
                  Deload Week
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 transition-colors shrink-0"
            title="Reset intake"
          >
            <Activity size={20} className="text-indigo-400" />
          </button>
        </header>

        {/* ── Science Context Card ─────────────────────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 md:p-8 mb-12 backdrop-blur-xl flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <BookOpen size={24} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 flex-wrap">
              {splitName}
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full uppercase tracking-wider">
                Evidence Based
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base max-w-3xl">
              {scienceContext}
              {' '}Training {program.profile.daysPerWeek} days/week.
            </p>
          </div>
        </div>

        {/* ── Weekly Schedule ──────────────────────────────────────────────────── */}
        <h3 className="text-xl font-medium mb-6 uppercase tracking-[0.05em]">
          Your Weekly Blueprint
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {currentWeek?.days.map((day, idx) => {
            const isToday = idx === program.currentDayIndex;
            const isRest = day.isRest;
            const duration = estimateDuration(day);
            const movements = isRest ? '' : movementCount(day);

            return (
              <div
                key={idx}
                className={[
                  'p-6 rounded-2xl border flex flex-col justify-between min-h-[160px] transition-all duration-300',
                  isToday
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : isRest
                    ? 'border-zinc-800/50 bg-zinc-900/20 opacity-50'
                    : 'border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-600',
                ].join(' ')}
              >
                {/* Top row: day label + today dot */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-zinc-500">
                    {DAY_LABELS[idx] ?? `Day ${idx + 1}`}
                  </span>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse" />
                  )}
                </div>

                {/* Workout name + meta */}
                <div className="flex-1">
                  <h4 className="font-medium text-lg leading-snug mb-1">
                    {isRest ? 'Recovery' : day.name}
                  </h4>
                  {!isRest && (
                    <p className="text-xs text-zinc-500">
                      {movements}
                      {duration ? ` • ${duration}` : ''}
                    </p>
                  )}
                </div>

                {/* Start Workout button — today only, training days only */}
                {isToday && !isRest && (
                  <button
                    onClick={() => router.push('/workout')}
                    className="mt-4 w-full bg-white text-black text-sm font-medium py-2 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={14} />
                    Start Workout →
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
