// program-engine.ts — Deterministic workout program generator
// React Native version: uses AsyncStorage instead of localStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, WorkoutProgram, WorkoutWeek, WorkoutDay, VideoLibraryEntry } from './types';
import { getSplitForProfile } from './splits';
import {
  selectExercisesForDay,
  selectWarmupForDay,
} from './exercise-database';

// Import video library directly (React Native bundled asset)
import videoLib from '../assets/video-library.json';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fitcoach_program';
const TOTAL_PRE_GENERATED_WEEKS = 8;

// Video library loaded from bundled JSON
const _videoLibrary: VideoLibraryEntry[] = videoLib as VideoLibraryEntry[];

function getVideoLibrary(): VideoLibraryEntry[] {
  return _videoLibrary;
}

// ─── Core Generator ───────────────────────────────────────────────────────────

/**
 * Generates a complete WorkoutProgram from a UserProfile.
 * Pre-generates TOTAL_PRE_GENERATED_WEEKS weeks of workout data.
 */
export function generateProgram(profile: UserProfile, videoLibrary?: VideoLibraryEntry[]): WorkoutProgram {
  const lib = videoLibrary ?? getVideoLibrary();
  const splitTemplate = getSplitForProfile(profile);

  const weeks: WorkoutWeek[] = [];

  for (let weekNum = 1; weekNum <= TOTAL_PRE_GENERATED_WEEKS; weekNum++) {
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
 * Async version of generateProgram.
 * In the RN version the video library is already bundled, so this is just a wrapper.
 */
export async function generateProgramAsync(profile: UserProfile): Promise<WorkoutProgram> {
  return generateProgram(profile, getVideoLibrary());
}

// ─── Program State ────────────────────────────────────────────────────────────

export function getTodaysWorkout(program: WorkoutProgram): WorkoutDay | null {
  const week = program.weeks[program.currentWeekIndex];
  if (!week) return null;

  const day = week.days[program.currentDayIndex];
  if (!day) return null;
  if (day.isRest) return null;

  return day;
}

export function getTodaysDay(program: WorkoutProgram): WorkoutDay | null {
  const week = program.weeks[program.currentWeekIndex];
  if (!week) return null;
  return week.days[program.currentDayIndex] ?? null;
}

export function advanceProgram(program: WorkoutProgram): WorkoutProgram {
  const currentWeek = program.weeks[program.currentWeekIndex];
  if (!currentWeek) return program;

  let nextDayIndex = program.currentDayIndex + 1;
  let nextWeekIndex = program.currentWeekIndex;

  if (nextDayIndex >= currentWeek.days.length) {
    nextDayIndex = 0;
    nextWeekIndex = program.currentWeekIndex + 1;

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

export function handleMissedDays(program: WorkoutProgram): WorkoutProgram {
  const today = new Date();
  const lastOpened = new Date(program.lastOpenedDate);

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
    return { ...program, lastOpenedDate: today.toISOString() };
  }

  let updated = { ...program };
  for (let i = 0; i < daysElapsed - 1; i++) {
    const currentDay = getTodaysDay(updated);
    if (currentDay && !currentDay.isRest) {
      updated = advanceProgram(updated);
    } else if (currentDay && currentDay.isRest) {
      updated = advanceProgram(updated);
    }
  }

  return { ...updated, lastOpenedDate: today.toISOString() };
}

// ─── Program Extension ────────────────────────────────────────────────────────

function extendProgram(program: WorkoutProgram, additionalWeeks: number): WorkoutProgram {
  const lib = getVideoLibrary();
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

// ─── Persistence (AsyncStorage) ──────────────────────────────────────────────

/** Saves the program to AsyncStorage. */
export async function saveProgram(program: WorkoutProgram): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(program));
  } catch (e) {
    console.error('[FitCoach] Failed to save program:', e);
  }
}

/** Loads the program from AsyncStorage. Returns null if not found or invalid. */
export async function loadProgram(): Promise<WorkoutProgram | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutProgram;
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

export function getSplitScienceContext(program: WorkoutProgram): string {
  const splitTemplate = getSplitForProfile(program.profile);
  return splitTemplate.scienceContext;
}

export function getSplitName(program: WorkoutProgram): string {
  const splitTemplate = getSplitForProfile(program.profile);
  return splitTemplate.splitName;
}
