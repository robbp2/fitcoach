import { exercises, Exercise, MuscleGroup, Equipment } from './exercises';

export interface ClientProfile {
  // Basic info
  height: number; // cm
  weight: number; // kg
  age: number;
  sex: 'male' | 'female';
  
  // Training history
  trainingLevel: 'beginner' | 'intermediate' | 'advanced';
  yearsTraining: number;
  currentFrequency: number;
  
  // Goals
  desiredPhysique: string;
  equipment: Equipment[];
  daysPerWeek: number;
  timePerSession: number; // minutes
  
  // Limitations
  injuries: string[];
  limitations: string;
  
  // Goal priorities (1-5 ranking)
  goals: {
    muscleGrowth: number;
    fatLoss: number;
    strength: number;
    endurance: number;
    flexibility: number;
  };
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: string; // e.g., "8-12" or "3-5"
  restSeconds: number;
  rpe: string; // e.g., "7-8" (Rate of Perceived Exertion)
  notes?: string;
}

export interface WorkoutDay {
  name: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutProgram {
  programName: string;
  split: string;
  weeklySchedule: WorkoutDay[];
  notes: string[];
}

// Volume recommendations based on training level (sets per muscle per week)
const volumeGuidelines = {
  beginner: { min: 10, max: 12 },
  intermediate: { min: 14, max: 18 },
  advanced: { min: 18, max: 22 }
};

// Rep ranges based on primary goal
function getRepRange(profile: ClientProfile): { min: number; max: number; rest: number } {
  const topGoal = getTopGoal(profile.goals);
  
  switch (topGoal) {
    case 'strength':
      return { min: 3, max: 6, rest: 240 }; // 4 minutes
    case 'muscleGrowth':
      return { min: 8, max: 12, rest: 75 }; // 75 seconds
    case 'endurance':
      return { min: 15, max: 20, rest: 40 }; // 40 seconds
    default:
      return { min: 8, max: 12, rest: 75 };
  }
}

function getTopGoal(goals: ClientProfile['goals']): string {
  const entries = Object.entries(goals);
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

// Filter exercises based on available equipment
function filterExercisesByEquipment(exerciseList: Exercise[], equipment: Equipment[]): Exercise[] {
  return exerciseList.filter(ex =>
    ex.equipment.every(eq => equipment.includes(eq) || eq === 'bodyweight' || eq === 'none')
  );
}

// Get exercises for a specific muscle group
function selectExercises(
  muscles: MuscleGroup[],
  equipment: Equipment[],
  count: number,
  difficulty: string,
  exclude: string[] = []
): Exercise[] {
  let candidates = exercises.filter(ex => {
    // Must target one of the primary muscles
    const targetsMuscle = ex.primaryMuscles.some(m => muscles.includes(m));
    // Must have compatible equipment
    const hasEquipment = ex.equipment.every(eq => 
      equipment.includes(eq) || eq === 'bodyweight' || eq === 'none'
    );
    // Not excluded
    const notExcluded = !exclude.includes(ex.id);
    // Appropriate difficulty
    const rightDifficulty = difficulty === 'beginner' 
      ? ex.difficulty !== 'advanced'
      : true;
    
    return targetsMuscle && hasEquipment && notExcluded && rightDifficulty;
  });
  
  // Prioritize compound movements first
  candidates.sort((a, b) => {
    const aCompound = a.primaryMuscles.length + a.secondaryMuscles.length;
    const bCompound = b.primaryMuscles.length + b.secondaryMuscles.length;
    return bCompound - aCompound;
  });
  
  return candidates.slice(0, count);
}

// Generate PPL (Push/Pull/Legs) program for 6 days
function generatePPL(profile: ClientProfile): WorkoutProgram {
  const repRange = getRepRange(profile);
  const volume = volumeGuidelines[profile.trainingLevel];
  
  // Push Day (Chest, Shoulders, Triceps)
  const pushDay: WorkoutDay = {
    name: 'Push',
    focus: 'Chest, Shoulders, Triceps',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 2, profile.trainingLevel),
        Math.ceil(volume.max / 2), // Sets per exercise
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 2, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['triceps'], profile.equipment, 2, profile.trainingLevel),
        3,
        repRange
      ),
    ]
  };
  
  // Pull Day (Back, Biceps)
  const pullDay: WorkoutDay = {
    name: 'Pull',
    focus: 'Back, Biceps, Rear Delts',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 3, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['biceps'], profile.equipment, 2, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 1, profile.trainingLevel),
        3,
        { ...repRange, rest: 60 }
      ),
    ]
  };
  
  // Leg Day (Quads, Hamstrings, Glutes, Calves)
  const legDay: WorkoutDay = {
    name: 'Legs',
    focus: 'Quads, Hamstrings, Glutes, Calves',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['hamstrings', 'glutes'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['calves'], profile.equipment, 1, profile.trainingLevel),
        4,
        { min: 12, max: 20, rest: 45 }
      ),
    ]
  };
  
  return {
    programName: 'Push/Pull/Legs Program',
    split: 'PPL (6 days/week)',
    weeklySchedule: [pushDay, pullDay, legDay, pushDay, pullDay, legDay],
    notes: [
      'Train 6 days per week: Push/Pull/Legs, then repeat',
      'Rest on day 7 or as needed',
      'Increase weight when you can complete the top of the rep range with good form',
      'RPE 7-8 means 2-3 reps left in the tank'
    ]
  };
}

// Generate Upper/Lower split for 4 days
function generateUpperLower(profile: ClientProfile): WorkoutProgram {
  const repRange = getRepRange(profile);
  const volume = volumeGuidelines[profile.trainingLevel];
  
  const upperA: WorkoutDay = {
    name: 'Upper A',
    focus: 'Horizontal Push/Pull emphasis',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['biceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['triceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
    ]
  };
  
  const lowerA: WorkoutDay = {
    name: 'Lower A',
    focus: 'Squat emphasis',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['hamstrings', 'glutes'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['calves'], profile.equipment, 1, profile.trainingLevel),
        3,
        { min: 12, max: 20, rest: 45 }
      ),
    ]
  };
  
  const upperB: WorkoutDay = {
    name: 'Upper B',
    focus: 'Vertical Push/Pull emphasis',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['biceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['triceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
    ]
  };
  
  const lowerB: WorkoutDay = {
    name: 'Lower B',
    focus: 'Hinge emphasis',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['hamstrings', 'glutes'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['calves'], profile.equipment, 1, profile.trainingLevel),
        3,
        { min: 12, max: 20, rest: 45 }
      ),
    ]
  };
  
  return {
    programName: 'Upper/Lower Split',
    split: 'Upper/Lower (4 days/week)',
    weeklySchedule: [upperA, lowerA, upperB, lowerB],
    notes: [
      'Train 4 days per week: Upper/Lower/Rest/Upper/Lower',
      'Two upper body and two lower body sessions',
      'Good balance between frequency and recovery',
      'Progress by adding weight or reps each week'
    ]
  };
}

// Generate Full Body program for 3 days
function generateFullBody(profile: ClientProfile): WorkoutProgram {
  const repRange = getRepRange(profile);
  
  const dayA: WorkoutDay = {
    name: 'Full Body A',
    focus: 'Squat/Horizontal Push/Vertical Pull',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['hamstrings'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['biceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
    ]
  };
  
  const dayB: WorkoutDay = {
    name: 'Full Body B',
    focus: 'Hinge/Vertical Push/Horizontal Pull',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['hamstrings', 'glutes'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['triceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
    ]
  };
  
  const dayC: WorkoutDay = {
    name: 'Full Body C',
    focus: 'Lunge/Mixed Push/Pull',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 1, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['hamstrings'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['biceps'], profile.equipment, 1, profile.trainingLevel),
        3,
        repRange
      ),
    ]
  };
  
  return {
    programName: 'Full Body Program',
    split: 'Full Body (3 days/week)',
    weeklySchedule: [dayA, dayB, dayC],
    notes: [
      'Train 3 days per week: Mon/Wed/Fri or similar',
      'Each session trains entire body',
      'Great for beginners or busy schedules',
      'High frequency for skill development'
    ]
  };
}

// Generate Bro Split for 5 days
function generateBroSplit(profile: ClientProfile): WorkoutProgram {
  const repRange = getRepRange(profile);
  
  const chest: WorkoutDay = {
    name: 'Chest Day',
    focus: 'Chest',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['chest'], profile.equipment, 5, profile.trainingLevel),
        4,
        repRange
      ),
    ]
  };
  
  const back: WorkoutDay = {
    name: 'Back Day',
    focus: 'Back',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['back'], profile.equipment, 5, profile.trainingLevel),
        4,
        repRange
      ),
    ]
  };
  
  const shoulders: WorkoutDay = {
    name: 'Shoulder Day',
    focus: 'Shoulders',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['shoulders'], profile.equipment, 5, profile.trainingLevel),
        4,
        repRange
      ),
    ]
  };
  
  const legs: WorkoutDay = {
    name: 'Leg Day',
    focus: 'Legs (Quads, Hamstrings, Glutes, Calves)',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['quads'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['hamstrings', 'glutes'], profile.equipment, 2, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['calves'], profile.equipment, 1, profile.trainingLevel),
        4,
        { min: 12, max: 20, rest: 45 }
      ),
    ]
  };
  
  const arms: WorkoutDay = {
    name: 'Arm Day',
    focus: 'Biceps & Triceps',
    exercises: [
      ...createWorkoutExercises(
        selectExercises(['biceps'], profile.equipment, 3, profile.trainingLevel),
        4,
        repRange
      ),
      ...createWorkoutExercises(
        selectExercises(['triceps'], profile.equipment, 3, profile.trainingLevel),
        4,
        repRange
      ),
    ]
  };
  
  return {
    programName: 'Bro Split',
    split: 'Bro Split (5 days/week)',
    weeklySchedule: [chest, back, shoulders, legs, arms],
    notes: [
      'Classic bodybuilding split',
      'One muscle group per day with high volume',
      'Monday is International Chest Day',
      'Good for intermediate to advanced lifters'
    ]
  };
}

// Helper to create workout exercises
function createWorkoutExercises(
  exerciseList: Exercise[],
  sets: number,
  repRange: { min: number; max: number; rest: number }
): WorkoutExercise[] {
  return exerciseList.map(ex => ({
    exercise: ex,
    sets,
    reps: `${repRange.min}-${repRange.max}`,
    restSeconds: repRange.rest,
    rpe: '7-8',
    notes: ex.difficulty === 'advanced' ? 'Advanced exercise - ensure proper form' : undefined
  }));
}

// Main program generator
export function generateProgram(profile: ClientProfile): WorkoutProgram {
  const daysPerWeek = profile.daysPerWeek;
  
  // Select split based on days per week
  if (daysPerWeek >= 6) {
    return generatePPL(profile);
  } else if (daysPerWeek >= 4) {
    return generateUpperLower(profile);
  } else if (daysPerWeek >= 5) {
    return generateBroSplit(profile);
  } else {
    return generateFullBody(profile);
  }
}

// Get today's workout based on day of week
export function getTodaysWorkout(program: WorkoutProgram, dayOfWeek: number): WorkoutDay | null {
  // dayOfWeek: 0 = Sunday, 1 = Monday, etc.
  
  if (program.split.includes('PPL')) {
    // PPL: Mon-Sat, rest Sunday
    if (dayOfWeek === 0) return null;
    return program.weeklySchedule[(dayOfWeek - 1) % program.weeklySchedule.length];
  }
  
  if (program.split.includes('Upper/Lower')) {
    // Upper/Lower: Mon/Tue/Thu/Fri
    const schedule = [null, 0, 1, null, 2, 3, null]; // Sunday = 0
    const index = schedule[dayOfWeek];
    return index !== null ? program.weeklySchedule[index] : null;
  }
  
  if (program.split.includes('Full Body')) {
    // Full Body: Mon/Wed/Fri
    const schedule = [null, 0, null, 1, null, 2, null];
    const index = schedule[dayOfWeek];
    return index !== null ? program.weeklySchedule[index] : null;
  }
  
  if (program.split.includes('Bro Split')) {
    // Bro Split: Mon-Fri
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    return program.weeklySchedule[dayOfWeek - 1];
  }
  
  return null;
}
