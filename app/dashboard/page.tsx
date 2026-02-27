'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Dumbbell, Moon, BookOpen, ChevronRight } from 'lucide-react';
import { WorkoutProgram, WorkoutDay } from '../lib/types';
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

export default function Dashboard() {
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [todaysDay, setTodaysDay] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initProgram() {
      try {
        // Check for existing program
        let prog = loadProgram();

        if (!prog) {
          // Check for profile
          const profileRaw = localStorage.getItem('fitcoach_profile');
          if (!profileRaw) {
            setLoading(false);
            return;
          }

          const profile = JSON.parse(profileRaw);
          // Generate program async (loads video library)
          prog = await generateProgramAsync(profile);
          saveProgram(prog);
        }

        // Handle missed days
        prog = handleMissedDays(prog);
        saveProgram(prog);

        setProgram(prog);
        setTodaysDay(getTodaysDay(prog));
      } catch (err) {
        console.error('[Dashboard] Failed to initialize program:', err);
        setError('Failed to load program. Please try restarting the intake.');
      } finally {
        setLoading(false);
      }
    }

    initProgram();
  }, []);

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-[#050505]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(99,102,241,0.1)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(16,185,129,0.1)', filter: 'blur(120px)' }} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
          <p className="text-zinc-400 text-sm tracking-widest uppercase">Building your program…</p>
        </div>
      </div>
    );
  }

  // ─── No profile ───────────────────────────────────────────────────────────

  if (!program) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-[#050505]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(99,102,241,0.1)', filter: 'blur(120px)' }} />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Activity size={32} className="text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-light text-white">No Program Found</h1>
            <p className="text-zinc-400 text-sm">{error ?? 'Complete the intake to generate your program.'}</p>
          </div>
          <Link href="/" className="flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-all">
            <span>Start Intake</span>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  const phaseName = getPhaseName(program);
  const splitName = getSplitName(program);
  const scienceContext = getSplitScienceContext(program);
  const currentWeek = program.weeks[program.currentWeekIndex];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(99,102,241,0.08)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(16,185,129,0.08)', filter: 'blur(120px)' }} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="text-xs tracking-[0.2em] text-zinc-500 font-medium uppercase">FitCoach</p>
          <h1 className="text-3xl font-light tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-semibold">
              {phaseName}
            </span>
          </h1>
          <p className="text-zinc-500 text-sm">{splitName}</p>
        </div>

        {/* ── Today's Workout Card ───────────────────────────────────── */}
        {todaysDay && !todaysDay.isRest ? (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md p-6 shadow-[0_0_40px_rgba(99,102,241,0.1)] space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs tracking-widest text-indigo-400 uppercase font-medium">Today</p>
                <h2 className="text-xl font-semibold leading-snug">{todaysDay.name}</h2>
                <p className="text-sm text-zinc-400">
                  {todaysDay.exercises.length} exercises
                  {todaysDay.isDeload && (
                    <span className="ml-2 text-amber-400 text-xs font-medium">• Deload Week</span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Dumbbell size={24} className="text-indigo-400" />
              </div>
            </div>

            {/* Exercise preview */}
            <div className="space-y-2">
              {todaysDay.exercises.slice(0, 4).map((ex) => (
                <div key={ex.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 truncate pr-2">{ex.name}</span>
                  <span className="text-zinc-500 shrink-0">{ex.sets}×{ex.repRange}</span>
                </div>
              ))}
              {todaysDay.exercises.length > 4 && (
                <p className="text-xs text-zinc-600">+{todaysDay.exercises.length - 4} more exercises</p>
              )}
            </div>

            <button className="w-full bg-white text-black py-4 rounded-xl font-semibold text-sm hover:bg-zinc-200 transition-all">
              Start Workout
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Moon size={20} className="text-zinc-500" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Rest & Recovery</h2>
                <p className="text-sm text-zinc-500">Your muscles are growing today.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Week Schedule ──────────────────────────────────────────── */}
        {currentWeek && (
          <div className="space-y-3">
            <h3 className="text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
              Week {currentWeek.weekNumber} Schedule
              {currentWeek.isDeload && <span className="ml-2 text-amber-400">• Deload</span>}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {currentWeek.days.map((day, i) => {
                const isToday = i === program.currentDayIndex;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                      ${isToday
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                        : day.isRest
                        ? 'border-zinc-800/30 bg-transparent text-zinc-600'
                        : 'border-zinc-800/50 bg-zinc-900/20 text-zinc-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-600 w-6">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}
                      </span>
                      <span className={`truncate ${isToday ? 'font-medium' : ''}`}>
                        {day.isRest ? 'Rest' : day.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isToday && (
                        <span className="text-xs text-indigo-400 font-medium">Today</span>
                      )}
                      {!day.isRest && (
                        <span className="text-xs text-zinc-600">{day.exercises.length} ex</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Science Context Card ──────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md p-6 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400 shrink-0" />
            <h3 className="text-sm font-semibold text-indigo-400 tracking-wide uppercase">Why This Split</h3>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{scienceContext}</p>
        </div>

        {/* ── Footer / Reset ────────────────────────────────────────── */}
        <div className="text-center pt-2">
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('fitcoach_profile');
                localStorage.removeItem('fitcoach_program');
              }
            }}
            className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
          >
            ← Restart Intake
          </Link>
        </div>

      </div>
    </div>
  );
}
