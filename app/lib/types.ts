// Core types for FitCoach

export interface UserProfile {
  physiqueGoal: 'hypertrophy' | 'strength' | 'metabolic' | 'athletic';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: 5 | 6 | 7;
  equipment: 'full-gym' | 'home-gym' | 'bodyweight';
  age: number;
  biologicalSex: 'male' | 'female';
  injuries: string[];
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  videoPath: string; // relative path from /men/ directory
  isWarmup: boolean;
  sets: number;
  repRange: string; // e.g. "8-12"
  restSeconds: number;
  rpe?: number;
  scienceNote: string;
}

export interface WorkoutDay {
  dayIndex: number; // 0-6 for Mon-Sun
  name: string; // e.g. "Push - Chest/Shoulders/Triceps"
  muscleGroups: string[];
  isRest: boolean;
  isDeload: boolean;
  exercises: Exercise[];
  warmup: Exercise[];
}

export interface WorkoutWeek {
  weekNumber: number;
  isDeload: boolean;
  days: WorkoutDay[];
}

export interface WorkoutProgram {
  id: string;
  profile: UserProfile;
  splitType: 'PPL' | 'UpperLower' | 'FullBody' | 'Hybrid';
  weeks: WorkoutWeek[];
  currentWeekIndex: number;
  currentDayIndex: number;
  startDate: string;
  lastOpenedDate: string;
}

export interface VideoLibraryEntry {
  muscleGroup: string;
  exerciseName: string;
  filename: string;
  relativePath: string; // e.g. "men/biceps/Dumbbell Biceps Curl.mp4"
  isWarmup: boolean;
}
