// splits.ts — Training split templates for the FitCoach program engine

import { UserProfile } from './types';

export interface DayTemplate {
  name: string;
  muscleGroups: string[]; // Must match exact video-library.json muscleGroup values
  isRest: boolean;
}

export interface SplitTemplate {
  splitType: 'PPL' | 'UpperLower' | 'FullBody' | 'Hybrid';
  splitName: string;
  scienceContext: string; // Why this split works (for dashboard card)
  deloadWeek: number; // 1-based week index for first deload (e.g. 5 = deload at week 5)
  deloadInterval: number; // How often to deload after the first (e.g. 5 = every 5th week)
  days: DayTemplate[]; // Always 7 entries: index 0=Mon through 6=Sun
}

/**
 * Returns the optimal SplitTemplate for the given UserProfile.
 * Selection matrix:
 *  daysPerWeek=6           → PPL × 2 (any goal)
 *  daysPerWeek=5, strength → Upper Power / Lower Power / Upper Hyp / Lower Hyp / Full
 *  daysPerWeek=5, other    → Upper / Lower / Push / Pull / Legs (ULPPL hybrid)
 *  daysPerWeek=7, hyp/ath  → PPL + Upper + Lower + Weak Point + Active Recovery
 *  daysPerWeek=7, str/met  → Full Body × 3 + Upper × 2 + Lower × 2
 */
export function getSplitForProfile(profile: UserProfile): SplitTemplate {
  const { daysPerWeek, physiqueGoal } = profile;

  if (daysPerWeek === 6) {
    return getPPLSplit();
  } else if (daysPerWeek === 5) {
    if (physiqueGoal === 'strength') {
      return getStrength5DaySplit();
    }
    return getULPPLSplit();
  } else {
    // 7 days
    if (physiqueGoal === 'strength' || physiqueGoal === 'metabolic') {
      return get7DayStrengthSplit();
    }
    return get7DayHypertrophySplit();
  }
}

// ─── 6-Day PPL ────────────────────────────────────────────────────────────────

function getPPLSplit(): SplitTemplate {
  return {
    splitType: 'PPL',
    splitName: 'Push / Pull / Legs × 2',
    scienceContext:
      'Push/Pull/Legs is the gold standard for intermediate-to-advanced hypertrophy. Training each muscle group twice per week produces significantly greater muscle growth than once-per-week training (Schoenfeld 2016). Push days develop your anterior chain (chest, front delts, triceps); Pull days build the posterior chain (lats, mid-back, biceps); Legs sessions deliver maximum quad, hamstring, and glute volume. Recovery is protected by sequencing — no back-to-back sessions targeting the same muscles.',
    deloadWeek: 5,
    deloadInterval: 5,
    days: [
      {
        name: 'Push — Chest, Shoulders, Triceps',
        muscleGroups: ['chest', 'Shoulders', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Pull — Back, Biceps',
        muscleGroups: ['back', 'biceps'],
        isRest: false,
      },
      {
        name: 'Legs — Quads, Hamstrings, Glutes, Calves',
        muscleGroups: ['Hips', 'calves'],
        isRest: false,
      },
      {
        name: 'Push — Chest, Shoulders, Triceps',
        muscleGroups: ['chest', 'Shoulders', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Pull — Back, Biceps',
        muscleGroups: ['back', 'biceps'],
        isRest: false,
      },
      {
        name: 'Legs — Quads, Hamstrings, Glutes, Calves',
        muscleGroups: ['Hips', 'calves'],
        isRest: false,
      },
      { name: 'Rest & Recovery', muscleGroups: [], isRest: true },
    ],
  };
}

// ─── 5-Day Hypertrophy/Athletic: ULPPL ───────────────────────────────────────

function getULPPLSplit(): SplitTemplate {
  return {
    splitType: 'Hybrid',
    splitName: 'Upper / Lower / Push / Pull / Legs',
    scienceContext:
      'The ULPPL hybrid gives upper body muscles ~1.5× weekly frequency — upper body muscles receive direct stimulus on both the Upper day and the dedicated Push or Pull day. Lower body gets one comprehensive session. This is ideal for 5-day trainees who want balanced development: more push/pull volume than a pure Upper-Lower, without the recovery demand of full 6-day PPL.',
    deloadWeek: 6,
    deloadInterval: 6,
    days: [
      {
        name: 'Upper Body — Horizontal Emphasis',
        muscleGroups: ['chest', 'back', 'biceps', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Lower Body — Squat Focus',
        muscleGroups: ['Hips', 'calves'],
        isRest: false,
      },
      {
        name: 'Push — Chest, Shoulders, Triceps',
        muscleGroups: ['chest', 'Shoulders', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Pull — Back, Biceps',
        muscleGroups: ['back', 'biceps'],
        isRest: false,
      },
      {
        name: 'Legs — Hinge Focus',
        muscleGroups: ['Hips', 'calves', 'abs'],
        isRest: false,
      },
      { name: 'Rest & Recovery', muscleGroups: [], isRest: true },
      { name: 'Rest & Recovery', muscleGroups: [], isRest: true },
    ],
  };
}

// ─── 5-Day Strength: Conjugate-Inspired ──────────────────────────────────────

function getStrength5DaySplit(): SplitTemplate {
  return {
    splitType: 'Hybrid',
    splitName: 'Conjugate Strength — Upper Power / Lower Power / Upper Hyp / Lower Hyp / Full',
    scienceContext:
      'This conjugate-inspired 5-day structure alternates heavy power days (3–6 reps, RPE 9–10) with higher-rep hypertrophy days (6–10 reps) for both upper and lower body, with a full-body session to address weak points. Based on Westside Barbell methodology adapted for strength athletes who train without coach supervision. Heavy days build the central nervous system adaptations that drive strength; the hypertrophy days add muscle mass to support further strength gains.',
    deloadWeek: 6,
    deloadInterval: 6,
    days: [
      {
        name: 'Upper Power — Heavy Press & Pull',
        muscleGroups: ['chest', 'back', 'Shoulders'],
        isRest: false,
      },
      {
        name: 'Lower Power — Heavy Squat & Hinge',
        muscleGroups: ['Hips', 'calves'],
        isRest: false,
      },
      { name: 'Rest', muscleGroups: [], isRest: true },
      {
        name: 'Upper Hypertrophy — Volume Press & Pull',
        muscleGroups: ['chest', 'back', 'biceps', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Lower Hypertrophy — Volume Legs',
        muscleGroups: ['Hips', 'calves', 'abs'],
        isRest: false,
      },
      {
        name: 'Full Body — Weak Points',
        muscleGroups: ['chest', 'back', 'Hips', 'Shoulders'],
        isRest: false,
      },
      { name: 'Rest & Recovery', muscleGroups: [], isRest: true },
    ],
  };
}

// ─── 7-Day Hypertrophy/Athletic ───────────────────────────────────────────────

function get7DayHypertrophySplit(): SplitTemplate {
  return {
    splitType: 'PPL',
    splitName: 'PPL × 2 + Upper Specialization + Active Recovery',
    scienceContext:
      'An advanced 7-day program for experienced athletes who have built a strong recovery base. Full PPL is run twice, with an additional Upper Specialization day to address lagging muscle groups and an Active Recovery day. At this frequency, weekly volume approaches MRV (Maximum Recoverable Volume) per Israetel\'s research. Only appropriate for advanced trainees with 3+ years of structured programming who sleep 7–9 hours and eat in a caloric surplus.',
    deloadWeek: 5,
    deloadInterval: 5,
    days: [
      {
        name: 'Push — Chest, Shoulders, Triceps',
        muscleGroups: ['chest', 'Shoulders', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Pull — Back, Biceps',
        muscleGroups: ['back', 'biceps'],
        isRest: false,
      },
      {
        name: 'Legs — Quads, Hamstrings, Glutes',
        muscleGroups: ['Hips', 'calves'],
        isRest: false,
      },
      {
        name: 'Upper Specialization — Arms & Shoulders',
        muscleGroups: ['Shoulders', 'biceps', 'Triceps', 'Forearms'],
        isRest: false,
      },
      {
        name: 'Push — Chest, Shoulders, Triceps',
        muscleGroups: ['chest', 'Shoulders', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Pull — Back, Biceps',
        muscleGroups: ['back', 'biceps'],
        isRest: false,
      },
      {
        name: 'Legs — Active Recovery',
        muscleGroups: ['Hips', 'calves', 'abs'],
        isRest: false,
      },
    ],
  };
}

// ─── 7-Day Strength/Metabolic ─────────────────────────────────────────────────

function get7DayStrengthSplit(): SplitTemplate {
  return {
    splitType: 'FullBody',
    splitName: 'Full Body × 3 + Upper × 2 + Lower × 2',
    scienceContext:
      'High-frequency programming inspired by Norwegian and Bulgarian methods. Full body sessions train every primary movement pattern 3× per week, driving rapid neural adaptation and skill acquisition. Upper and lower sessions provide additional volume for hypertrophy to support strength gains. Research by Colquhoun (2018) showed full-body 3× programming produced equivalent muscle growth to body-part splits with less total volume — efficiency without sacrifice.',
    deloadWeek: 5,
    deloadInterval: 5,
    days: [
      {
        name: 'Full Body A — Squat + Press',
        muscleGroups: ['Hips', 'chest', 'back', 'Shoulders'],
        isRest: false,
      },
      {
        name: 'Upper Body A — Horizontal Push/Pull',
        muscleGroups: ['chest', 'back', 'biceps', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Lower Body A — Quad Dominant',
        muscleGroups: ['Hips', 'calves', 'abs'],
        isRest: false,
      },
      {
        name: 'Full Body B — Hinge + Pull',
        muscleGroups: ['Hips', 'back', 'Shoulders', 'chest'],
        isRest: false,
      },
      {
        name: 'Upper Body B — Vertical Push/Pull',
        muscleGroups: ['Shoulders', 'back', 'biceps', 'Triceps'],
        isRest: false,
      },
      {
        name: 'Lower Body B — Hip Dominant',
        muscleGroups: ['Hips', 'calves', 'abs'],
        isRest: false,
      },
      {
        name: 'Full Body C — Weak Points',
        muscleGroups: ['Hips', 'chest', 'back'],
        isRest: false,
      },
    ],
  };
}
