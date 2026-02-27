'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Clock,
  Zap,
  Activity,
  Check,
} from 'lucide-react';
import type { WorkoutProgram, WorkoutDay, Exercise } from '../lib/types';
import {
  loadProgram,
  saveProgram,
  getTodaysDay,
  advanceProgram,
} from '../lib/program-engine';

// ─── Circular Progress Ring ──────────────────────────────────────────────────

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function RestRing({ progress }: { progress: number }) {
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" className="rotate-[-90deg]">
      <circle
        cx={60}
        cy={60}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(99,102,241,0.15)"
        strokeWidth={6}
      />
      <circle
        cx={60}
        cy={60}
        r={RING_RADIUS}
        fill="none"
        stroke="rgb(99,102,241)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

// ─── Time Formatter ──────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Core state ────────────────────────────────────────────────────────────
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [todaysDay, setTodaysDay] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRestDay, setIsRestDay] = useState(false);

  // ── Workout state ─────────────────────────────────────────────────────────
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<boolean[][]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  // ── Rest timer ────────────────────────────────────────────────────────────
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(0);

  // ── Derived: flat exercise list ───────────────────────────────────────────
  const allExercises: Exercise[] = todaysDay
    ? [...(todaysDay.warmup || []), ...todaysDay.exercises]
    : [];
  const totalExercises = allExercises.length;
  const currentExercise = allExercises[exerciseIndex] ?? null;

  // Current exercise set tracking
  const currentSets = completedSets[exerciseIndex] ?? [];
  const currentSetIndex = currentSets.findIndex((s) => !s);
  const allSetsComplete = currentSets.length > 0 && currentSets.every(Boolean);
  const isLastExercise = exerciseIndex === totalExercises - 1;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const prog = loadProgram();
    if (!prog) {
      router.replace('/');
      return;
    }

    const day = getTodaysDay(prog);
    if (!day) {
      router.replace('/dashboard');
      return;
    }

    if (day.isRest) {
      setIsRestDay(true);
      setProgram(prog);
      setTodaysDay(day);
      setLoading(false);
      return;
    }

    const exercises = [...(day.warmup || []), ...day.exercises];
    const initialSets = exercises.map((ex) => Array(ex.sets).fill(false) as boolean[]);

    setProgram(prog);
    setTodaysDay(day);
    setCompletedSets(initialSets);
    setLoading(false);
  }, [router]);

  // ── Video control ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentExercise || !videoRef.current) return;
    const video = videoRef.current;
    video.load();
    video.play().catch(() => {});
    setIsPlaying(true);
  }, [exerciseIndex, currentExercise?.videoPath]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // ── Rest timer countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) {
      setRestTimer(null);
      return;
    }
    const id = setTimeout(() => {
      setRestTimer((r) => (r !== null ? r - 1 : null));
    }, 1000);
    return () => clearTimeout(id);
  }, [restTimer]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function markSetComplete(setIdx: number) {
    if (restTimer !== null) return;
    if (setIdx !== currentSetIndex) return;

    setCompletedSets((prev) => {
      const updated = prev.map((arr) => [...arr]);
      updated[exerciseIndex][setIdx] = true;
      return updated;
    });

    // Start rest timer if not the last set of this exercise
    const isLastSet = setIdx === (currentExercise?.sets ?? 1) - 1;
    if (!isLastSet && currentExercise) {
      setRestTotal(currentExercise.restSeconds);
      setRestTimer(currentExercise.restSeconds);
    }
  }

  function skipRest() {
    setRestTimer(null);
  }

  function nextExercise() {
    if (!allSetsComplete) return;
    if (isLastExercise) {
      if (program) {
        const updated = advanceProgram(program);
        saveProgram(updated);
      }
      router.push('/dashboard');
    } else {
      setExerciseIndex((prev) => prev + 1);
      setRestTimer(null);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
          <p className="text-zinc-400 text-sm tracking-widest uppercase">
            Loading workout…
          </p>
        </div>
      </div>
    );
  }

  // ── Rest Day ──────────────────────────────────────────────────────────────
  if (isRestDay) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ backgroundColor: 'rgba(16,185,129,0.10)', filter: 'blur(120px)' }}
        />
        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Activity size={36} className="text-emerald-400" />
          </div>
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] text-emerald-400 uppercase font-medium">
              Recovery Day
            </p>
            <h1 className="text-3xl font-semibold">Rest &amp; Recover</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your muscles grow during recovery, not during training. Stay hydrated,
              prioritise sleep, and consider light mobility work or a walk.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded-full px-6 py-3 hover:bg-zinc-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── No data guard ─────────────────────────────────────────────────────────
  if (!currentExercise || !todaysDay || !program) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-zinc-400">No workout data available.</p>
      </div>
    );
  }

  // ── Progress ──────────────────────────────────────────────────────────────
  const progressPercent = totalExercises > 0
    ? ((exerciseIndex / totalExercises) * 100)
    : 0;

  const restProgress = restTotal > 0 && restTimer !== null
    ? (restTotal - restTimer) / restTotal
    : 0;

  // ── Render: Active Workout ────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden">

      {/* ── Video Panel (left / top) ───────────────────────────────────────── */}
      <div className="relative w-full md:w-[60%] h-[50vh] md:h-full shrink-0 bg-black">
        {/* Video */}
        <video
          ref={videoRef}
          key={currentExercise.videoPath}
          src={`/${currentExercise.videoPath}`}
          loop
          playsInline
          autoPlay
          muted
          className="w-full h-full object-cover opacity-80"
        />

        {/* Play/Pause overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isPlaying ? (
              <Pause size={32} className="text-white" />
            ) : (
              <Play size={32} className="text-white ml-1" />
            )}
          </div>
        </button>

        {/* Show play icon when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Play size={32} className="text-white ml-1" />
            </div>
          </div>
        )}

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Exit
          </button>
          <div className="text-right">
            <p className="text-xs text-white/60 tracking-wide uppercase">
              {todaysDay.name}
            </p>
            <p className="text-sm text-white/80 font-medium">
              {exerciseIndex + 1} / {totalExercises}
            </p>
          </div>
        </div>

        {/* Video progress bar (simulated) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Interaction Panel (right / bottom) ─────────────────────────────── */}
      <div className="flex-1 bg-[#0a0a0a] overflow-y-auto flex flex-col">
        {/* Exercise progress bar */}
        <div className="h-1 bg-zinc-900 shrink-0">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div
          key={exerciseIndex}
          className="flex-1 p-6 md:p-8 flex flex-col gap-6"
          style={{ animation: 'fadeSlideIn 0.7s ease-out both' }}
        >
          {/* Exercise Name + Set Counter */}
          <div>
            <h2 className="text-3xl font-semibold mb-2">{currentExercise.name}</h2>
            {allSetsComplete ? (
              <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase">
                All sets complete
              </p>
            ) : (
              <p className="text-zinc-400 text-sm">
                Set {(currentSetIndex === -1 ? currentExercise.sets : currentSetIndex + 1)} of {currentExercise.sets}
              </p>
            )}
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Zap size={16} className="text-amber-400" />
              <span className="text-zinc-300">{currentExercise.sets} sets</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity size={16} className="text-cyan-400" />
              <span className="text-zinc-300">{currentExercise.repRange} reps</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-indigo-400" />
              <span className="text-zinc-300">{currentExercise.restSeconds}s rest</span>
            </div>
            {currentExercise.rpe != null && (
              <div className="flex items-center gap-2 text-sm">
                <Zap size={16} className="text-rose-400" />
                <span className="text-zinc-300">RPE {currentExercise.rpe}</span>
              </div>
            )}
          </div>

          {/* Science Note */}
          {currentExercise.scienceNote && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-indigo-400" />
                <span className="text-xs tracking-[0.2em] text-zinc-400 font-medium uppercase">
                  Kinesiology Note
                </span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {currentExercise.scienceNote}
              </p>
            </div>
          )}

          {/* Rest Timer Overlay */}
          {restTimer !== null && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative flex items-center justify-center">
                <RestRing progress={restProgress} />
                <span className="absolute text-2xl font-semibold tabular-nums">
                  {formatTime(restTimer)}
                </span>
              </div>
              <p className="text-xs tracking-[0.2em] text-zinc-400 uppercase font-medium">
                Rest Period
              </p>
              <button
                onClick={skipRest}
                className="text-sm text-zinc-500 hover:text-white border border-zinc-800 rounded-full px-6 py-2 hover:bg-zinc-900 transition-colors"
              >
                Skip
              </button>
            </div>
          )}

          {/* Set Progression Buttons */}
          {restTimer === null && (
            <div className="flex flex-col gap-2">
              <p className="text-xs tracking-[0.2em] text-zinc-400 font-medium uppercase mb-1">
                Sets
              </p>
              {currentSets.map((done, idx) => {
                const isCurrent = idx === currentSetIndex;
                let classes: string;
                if (done) {
                  classes =
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
                } else if (isCurrent) {
                  classes =
                    'bg-zinc-900 border-zinc-600 text-white shadow-lg cursor-pointer';
                } else {
                  classes =
                    'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-700';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => markSetComplete(idx)}
                    disabled={!isCurrent || restTimer !== null}
                    className={`flex items-center justify-between px-5 py-3 rounded-xl border transition-all ${classes}`}
                  >
                    <span className="text-sm font-medium">
                      Set {idx + 1}
                      <span className="ml-2 text-xs opacity-60">
                        {currentExercise.repRange} reps
                      </span>
                    </span>
                    {done && <Check size={18} />}
                    {isCurrent && !done && (
                      <ChevronRight size={18} className="opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Navigation Button */}
          <button
            onClick={nextExercise}
            disabled={!allSetsComplete}
            className={`w-full px-8 py-4 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
              allSetsComplete
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            {isLastExercise ? 'Complete Workout' : 'Next Exercise'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
