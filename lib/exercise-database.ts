// exercise-database.ts — Exercise selection, video mapping, and science notes

import type { Exercise, VideoLibraryEntry, UserProfile } from './types';

// ─── Science Notes (25+ exercises) ───────────────────────────────────────────

export const SCIENCE_NOTES: Record<string, string> = {
  'Barbell Bench Press': `The flat barbell press maximizes pectoral recruitment through full shoulder horizontal adduction. Schoenfeld (2010) confirms compound pressing as the primary driver of chest hypertrophy. Lower the bar to your mid-chest with elbows at ~60° to the torso — this minimizes anterior delt stress and maximizes pec activation.`,

  'Barbell Incline Bench Press': `Inclining at 30–45° shifts the load to the clavicular head of the pectoralis major. EMG research shows ~30% greater upper chest activation at incline vs. flat. Control the descent for 2–3 seconds — the stretched position under load is where hypertrophic stimulus is highest.`,

  'Dumbbell Bench Press': `Dumbbell pressing allows scapular protraction and a greater stretch at the bottom vs. barbell. The independent arm movement eliminates bilateral deficit, producing higher pec activation. At the top, bring the dumbbells slightly together to maximize peak contraction.`,

  'Dumbbell Incline Bench Press': `The 30–45° incline dumbbell press is the gold standard for upper chest development. Dumbbells allow a full stretch at the bottom and full adduction at the top — the two key conditions for maximal hypertrophic stimulus. Don't overly flare the elbows; a slight inward angle protects the shoulder.`,

  'Dumbbell Fly': `The fly isolates the pectoralis major through pure horizontal adduction, eliminating elbow extension contribution from the triceps. A full stretch at the bottom (arms nearly parallel to the floor) is key for stretch-mediated hypertrophy. Maintain a slight elbow bend throughout to protect the joint capsule.`,

  'Dumbbell Incline Fly': `Incline dumbbell flyes target the upper and outer chest through a long arc of shoulder horizontal adduction. Research by Solstad (2020) confirms that loaded stretches in the lengthened position produce superior hypertrophy vs. peak-contracted exercises. Pause briefly at the stretched position.`,

  'Classic Barbell Squat': `The barbell back squat is the king of lower body development, simultaneously loading the quads, glutes, and hamstrings at high intensities. Descending below parallel maximizes glute and hamstring stretch-mediated activation. Drive knees outward in line with toes to protect the knee joint and maximize hip involvement.`,

  'Dumbbell Goblet Squat': `The goblet squat uses anterior loading to improve torso uprightness and ankle mobility — key for quad-dominant development. The counterbalance naturally teaches proper squat mechanics without coaching. Push knees out on ascent and drive the hips forward through the top for full glute contraction.`,

  'Dumbbell Lunge': `Lunges provide a large hip flexor stretch and single-leg loading, increasing glute and quad activation per rep vs. bilateral squats. Research shows unilateral training corrects strength asymmetries between limbs. Step long enough to get the rear knee close to the floor for maximum hip flexor stretch.`,

  'Barbell Lunge': `The barbell lunge loads the single-leg squat pattern at high intensities, driving superior quad and glute hypertrophy. The longer step ensures the hip flexors are stretched under load — a powerful stretch-mediated stimulus. Maintain an upright torso to emphasize quads over the lower back.`,

  'Barbell Bent-over Row Overgrip': `The overhand bent-over row strongly recruits the lower trapezius and posterior deltoid alongside the lats and mid-back. Schoenfeld (2020) ranks bent-over rows among the top mass builders for the back. Hinge to ~45–60°, brace the core, and pull to the lower sternum — not the belly button.`,

  'Barbell Underhand Bent-over Row': `Underhand (supinated) rows shift emphasis to the lower lats and biceps vs. overhand rowing. The supinated grip allows greater shoulder extension at lockout, ensuring full lat contraction. Keep the torso rigid — even small amounts of momentum significantly reduce lat tension.`,

  'Dumbbell Bent-over Row': `Single-arm dumbbell rows allow a greater range of motion than barbell rows and eliminate bilateral deficit. Supporting yourself on a bench removes spinal loading, enabling heavier loads and more productive sets. Pull the elbow past the hip at the top for full lat shortening.`,

  'Band Bent-over Row': `Band rows provide accommodating resistance — tension increases as you reach peak contraction, matching the strength curve of the back muscles. This makes them superior to free weights at the contracted position. Pull the band to your lower chest and hold the peak for 1 second.`,

  'Chin-ups  Pull-Ups': `Chin-ups (supinated grip) maximize biceps involvement while also fully activating the lats. Research by Youdas (2010) shows chin-ups produce greater bicep EMG than dedicated curl exercises. Hang from full extension each rep to maximize lat stretch before pulling elbows toward the hips.`,

  'Pull-up (wide back grip)': `Wide-grip pull-ups maximize lat activation through full shoulder adduction and extension. EMG data shows wider grips produce ~20% greater lat activation than shoulder-width grips. Lower slowly (3 seconds) for superior eccentric-mediated growth in the lats.`,

  'Pull-up (shoulder grip)': `Shoulder-width pull-ups offer a strong balance of lat and bicep recruitment with less shoulder joint strain than wide grip. Dead-hang from the bottom each rep, then drive elbows toward the hips. Use a 2-second descent to maximize time under tension.`,

  'Dumbbell Alternate Biceps Curl': `Alternating dumbbell curls allow full forearm supination on each rep, maximizing biceps brachii activation vs. fixed-grip barbells. Research by Suprak (2007) shows supination increases bicep EMG by ~20%. Slight forward lean at the bottom creates a stretch-mediated stimulus for the long head.`,

  'Barbell Curl': `The barbell curl allows maximal loading of the biceps, stimulating high-threshold motor units that produce the greatest hypertrophic response. Pin elbows at your sides and avoid momentum. A slight forward drift of the elbows at the top allows a few extra degrees of elbow flexion for a superior peak contraction.`,

  'Dumbbell Biceps Curl': `Dumbbells allow full supination through the curl, maximizing biceps brachii activation compared to a fixed barbell grip. Perform with a slight forward lean at the bottom to increase stretch-mediated hypertrophy of the long head. Resist the urge to swing — strict form recruits more bicep fibers.`,

  'Dumbbell Incline Curl': `The incline curl puts the biceps in a fully stretched position at the bottom, preferentially stimulating stretch-mediated hypertrophy in the long head. Research by Pedrosa (2022) shows exercises performed in the lengthened position produce superior hypertrophy. Keep elbows behind the body throughout.`,

  'Military Press': `The strict overhead press trains all three deltoid heads simultaneously along with the upper trapezius and triceps. Pressing ability directly correlates with shoulder muscle cross-sectional area. Lock out fully overhead — the bar should pass the ears with a neutral spine. Avoid excessive lumbar extension.`,

  'Dumbbell Bench Seated Press': `Seated dumbbell shoulder pressing allows independent arm movement and greater range of motion vs. barbell overhead press. Lower the dumbbells to ear level for maximum anterior delt stretch. The seated position reduces lower back involvement, placing all stress on the deltoids.`,

  'Dumbbell Lateral Raise': `Lateral raises are the premier isolation exercise for the medial (middle) deltoid — the primary driver of shoulder width. Research shows peak medial delt activation occurs between 60–90° of abduction. Use a slight forward torso lean (10–15°) and lead with the elbows for peak activation and injury-safe loading.`,

  'Dumbbell Rear Lateral Raise': `The bent-over lateral raise is the most effective exercise for the posterior deltoid. Posterior delt development is critical for shoulder health, posture, and creating the 3D delt appearance. Hinge forward to 45–75°, keep elbows slightly bent, and raise to ear level.`,

  'Dumbbell Arnold Press': `The Arnold press combines shoulder rotation with pressing, creating a longer time under tension and more complete deltoid activation than a straight press. The rotation at the bottom recruits the front delt through a lengthened position. Coined by Arnold Schwarzenegger as a correction for his weak front delts.`,

  'Barbell Close Grip Bench Press': `The close-grip bench press is the most effective mass builder for the triceps, loading all three heads through a heavy compound movement. EMG shows it produces ~30% greater tricep activation than overhead pressing. Use a grip slightly narrower than shoulder width — excessive narrowness increases wrist stress.`,

  'Bench Dips': `Bench dips emphasize the triceps with an upright torso, making them an accessible compound movement with no equipment required. Lower until elbows reach 90°, then press up powerfully. The stretch at the bottom is critical for stimulating the long head of the triceps through its lengthened range.`,

  'Dumbbell Seated Triceps Extension': `The overhead triceps extension places the long head in a fully stretched position — critical for maximally stimulating this largest head. Research confirms overhead tricep exercises produce ~15% greater long head activation than pushdowns. Keep elbows close to the head and avoid flaring to protect the shoulder joint.`,

  'Dumbbell Lying Triceps Extension': `Lying skull crushers place the triceps in a deep stretch at the bottom and achieve full extension at the top. This full range of motion has been shown to produce superior hypertrophy compared to partial-range movements. Lower slowly for a 2-second eccentric to maximize time under tension.`,

  'Band Triceps Pushdown': `Band pushdowns maintain constant tension throughout the full range of motion, unlike free weights where tension drops at the contracted position. This constant tension increases time under tension (TUT) — a key driver of hypertrophy. Stand slightly away from the anchor to maintain tension at the top of each rep.`,

  'Dumbbell Seated Calf Raise': `The seated calf raise targets the soleus, the deeper calf muscle that contributes significantly to calf circumference. The bent knee position disengages the gastrocnemius, isolating the soleus. Use a full range — deep stretch at the bottom for 1 second, fully plantar-flexed at the top.`,

  'Dumbbell Standing Calf Raise': `Standing calf raises target the gastrocnemius, the superficial calf muscle visible from behind. The gastrocnemius is maximally activated with the knee straight. Use a 3-second descent and pause at full stretch to overcome the stretch reflex and force the calves to contract concentrically from a stretched position.`,

  '45 Degree Hyperextension': `The 45° hyperextension is a foundational posterior chain exercise training the erector spinae, glutes, and hamstrings through hip extension. It complements deadlifts and squats by directly targeting the lower back extensor muscles. Add a slight posterior pelvic tilt at the top for maximal glute involvement.`,

  'Sit-ups': `Sit-ups train the rectus abdominis through spinal flexion with a large range of motion. The hip flexors assist in the upper portion — this is actually beneficial for core integration. Keep hands behind the head loosely; avoid pulling on the neck. 3 seconds down is more effective than speed.`,

  'Hanging Straight Leg Raise': `Hanging leg raises train the rectus abdominis and hip flexors with the abs in a lengthened position, producing high mechanical tension. Research shows lower ab activation is greatest when the pelvis posteriorly tilts during the movement. Avoid swinging — control the descent for maximum tension.`,

  // ── Cable exercises (Kahuna + Full Gym) ──────────────────────────────────
  'Cable Lateral Raise': `Cable lateral raises maintain constant tension throughout the full range of motion unlike dumbbells which drop off near the body. EMG research confirms the medial deltoid is maximally activated between 60–90° of abduction. Lead with the elbow, not the wrist, and allow a 2-second descent for maximum time under tension.`,

  'Cable One Arm Lateral Raise': `Single-arm cable lateral raises allow greater stretch at the bottom position and eliminate the momentum common in bilateral dumbbell raises. The constant cable tension produces superior medial delt activation compared to dumbbell variations. Keep a slight forward lean for optimal angle of pull.`,

  'Cable Rear Delt Row (with rope)': `The cable face pull is the premier posterior deltoid and upper trap exercise for shoulder health and 3D delt development. Research by Cools (2007) confirms it as the highest-activation exercise for lower trapezius and external rotators. Pull the rope to forehead height, flaring elbows wide and externally rotating at peak contraction.`,

  'Cable Crossover Reverse Fly': `Cable crossover reverse flyes target the posterior deltoid and rhomboids through a horizontal abduction arc with constant cable tension. The constant load throughout the movement's full range produces superior hypertrophic stimulus compared to dumbbell reverse flies, especially at the stretched position.`,

  'Cable Seated Row (normal grip)': `Cable rows place the lats and mid-back under constant tension throughout the full range of motion. Leaning slightly forward at full stretch and then driving elbows past the hips maximizes the lat's range of motion. A 2-second pause at peak contraction ensures full mid-back activation.`,

  'Cable Seated Row (parallel grip)': `The neutral-grip seated cable row emphasizes the lower lats and teres major through a more natural shoulder position. Research shows the neutral grip produces slightly higher lat activation than overhand gripping. Drive elbows close to the body and squeeze the lats hard at peak contraction.`,

  'Cable Straight Arm Pulldown': `The straight-arm pulldown isolates the lats by eliminating bicep contribution — the elbow remains fixed in a slightly bent position throughout. This exercise directly trains shoulder extension, the lat's primary function. Peak contraction occurs when the arms are at hip level; hold for 1 second for full lat activation.`,

  'Cable Close Grip Front Lat Pulldown': `Close-grip lat pulldowns maximize lat recruitment through full shoulder adduction from overhead to hip level. The narrower grip allows greater elbow travel past the hip, ensuring the lats reach full shortening. Lean slightly back (~15°) and pull to the upper chest, not behind the neck.`,

  'Cable Bar Lateral Pulldown (wide shoulder grip)': `Wide-grip lat pulldowns produce ~20% greater lat activation than shoulder-width grip due to increased shoulder adduction range. Lower the bar to your upper chest with a controlled 2-second descent. Avoid excessive lean-back — the movement should be driven by the lats, not momentum.`,

  'Cable Triceps Pushdown': `The cable pushdown maintains constant triceps tension throughout the full range, unlike free weights that have varying resistance. All three heads of the triceps are activated, with the lateral head most strongly recruited during elbow extension. Lock elbows at the sides — avoid flaring to keep tension on the triceps.`,

  'Cable Overhead Triceps Extension (rope attachment)': `Overhead cable extensions place the triceps long head in a fully stretched position — research by Stasinaki (2018) confirms overhead orientation produces superior long head hypertrophy vs. pushdowns. Keep elbows close to the head. The cable provides more consistent tension than dumbbells in this position.`,

  'Cable Lying Triceps Extension': `Cable lying extensions maintain tension in the triceps' stretched position that free-weight skull crushers cannot replicate. The constant cable tension is ideal for maximizing time under tension in the long head of the triceps. Lower the handle behind the head slowly for a 3-second eccentric.`,

  'Cable One Arm Curl': `Single-arm cable curls allow full supination through the curl with constant tension — this combination is biomechanically superior to barbell curls for bicep peak development. The cable maintains load at the top of the movement where a barbell loses tension. Supinate fully at peak contraction.`,

  'Cable Standing Inner Curl': `The inner (cross-body) cable curl creates a unique line of pull that maximally recruits the short head of the biceps brachii and brachialis. Keeping the elbow slightly forward in the bottom position produces stretch-mediated hypertrophy in the short head. Excellent for building bicep thickness and width.`,

  'Cable Kneeling Crunch': `Cable crunches are the most effective weighted ab exercise, allowing progressive overload directly on the rectus abdominis. Research shows weighted ab exercises produce significantly greater hypertrophy than unweighted variations. Round the spine fully into flexion — the movement must come from the abs, not hip flexion.`,

  'Cable Standing Crunch': `Standing cable crunches train the abs against gravity and the cable in a functional standing position. Full spinal flexion from the extended position to full crunch ensures the abs work through their complete range. Pause at the bottom (fully crunched) for 1 second to prevent momentum.`,

  // ── Smith Machine exercises (Kahuna) ──────────────────────────────────────
  'Smith Chair Squat': `The Smith machine squat allows forward foot placement that would be unstable with a free barbell, shifting emphasis to the quads. Research by Cotterman (2005) shows Smith squats produce 43% greater quad activation than free barbell squats. The fixed bar path allows you to safely push to higher RPE without a spotter.`,

  'Smith Seated Shoulder Press': `Smith machine shoulder press allows strict, vertical pressing mechanics without the stabilizer demand of dumbbells — this means more overload on the deltoids themselves. The fixed bar path eliminates lateral deviation, keeping maximum tension on the anterior and medial deltoids throughout. An excellent mass-builder for shoulder size.`,

  'Smith Deadlift - Deadlift': `Smith machine deadlifts allow a more upright torso than conventional deadlifts, shifting emphasis from the lower back to the quadriceps and glutes. The fixed vertical path eliminates the bar path management required in conventional deadlifts, allowing focus on pure hip extension power. Ideal for hypertrophy-focused posterior chain work.`,

  'Smith Calf Raise': `Smith machine calf raises allow maximum loading with complete safety, enabling single-leg variations that would be difficult with a free barbell. The constant load enables a full stretch at the bottom and peak contraction at the top. Perform slowly (3 seconds up, 3 seconds down) to overcome the gastrocnemius's high proportion of fast-twitch fibers.`,
};

// ─── Equipment Filtering ──────────────────────────────────────────────────────

const MACHINE_PREFIXES = ['Lever ', 'Sled ', 'Smith ', 'Cable '];
const EQUIPMENT_PREFIXES = ['Barbell ', 'Dumbbell ', 'EZ ', 'Weighted ', 'Kettlebell '];

/**
 * Returns true if an exercise from the video library is allowed given the user's equipment.
 */
export function isAllowedByEquipment(exerciseName: string, equipment: string, hasKahuna?: boolean): boolean {
  if (equipment === 'full-gym') return true;

  // Home gym with Kahuna: smith bar + 3 cable systems + pec fly unlocks Cable/Smith exercises.
  // Only Lever and Sled (plate-loaded machines) remain excluded.
  if (equipment === 'home-gym' && hasKahuna) {
    const kahunaExcludes = ['Lever ', 'Sled '];
    if (kahunaExcludes.some((p) => exerciseName.startsWith(p))) return false;
    return true;
  }

  // Exclude machine-only exercises for standard home-gym and bodyweight
  if (MACHINE_PREFIXES.some((p) => exerciseName.startsWith(p))) {
    return false;
  }

  if (equipment === 'home-gym') {
    // Allow Barbell, Dumbbell, EZ, Band, bodyweight
    return true;
  }

  // bodyweight: only Band exercises + exercises with no free-weight/equipment prefix
  if (equipment === 'bodyweight') {
    if (exerciseName.startsWith('Band ')) return true;
    // Reject any exercise that requires free weights
    const requiresWeights =
      EQUIPMENT_PREFIXES.some((p) => exerciseName.startsWith(p)) ||
      exerciseName.toLowerCase().includes('barbell') ||
      exerciseName.toLowerCase().includes('dumbbell') ||
      exerciseName.toLowerCase().includes('kettlebell');
    return !requiresWeights;
  }

  return true;
}

// ─── Compound vs Isolation Detection ─────────────────────────────────────────

/**
 * Heuristic: determines if an exercise is a compound (multi-joint) movement.
 * Compounds are prioritized first in exercise selection.
 */
export function isCompoundExercise(exerciseName: string): boolean {
  const name = exerciseName.toLowerCase();
  // Compound patterns
  if (name.includes('press')) return true;
  if (name.includes('squat')) return true;
  if (name.includes('deadlift')) return true;
  if (name.includes('row')) return true;
  if (name.includes('pull-up')) return true;
  if (name.includes('pulldown')) return true;
  if (name.includes('chin-up')) return true;
  if (name.includes('lunge')) return true;
  if (name.includes('dip')) return true;
  if (name.includes('clean')) return true;
  if (name.includes('snatch')) return true;
  if (name.includes('hyperextension')) return true;
  if (name.includes('push-up') || name.includes('push up')) return true;
  if (name.includes('push-ups') || name.includes('push ups')) return true;
  if (name.includes('pull up')) return true;
  if (name.includes('chin up')) return true;
  if (name.includes('pull through')) return true;
  // Named full-body movements
  if (name === 'squat') return true;
  return false;
}

// ─── Volume Prescription ──────────────────────────────────────────────────────

interface VolumeParams {
  sets: number;
  repRange: string;
  restSeconds: number;
  rpe: number;
}

interface VolumeConfig {
  compound: VolumeParams;
  isolation: VolumeParams;
}

export function getVolumeConfig(
  goal: UserProfile['physiqueGoal'],
  weekNumber: number, // 1-based
  isDeload: boolean
): VolumeConfig {
  // Week-based set progression (accumulation)
  const weekPhase = ((weekNumber - 1) % 4) + 1; // cycles 1-4
  const baseSets = weekPhase <= 2 ? 3 : 4;

  if (isDeload) {
    // Deload: reduce sets by ~45%, keep same reps, drop RPE
    const deloadSets = Math.max(2, Math.round(baseSets * 0.55));
    return {
      compound: { sets: deloadSets, repRange: getRepRange(goal, true), restSeconds: 60, rpe: 5 },
      isolation: { sets: deloadSets, repRange: getRepRange(goal, false), restSeconds: 45, rpe: 5 },
    };
  }

  switch (goal) {
    case 'hypertrophy':
      return {
        compound: { sets: baseSets, repRange: '8-12', restSeconds: 90, rpe: 8 },
        isolation: { sets: baseSets, repRange: '10-15', restSeconds: 75, rpe: 8 },
      };
    case 'strength':
      return {
        compound: {
          sets: Math.min(baseSets + 1, 5),
          repRange: '3-6',
          restSeconds: 150,
          rpe: 9,
        },
        isolation: {
          sets: baseSets,
          repRange: '6-10',
          restSeconds: 90,
          rpe: 8,
        },
      };
    case 'metabolic':
      return {
        compound: { sets: 3, repRange: '12-20', restSeconds: 45, rpe: 8 },
        isolation: { sets: 3, repRange: '15-20', restSeconds: 30, rpe: 8 },
      };
    case 'athletic':
      return {
        compound: { sets: baseSets, repRange: '6-10', restSeconds: 105, rpe: 8 },
        isolation: { sets: baseSets, repRange: '12-15', restSeconds: 75, rpe: 8 },
      };
    default:
      return {
        compound: { sets: baseSets, repRange: '8-12', restSeconds: 90, rpe: 8 },
        isolation: { sets: baseSets, repRange: '10-15', restSeconds: 75, rpe: 8 },
      };
  }
}

function getRepRange(goal: UserProfile['physiqueGoal'], isCompound: boolean): string {
  switch (goal) {
    case 'strength':
      return isCompound ? '3-5' : '6-8';
    case 'metabolic':
      return '12-15';
    case 'athletic':
      return isCompound ? '5-8' : '10-12';
    default:
      return isCompound ? '8-10' : '10-12';
  }
}


// ─── Video Matching ───────────────────────────────────────────────────────────

/**
 * Finds the best matching video path for an exercise name + muscle group.
 * Priority: exact match → partial match → fallback to any exercise in the muscle group.
 */
export function matchVideoToExercise(
  exerciseName: string,
  muscleGroup: string,
  videoLibrary: VideoLibraryEntry[]
): string {
  // 1. Exact match (case-insensitive)
  const exact = videoLibrary.find(
    (v) =>
      v.muscleGroup === muscleGroup &&
      v.exerciseName.toLowerCase() === exerciseName.toLowerCase() &&
      !v.isWarmup
  );
  if (exact) return exact.relativePath;

  // 2. Fuzzy: entry name contains the exercise name (or vice versa)
  const nameLower = exerciseName.toLowerCase();
  const fuzzy = videoLibrary.find(
    (v) =>
      v.muscleGroup === muscleGroup &&
      !v.isWarmup &&
      (v.exerciseName.toLowerCase().includes(nameLower) ||
        nameLower.includes(v.exerciseName.toLowerCase()))
  );
  if (fuzzy) return fuzzy.relativePath;

  // 3. Key-word match: split exercise name into words and find best word overlap
  const nameWords = nameLower.split(/\s+/).filter((w) => w.length > 3);
  let bestMatch: VideoLibraryEntry | null = null;
  let bestScore = 0;

  for (const v of videoLibrary) {
    if (v.muscleGroup !== muscleGroup || v.isWarmup) continue;
    const vNameLower = v.exerciseName.toLowerCase();
    const score = nameWords.filter((w) => vNameLower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = v;
    }
  }
  if (bestMatch) return bestMatch.relativePath;

  // 4. Fallback: any non-warmup exercise in the same muscle group
  const fallback = videoLibrary.find((v) => v.muscleGroup === muscleGroup && !v.isWarmup);
  if (fallback) return fallback.relativePath;

  // 5. Last resort: first entry in library
  return videoLibrary[0]?.relativePath ?? 'men/chest/Barbell Bench Press.mp4';
}

// ─── Warmup Selection ─────────────────────────────────────────────────────────

const WARMUP_MUSCLE_MAP: Record<string, string[]> = {
  chest: ['chest', 'Shoulders'],
  Shoulders: ['Shoulders', 'chest'],
  Triceps: ['Triceps', 'Shoulders'],
  back: ['back', 'Shoulders'],
  biceps: ['biceps', 'back'],
  Hips: ['Hips'],
  calves: ['calves', 'Hips'],
  abs: ['abs', 'Hips'],
  Forearms: ['Forearms'],
  Trapezius: ['Trapezius', 'Shoulders'],
};

/**
 * Selects 2-3 warmup exercises from the stretching library for the given muscle groups.
 */
export function selectWarmupForDay(
  muscleGroups: string[],
  videoLibrary: VideoLibraryEntry[],
  weekNumber: number
): Exercise[] {
  // Collect warmup candidates from relevant muscle groups
  const warmupLibraryGroups = new Set<string>();
  for (const mg of muscleGroups) {
    const mapped = WARMUP_MUSCLE_MAP[mg] ?? [mg];
    mapped.forEach((g) => warmupLibraryGroups.add(g));
  }

  const candidates = videoLibrary.filter(
    (v) => v.isWarmup && warmupLibraryGroups.has(v.muscleGroup)
  );

  if (candidates.length === 0) {
    // Fallback to any warmup
    const anyWarmup = videoLibrary.filter((v) => v.isWarmup).slice(0, 2);
    return anyWarmup.map((v, i) => createWarmupExercise(v, i));
  }

  // Select 2-3 exercises, rotating by week
  const count = Math.min(3, candidates.length);
  const offset = (weekNumber - 1) % Math.max(1, candidates.length - count + 1);
  const selected = candidates.slice(offset, offset + count);

  // If we didn't get enough, add more from the start
  while (selected.length < Math.min(2, candidates.length)) {
    const next = candidates[selected.length];
    if (next && !selected.includes(next)) selected.push(next);
  }

  return selected.map((v, i) => createWarmupExercise(v, i));
}

function createWarmupExercise(v: VideoLibraryEntry, index: number): Exercise {
  return {
    id: `warmup-${v.muscleGroup}-${index}-${v.exerciseName.replace(/\s+/g, '-').toLowerCase()}`,
    name: v.exerciseName.replace('Stretching - ', ''),
    muscleGroup: v.muscleGroup,
    videoPath: v.relativePath,
    isWarmup: true,
    sets: 1,
    repRange: '30-45 seconds',
    restSeconds: 15,
    rpe: undefined,
    scienceNote: `Warm-up mobility work. ${v.exerciseName.replace('Stretching - ', '')} prepares the joints and increases blood flow to the target muscles, reducing injury risk and improving force production in the working sets.`,
  };
}

// ─── Exercise Selection Per Day ───────────────────────────────────────────────

/**
 * Per-muscle-group configuration: how many compounds and isolations to select.
 * Depends on how many muscle groups share the day.
 */
function getExerciseCountConfig(
  muscleGroup: string,
  allMuscleGroups: string[]
): { compounds: number; isolations: number } {
  const numGroups = allMuscleGroups.length;

  const isPrimary = ['chest', 'back', 'Hips'].includes(muscleGroup);
  const isSecondary = ['Shoulders', 'biceps', 'Triceps'].includes(muscleGroup);
  const isTertiary = ['calves', 'abs', 'Forearms', 'Trapezius', 'cardio'].includes(muscleGroup);

  if (numGroups === 1) {
    return { compounds: 3, isolations: 3 };
  } else if (numGroups === 2) {
    if (isPrimary) return { compounds: 2, isolations: 2 };
    if (isTertiary) return { compounds: 0, isolations: 2 };
    return { compounds: 2, isolations: 1 };
  } else if (numGroups === 3) {
    if (isPrimary) return { compounds: 2, isolations: 1 };
    if (isSecondary) return { compounds: 1, isolations: 1 };
    return { compounds: 0, isolations: 1 };
  } else {
    // 4-5+ groups (Upper/Full Body)
    if (isPrimary) return { compounds: 1, isolations: 1 };
    if (isSecondary) return { compounds: 1, isolations: 0 };
    if (isTertiary) return { compounds: 0, isolations: 1 };
    return { compounds: 1, isolations: 0 };
  }
}

/**
 * Main exercise selection function.
 * Selects exercises for a workout day given:
 * - muscleGroups: which muscle groups to train
 * - equipment: user's equipment level
 * - videoLibrary: the full video catalog
 * - weekNumber: 1-based, used for variety rotation
 * - dayOffset: for same-named days (e.g. Push day 1 vs Push day 4), adds variety
 * - goal: determines volume params
 * - isDeload: reduces volume
 */
export function selectExercisesForDay(
  muscleGroups: string[],
  equipment: string,
  videoLibrary: VideoLibraryEntry[],
  weekNumber: number,
  goal: UserProfile['physiqueGoal'],
  isDeload: boolean,
  dayOffset: number = 0,
  exerciseId_prefix: string = '',
  hasKahuna?: boolean
): Exercise[] {
  const volumeConfig = getVolumeConfig(goal, weekNumber, isDeload);
  const exercises: Exercise[] = [];

  for (const muscleGroup of muscleGroups) {
    const config = getExerciseCountConfig(muscleGroup, muscleGroups);

    // Get all non-warmup exercises for this muscle group that fit the equipment
    const available = videoLibrary.filter(
      (v) =>
        v.muscleGroup === muscleGroup &&
        !v.isWarmup &&
        isAllowedByEquipment(v.exerciseName, equipment, hasKahuna)
    );

    if (available.length === 0) continue;

    // Separate into compound and isolation
    const compounds = available.filter((v) => isCompoundExercise(v.exerciseName));
    const isolations = available.filter((v) => !isCompoundExercise(v.exerciseName));

    // Rotation offset: weeks 1-4 use one set, weeks 5-8 use a different set
    const phaseOffset = weekNumber > 4 ? Math.ceil(compounds.length / 2) : 0;
    const dayVariety = dayOffset % Math.max(1, compounds.length);

    // Select compounds
    const numCompounds = Math.min(config.compounds, compounds.length);
    const compoundOffset = (phaseOffset + dayVariety) % Math.max(1, compounds.length);
    for (let i = 0; i < numCompounds; i++) {
      const idx = (compoundOffset + i) % compounds.length;
      const v = compounds[idx];
      exercises.push(
        buildExercise(v, volumeConfig.compound, exerciseId_prefix, weekNumber, 'compound', i)
      );
    }

    // Select isolations
    const numIsolations = Math.min(config.isolations, isolations.length);
    const isoOffset = (phaseOffset + dayVariety + 1) % Math.max(1, isolations.length);
    for (let i = 0; i < numIsolations; i++) {
      const idx = (isoOffset + i) % isolations.length;
      const v = isolations[idx];
      exercises.push(
        buildExercise(v, volumeConfig.isolation, exerciseId_prefix, weekNumber, 'iso', i)
      );
    }
  }

  return exercises;
}

function buildExercise(
  v: VideoLibraryEntry,
  params: VolumeParams,
  prefix: string,
  weekNumber: number,
  kind: string,
  index: number
): Exercise {
  const id = `${prefix}-w${weekNumber}-${v.muscleGroup}-${kind}${index}-${v.exerciseName
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()}`;
  return {
    id,
    name: v.exerciseName,
    muscleGroup: v.muscleGroup,
    videoPath: v.relativePath,
    isWarmup: false,
    sets: params.sets,
    repRange: params.repRange,
    restSeconds: params.restSeconds,
    rpe: params.rpe,
    scienceNote: getScienceNote(v.exerciseName, v.muscleGroup),
  };
}

// ─── Science Note Lookup ──────────────────────────────────────────────────────

export function getScienceNote(exerciseName: string, muscleGroup: string): string {
  if (SCIENCE_NOTES[exerciseName]) return SCIENCE_NOTES[exerciseName];

  const lower = exerciseName.toLowerCase();

  // Pattern-based fallbacks
  if (lower.includes('curl') && ['biceps', 'Forearms'].includes(muscleGroup)) {
    return `The ${exerciseName} targets the biceps brachii through elbow flexion. Full supination at the top maximizes bicep activation. Research by Suprak (2007) shows supination increases bicep EMG by ~20% vs. a neutral or pronated grip. Avoid swinging — strict form engages more motor units.`;
  }
  if (lower.includes('press') && muscleGroup === 'chest') {
    return `The ${exerciseName} is a compound pressing movement that develops the pectoralis major through horizontal shoulder adduction. Touch the chest at the bottom and fully extend at the top for complete muscle stimulation. Progressive overload on this movement is the primary driver of chest hypertrophy.`;
  }
  if (lower.includes('press') && muscleGroup === 'Shoulders') {
    return `The ${exerciseName} develops all three deltoid heads through overhead pressing. Fully lock out overhead — research shows the deltoids are under maximum tension in the 60–90° range of shoulder abduction. Avoid excessive lumbar extension by bracing the core throughout.`;
  }
  if (lower.includes('squat') || lower.includes('lunge')) {
    return `The ${exerciseName} trains the lower body through knee flexion and hip extension, loading the quads, glutes, and hamstrings. Descend to at least parallel for full glute recruitment. Control the eccentric over 2–3 seconds for maximum hypertrophic stimulus through stretch-mediated growth.`;
  }
  if (lower.includes('row') || lower.includes('pulldown') || lower.includes('pull-up')) {
    return `The ${exerciseName} develops the back through shoulder extension and adduction. At peak contraction, hold briefly and squeeze the shoulder blades — this maximally activates the mid-back stabilizers. Lead with the elbows rather than the hands to shift the load onto the lats.`;
  }
  if (lower.includes('deadlift') || lower.includes('hyperextension')) {
    return `The ${exerciseName} trains the posterior chain through hip extension. Research by Contreras shows hip extension exercises are the highest-activation movements for the glutes and hamstrings. Maintain a neutral spine throughout and drive hips forward powerfully at the top.`;
  }
  if (lower.includes('extension') && muscleGroup === 'Triceps') {
    return `The ${exerciseName} isolates the triceps in a lengthened position, which is critical for stimulating the long head — the largest of the three tricep heads. Research confirms overhead tricep exercises produce superior long head activation vs. pushdown variations. Keep elbows close to the head.`;
  }
  if (lower.includes('fly') || lower.includes('flye')) {
    return `The ${exerciseName} isolates the pectoralis major through pure horizontal adduction, without tricep contribution. The key to maximizing hypertrophy is achieving a full stretch at the bottom while maintaining a slight elbow bend. Research by Solstad (2020) shows loaded stretches produce the greatest long-term muscle growth.`;
  }
  if (lower.includes('raise') && muscleGroup === 'Shoulders') {
    return `The ${exerciseName} isolates the target deltoid head through arm elevation. For maximum activation, lead with the elbow rather than the hand and avoid using momentum. Control the descent — the eccentric phase under tension is where most hypertrophic signaling occurs.`;
  }
  if (muscleGroup === 'calves') {
    return `The ${exerciseName} trains the calf complex through plantar flexion. Use a full range of motion — a deep stretch at the bottom and a full peak contraction at the top. Research shows high-rep training (15–25 reps) with slow eccentrics produces superior calf hypertrophy due to their high slow-twitch fiber composition.`;
  }
  if (muscleGroup === 'abs') {
    return `The ${exerciseName} trains the core musculature through spinal flexion or stabilization. Posterior pelvic tilt (flattening the lower back) maximizes rectus abdominis activation throughout the range of motion. Focus on muscle contraction rather than range — quality > quantity.`;
  }

  // Generic fallback
  return `The ${exerciseName} targets the ${muscleGroup} through controlled resistance training. Focus on the eccentric (lowering) phase — research consistently shows 2–3 second negatives increase time under tension and hypertrophic stimulus. Prioritize form and range of motion over load.`;
}
