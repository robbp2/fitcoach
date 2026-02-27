// program-engine.ts — Deterministic workout program generator
// Takes a UserProfile and produces a complete WorkoutProgram stored in localStorage.

import type { UserProfile, WorkoutProgram, WorkoutWeek, WorkoutDay, VideoLibraryEntry } from './types';
import { getSplitForProfile } from './splits';
import {
  selectExercisesForDay,
  selectWarmupForDay,
} from './exercise-database';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fitcoach_program';
const TOTAL_PRE_GENERATED_WEEKS = 8;

// Lazy-loaded video library (avoids importing 329-entry JSON at module load time
// in contexts where it might cause issues; loads on first generateProgram call)
let _videoLibrary: VideoLibraryEntry[] | null = null;

async function getVideoLibrary(): Promise<VideoLibraryEntry[]> {
  if (_videoLibrary) return _videoLibrary;
  try {
    // In Next.js with resolveJsonModule: true, this static import works at build time
    const lib = await import('../../public/video-library.json');
    _videoLibrary = lib.default as VideoLibraryEntry[];
  } catch {
    _videoLibrary = [];
  }
  return _videoLibrary;
}

// Synchronous fallback used when generateProgram is called from a sync context
function getVideoLibrarySync(): VideoLibraryEntry[] {
  if (_videoLibrary) return _videoLibrary;
  // Will be populated on next call
  return [];
}

// ─── Core Generator ───────────────────────────────────────────────────────────

/**
 * Generates a complete WorkoutProgram from a UserProfile.
 * Pre-generates TOTAL_PRE_GENERATED_WEEKS weeks of workout data.
 */
export function generateProgram(profile: UserProfile, videoLibrary?: VideoLibraryEntry[]): WorkoutProgram {
  const lib = videoLibrary ?? getVideoLibrarySync();
  const splitTemplate = getSplitForProfile(profile);

  const weeks: WorkoutWeek[] = [];

  for (let weekNum = 1; weekNum <= TOTAL_PRE_GENERATED_WEEKS; weekNum++) {
    // Determine if this week is a deload week
    // First deload: at splitTemplate.deloadWeek (5 or 6)
    // Subsequent deloads: every deloadInterval weeks after
    const isDeload =
      weekNum >= splitTemplate.deloadWeek &&
      (weekNum - splitTemplate.deloadWeek) % splitTemplate.deloadInterval === 0;

    const days: WorkoutDay[] = splitTemplate.days.map((dayTemplate, dayIndex) => {
      if (dayTemplate.isRest) {
        return {
          dayIndex,
          name: dayTemplate.name,
          muscleGroups: [],
          isRest: true,
          isDeload: false,
          exercises: [],
          warmup: [],
        };
      }

      // For days that appear multiple times in the week (e.g., Push appears twice in PPL),
      // we track how many times we've seen this day name in this week to add variety
      const dayOffset = splitTemplate.days
        .slice(0, dayIndex)
        .filter((d) => d.name === dayTemplate.name && !d.isRest).length;

      const exercises = selectExercisesForDay(
        dayTemplate.muscleGroups,
        profile.equipment,
        lib,
        weekNum,
        profile.physiqueGoal,
        isDeload,
        dayOffset,
        `day${dayIndex}`,
        profile.hasKahuna
      );

      const warmup = selectWarmupForDay(dayTemplate.muscleGroups, lib, weekNum);

      return {
        dayIndex,
        name: dayTemplate.name,
        muscleGroups: dayTemplate.muscleGroups,
        isRest: false,
        isDeload,
        exercises,
        warmup,
      };
    });

    weeks.push({
      weekNumber: weekNum,
      isDeload,
      days,
    });
  }

  const now = new Date().toISOString();

  return {
    id: generateId(),
    profile,
    splitType: splitTemplate.splitType,
    weeks,
    currentWeekIndex: 0,
    currentDayIndex: 0,
    startDate: now,
    lastOpenedDate: now,
  };
}

/**
 * Async version of generateProgram that ensures the video library is loaded.
 * Prefer this when calling from a React component useEffect.
 */
export async function generateProgramAsync(profile: UserProfile): Promise<WorkoutProgram> {
  const lib = await getVideoLibrary();
  return generateProgram(profile, lib);
}

// ─── Program State ────────────────────────────────────────────────────────────

/**
 * Returns today's WorkoutDay from the current program state.
 * Returns null if the current day is a rest day.
 */
export function getTodaysWorkout(program: WorkoutProgram): WorkoutDay | null {
  const week = program.weeks[program.currentWeekIndex];
  if (!week) return null;

  const day = week.days[program.currentDayIndex];
  if (!day) return null;
  if (day.isRest) return null;

  return day;
}

/**
 * Returns today's WorkoutDay including rest days (for dashboard display).
 */
export function getTodaysDay(program: WorkoutProgram): WorkoutDay | null {
  const week = program.weeks[program.currentWeekIndex];
  if (!week) return null;
  return week.days[program.currentDayIndex] ?? null;
}

/**
 * Advances the program to the next day (call after workout completion).
 * If we're at the last day of the week, advances to the next week.
 * If we're at the last pre-generated week, generates more weeks.
 */
export function advanceProgram(program: WorkoutProgram): WorkoutProgram {
  const currentWeek = program.weeks[program.currentWeekIndex];
  if (!currentWeek) return program;

  let nextDayIndex = program.currentDayIndex + 1;
  let nextWeekIndex = program.currentWeekIndex;

  if (nextDayIndex >= currentWeek.days.length) {
    // Move to next week
    nextDayIndex = 0;
    nextWeekIndex = program.currentWeekIndex + 1;

    // If we've run out of pre-generated weeks, generate more
    if (nextWeekIndex >= program.weeks.length) {
      program = extendProgram(program, TOTAL_PRE_GENERATED_WEEKS);
    }
  }

  return {
    ...program,
    currentWeekIndex: nextWeekIndex,
    currentDayIndex: nextDayIndex,
    lastOpenedDate: new Date().toISOString(),
  };
}

/**
 * Handles missed days: called on every app open.
 * If lastOpenedDate was yesterday (or earlier) and we're on a training day,
 * advances to the next day WITHOUT counting it as completed.
 * This "skips" the missed day rather than rescheduling it.
 */
export function handleMissedDays(program: WorkoutProgram): WorkoutProgram {
  const today = new Date();
  const lastOpened = new Date(program.lastOpenedDate);

  // Calculate days elapsed since last open
  const msPerDay = 24 * 60 * 60 * 1000;
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastOpenedMidnight = new Date(
    lastOpened.getFullYear(),
    lastOpened.getMonth(),
    lastOpened.getDate()
  );

  const daysElapsed = Math.floor(
    (todayMidnight.getTime() - lastOpenedMidnight.getTime()) / msPerDay
  );

  if (daysElapsed <= 0) {
    // Same day, just update lastOpenedDate
    return { ...program, lastOpenedDate: today.toISOString() };
  }

  // Skip missed training days (up to daysElapsed - 1 days, since today is a new day)
  let updated = { ...program };
  for (let i = 0; i < daysElapsed - 1; i++) {
    const currentDay = getTodaysDay(updated);
    if (currentDay && !currentDay.isRest) {
      // Skip this training day
      updated = advanceProgram(updated);
    } else if (currentDay && currentDay.isRest) {
      // Also advance through rest days
      updated = advanceProgram(updated);
    }
  }

  return { ...updated, lastOpenedDate: today.toISOString() };
}

// ─── Program Extension ────────────────────────────────────────────────────────

/**
 * Generates additional weeks and appends them to an existing program.
 * Used when the user reaches the end of pre-generated content.
 */
function extendProgram(program: WorkoutProgram, additionalWeeks: number): WorkoutProgram {
  const lib = getVideoLibrarySync();
  const splitTemplate = getSplitForProfile(program.profile);
  const startWeekNum = program.weeks.length + 1;

  const newWeeks: WorkoutWeek[] = [];

  for (let w = 0; w < additionalWeeks; w++) {
    const weekNum = startWeekNum + w;
    const isDeload =
      weekNum >= splitTemplate.deloadWeek &&
      (weekNum - splitTemplate.deloadWeek) % splitTemplate.deloadInterval === 0;

    const days: WorkoutDay[] = splitTemplate.days.map((dayTemplate, dayIndex) => {
      if (dayTemplate.isRest) {
        return {
          dayIndex,
          name: dayTemplate.name,
          muscleGroups: [],
          isRest: true,
          isDeload: false,
          exercises: [],
          warmup: [],
        };
      }

      const dayOffset = splitTemplate.days
        .slice(0, dayIndex)
        .filter((d) => d.name === dayTemplate.name && !d.isRest).length;

      const exercises = selectExercisesForDay(
        dayTemplate.muscleGroups,
        program.profile.equipment,
        lib,
        weekNum,
        program.profile.physiqueGoal,
        isDeload,
        dayOffset,
        `day${dayIndex}`,
        program.profile.hasKahuna
      );

      const warmup = selectWarmupForDay(dayTemplate.muscleGroups, lib, weekNum);

      return {
        dayIndex,
        name: dayTemplate.name,
        muscleGroups: dayTemplate.muscleGroups,
        isRest: false,
        isDeload,
        exercises,
        warmup,
      };
    });

    newWeeks.push({ weekNumber: weekNum, isDeload, days });
  }

  return {
    ...program,
    weeks: [...program.weeks, ...newWeeks],
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/** Saves the program to localStorage. */
export function saveProgram(program: WorkoutProgram): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
  } catch (e) {
    console.error('[FitCoach] Failed to save program:', e);
  }
}

/** Loads the program from localStorage. Returns null if not found or invalid. */
export function loadProgram(): WorkoutProgram | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutProgram;
    // Basic validation
    if (!parsed.id || !parsed.profile || !Array.isArray(parsed.weeks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `prog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Returns the human-readable phase name for the current week.
 * Used in the dashboard header.
 */
export function getPhaseName(program: WorkoutProgram): string {
  const weekNum = program.currentWeekIndex + 1;
  const splitTemplate = getSplitForProfile(program.profile);

  if (
    weekNum >= splitTemplate.deloadWeek &&
    (weekNum - splitTemplate.deloadWeek) % splitTemplate.deloadInterval === 0
  ) {
    return `Deload Week — Active Recovery`;
  }

  const cycle = Math.ceil(weekNum / splitTemplate.deloadInterval);
  const weekInCycle = ((weekNum - 1) % (splitTemplate.deloadInterval - 1)) + 1;

  if (weekInCycle <= 2) return `Mesocycle ${cycle} — Accumulation`;
  if (weekInCycle <= 4) return `Mesocycle ${cycle} — Intensification`;
  return `Mesocycle ${cycle} — Peak`;
}

/**
 * Returns the science context for the current split (for the dashboard card).
 */
export function getSplitScienceContext(program: WorkoutProgram): string {
  const splitTemplate = getSplitForProfile(program.profile);
  return splitTemplate.scienceContext;
}

/**
 * Returns the split name (e.g., "Push / Pull / Legs × 2").
 */
export function getSplitName(program: WorkoutProgram): string {
  const splitTemplate = getSplitForProfile(program.profile);
  return splitTemplate.splitName;
}
