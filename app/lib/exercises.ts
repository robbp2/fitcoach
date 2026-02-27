export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' 
  | 'forearms' | 'quads' | 'hamstrings' | 'glutes' | 'calves' 
  | 'abs' | 'obliques' | 'lower-back' | 'traps';

export type Equipment = 
  | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' 
  | 'kettlebell' | 'bands' | 'none';

export type MovementPattern = 
  | 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'isolation';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  movementPattern: MovementPattern;
  description: string;
  formCues: string[];
}

export const exercises: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'The king of chest exercises. Lie on a bench and press a barbell from chest to full arm extension.',
    formCues: [
      'Retract shoulder blades and keep them pinned',
      'Lower bar to mid-chest with elbows at 45 degrees',
      'Drive feet into ground',
      'Touch chest lightly, then press up explosively'
    ]
  },
  {
    id: 'incline-barbell-bench',
    name: 'Incline Barbell Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Bench press variation targeting upper chest. Performed on a 30-45 degree incline.',
    formCues: [
      'Set bench to 30-45 degrees',
      'Lower to upper chest',
      'Keep wrists straight',
      'Full range of motion'
    ]
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'push',
    description: 'Press dumbbells from chest level to overhead while lying on a flat bench.',
    formCues: [
      'Start with dumbbells at chest level',
      'Press up and slightly inward',
      'Control the descent',
      'Greater range of motion than barbell'
    ]
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'push',
    description: 'Upper chest emphasis dumbbell press on an incline bench.',
    formCues: [
      '30-45 degree incline',
      'Lower dumbbells to chest level',
      'Press straight up',
      'Squeeze at the top'
    ]
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    movementPattern: 'isolation',
    description: 'Isolation exercise that stretches and contracts the chest through a wide arc.',
    formCues: [
      'Slight bend in elbows throughout',
      'Lower with control until chest stretch',
      'Think of hugging a tree',
      'Squeeze chest at top'
    ]
  },
  {
    id: 'cable-flyes',
    name: 'Cable Flyes',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    equipment: ['cable'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Cable variation providing constant tension on the chest throughout the movement.',
    formCues: [
      'Cables set at shoulder height',
      'Step forward for stability',
      'Maintain elbow bend',
      'Bring hands together in front'
    ]
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps', 'abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'push',
    description: 'Classic bodyweight exercise. Lower your body until chest nearly touches ground.',
    formCues: [
      'Hands slightly wider than shoulders',
      'Body in straight line',
      'Lower until chest nearly touches',
      'Push through full range'
    ]
  },
  {
    id: 'dips-chest',
    name: 'Chest Dips',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Bodyweight exercise with a forward lean to emphasize the chest.',
    formCues: [
      'Lean forward 20-30 degrees',
      'Elbows flared slightly out',
      'Lower until stretch in chest',
      'Press back up powerfully'
    ]
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    primaryMuscles: ['back', 'glutes', 'hamstrings'],
    secondaryMuscles: ['traps', 'forearms', 'abs'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    movementPattern: 'hinge',
    description: 'The king of all lifts. Lift a barbell from the ground to standing position.',
    formCues: [
      'Feet hip-width, bar over mid-foot',
      'Hinge at hips, grab bar',
      'Neutral spine throughout',
      'Drive through heels, extend hips'
    ]
  },
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'traps', 'lower-back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'pull',
    description: 'Pull a barbell to your lower chest while bent over at the hips.',
    formCues: [
      'Hinge forward to 45 degrees',
      'Pull bar to lower chest',
      'Keep back neutral',
      'Lead with elbows'
    ]
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'pull',
    description: 'Pull your body up until chin clears the bar. One of the best back builders.',
    formCues: [
      'Hang with arms fully extended',
      'Pull until chin over bar',
      'Think of pulling elbows down',
      'Control the descent'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'traps'],
    equipment: ['cable', 'machine'],
    difficulty: 'beginner',
    movementPattern: 'pull',
    description: 'Machine-based pulling movement. Great for building pull-up strength.',
    formCues: [
      'Grip slightly wider than shoulders',
      'Pull bar to upper chest',
      'Lean back slightly',
      'Squeeze shoulder blades together'
    ]
  },
  {
    id: 'dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'traps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'pull',
    description: 'Unilateral row allowing for greater range of motion and mind-muscle connection.',
    formCues: [
      'Support with hand and knee on bench',
      'Pull dumbbell to hip',
      'Keep torso stable',
      'Squeeze at top'
    ]
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'traps'],
    equipment: ['cable'],
    difficulty: 'beginner',
    movementPattern: 'pull',
    description: 'Seated rowing movement with constant cable tension.',
    formCues: [
      'Sit with slight torso lean forward',
      'Pull to lower chest',
      'Keep chest up',
      'Squeeze shoulder blades'
    ]
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'traps', 'lower-back'],
    equipment: ['barbell', 'machine'],
    difficulty: 'intermediate',
    movementPattern: 'pull',
    description: 'Thick back builder. Row a barbell anchored at one end.',
    formCues: [
      'Hinge at hips',
      'Pull bar to chest',
      'Keep lower back neutral',
      'Full range of motion'
    ]
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    primaryMuscles: ['shoulders', 'back'],
    secondaryMuscles: ['traps'],
    equipment: ['cable'],
    difficulty: 'beginner',
    movementPattern: 'pull',
    description: 'Pull cable attachment to face level. Great for rear delts and upper back health.',
    formCues: [
      'Rope attachment at face height',
      'Pull toward face, hands apart',
      'External rotation at end',
      'Shoulders back and down'
    ]
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Overhead Press (Military Press)',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'traps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Press a barbell from shoulders to overhead. The king of shoulder exercises.',
    formCues: [
      'Bar starts at collarbone',
      'Press straight up',
      'Head moves back slightly',
      'Lock out overhead'
    ]
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'traps'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'push',
    description: 'Press dumbbells from shoulder level to overhead.',
    formCues: [
      'Start at shoulder level',
      'Press straight up',
      'Neutral or pronated grip',
      'Full lockout'
    ]
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Isolation exercise for the side delts. Raise dumbbells out to the sides.',
    formCues: [
      'Slight bend in elbows',
      'Raise to shoulder height',
      'Lead with elbows',
      'Control the descent'
    ]
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'barbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Raise weight from thighs to shoulder level in front of body.',
    formCues: [
      'Start at thighs',
      'Raise to eye level',
      'Slight elbow bend',
      'Controlled movement'
    ]
  },
  {
    id: 'rear-delt-flyes',
    name: 'Rear Delt Flyes',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Isolation for the often-neglected rear deltoids.',
    formCues: [
      'Bend forward at hips',
      'Raise dumbbells out to sides',
      'Pinch shoulder blades',
      'Lead with elbows'
    ]
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Shoulder press variation with rotation. Named after Arnold Schwarzenegger.',
    formCues: [
      'Start palms facing you',
      'Rotate as you press up',
      'End in standard press position',
      'Reverse on the way down'
    ]
  },

  // LEG EXERCISES - QUADS
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'abs', 'lower-back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'squat',
    description: 'The king of leg exercises. Squat with barbell on upper back.',
    formCues: [
      'Bar on upper traps',
      'Feet shoulder-width',
      'Descend until thighs parallel',
      'Drive through heels'
    ]
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'abs'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    movementPattern: 'squat',
    description: 'Squat with bar on front shoulders. More quad emphasis, very core-intensive.',
    formCues: [
      'Bar on front delts',
      'Elbows high',
      'Upright torso',
      'Full depth squat'
    ]
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['machine'],
    difficulty: 'beginner',
    movementPattern: 'squat',
    description: 'Machine-based leg exercise. Safer for high volumes.',
    formCues: [
      'Feet shoulder-width on platform',
      'Lower until knees at 90 degrees',
      'Push through heels',
      'Don\'t lock out completely'
    ]
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['dumbbell', 'bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'lunge',
    description: 'Single-leg squat with rear foot elevated. Excellent for balance and unilateral strength.',
    formCues: [
      'Rear foot on bench',
      'Lower until front thigh parallel',
      'Keep torso upright',
      'Drive through front heel'
    ]
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    equipment: ['machine'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Isolation exercise for the quadriceps.',
    formCues: [
      'Sit with back against pad',
      'Extend legs fully',
      'Squeeze at top',
      'Control the descent'
    ]
  },
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['dumbbell', 'bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'lunge',
    description: 'Step forward into a lunge, alternating legs.',
    formCues: [
      'Step forward into lunge',
      'Back knee nearly touches ground',
      'Keep torso upright',
      'Push through front heel'
    ]
  },

  // LEG EXERCISES - HAMSTRINGS & GLUTES
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower-back', 'traps'],
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    movementPattern: 'hinge',
    description: 'Hip hinge movement that targets hamstrings and glutes.',
    formCues: [
      'Start standing with bar',
      'Hinge at hips, slight knee bend',
      'Lower until hamstring stretch',
      'Drive hips forward to stand'
    ]
  },
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    equipment: ['machine'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Isolation exercise for the hamstrings.',
    formCues: [
      'Lie face down on machine',
      'Curl heels to glutes',
      'Squeeze at top',
      'Control the extension'
    ]
  },
  {
    id: 'glute-ham-raise',
    name: 'Glute Ham Raise',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['calves'],
    equipment: ['machine', 'bodyweight'],
    difficulty: 'advanced',
    movementPattern: 'hinge',
    description: 'Extremely challenging hamstring exercise.',
    formCues: [
      'Feet anchored, knees on pad',
      'Lower torso forward',
      'Use hamstrings to pull back up',
      'One of the hardest hamstring moves'
    ]
  },
  {
    id: 'hip-thrust',
    name: 'Barbell Hip Thrust',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'hinge',
    description: 'The best glute builder. Thrust hips upward with barbell across hips.',
    formCues: [
      'Upper back on bench',
      'Bar across hips',
      'Drive hips up until parallel',
      'Squeeze glutes hard at top'
    ]
  },
  {
    id: 'good-mornings',
    name: 'Good Mornings',
    primaryMuscles: ['hamstrings', 'glutes', 'lower-back'],
    secondaryMuscles: [],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'hinge',
    description: 'Hip hinge with barbell on upper back.',
    formCues: [
      'Bar on upper back',
      'Hinge forward at hips',
      'Slight knee bend',
      'Feel stretch in hamstrings'
    ]
  },

  // LEG EXERCISES - CALVES
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: ['machine', 'dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Raise up on toes to work the calf muscles.',
    formCues: [
      'Balls of feet on platform',
      'Raise up as high as possible',
      'Squeeze at top',
      'Full range stretch at bottom'
    ]
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: ['machine'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Seated variation that targets the soleus muscle.',
    formCues: [
      'Knees at 90 degrees',
      'Raise heels as high as possible',
      'Full stretch at bottom',
      'Higher reps work well'
    ]
  },

  // ARM EXERCISES - BICEPS
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['barbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Classic bicep builder. Curl a barbell from thighs to shoulders.',
    formCues: [
      'Elbows at sides',
      'Curl bar up',
      'Squeeze at top',
      'Control the descent'
    ]
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Curl dumbbells from thighs to shoulders. Can be alternating or simultaneous.',
    formCues: [
      'Start with arms extended',
      'Curl with supination',
      'Peak contraction at top',
      'No swinging'
    ]
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Neutral grip curl that also works brachialis and forearms.',
    formCues: [
      'Palms facing each other',
      'Curl up maintaining grip',
      'Elbows stable',
      'Targets brachialis'
    ]
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    equipment: ['barbell', 'dumbbell', 'machine'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Arm curl with upper arms resting on an angled pad. Prevents cheating.',
    formCues: [
      'Arms on angled pad',
      'Curl to top',
      'No momentum',
      'Full stretch at bottom'
    ]
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['cable'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Cable variation providing constant tension.',
    formCues: [
      'Stand facing cable stack',
      'Curl bar attachment',
      'Constant tension',
      'Peak contraction'
    ]
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Seated single-arm curl. Great for mind-muscle connection.',
    formCues: [
      'Sit, elbow against inner thigh',
      'Curl dumbbell up',
      'Focus on bicep contraction',
      'Full range of motion'
    ]
  },

  // ARM EXERCISES - TRICEPS
  {
    id: 'close-grip-bench',
    name: 'Close-Grip Bench Press',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Bench press with narrow grip. Best mass builder for triceps.',
    formCues: [
      'Grip at shoulder width',
      'Elbows closer to body',
      'Lower to lower chest',
      'Triceps do most work'
    ]
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Bodyweight dip with upright torso to emphasize triceps.',
    formCues: [
      'Torso upright',
      'Elbows back',
      'Lower until 90 degrees',
      'Press back up'
    ]
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'cable'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Extend weight overhead, stretching the triceps.',
    formCues: [
      'Hold weight overhead',
      'Lower behind head',
      'Elbows stay in place',
      'Extend back to top'
    ]
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: ['cable'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Push cable attachment down by extending elbows.',
    formCues: [
      'Elbows at sides',
      'Push down until full extension',
      'Squeeze at bottom',
      'Control the return'
    ]
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    movementPattern: 'isolation',
    description: 'Lying tricep extension. Lower weight to forehead, extend back up.',
    formCues: [
      'Lie on bench, arms extended',
      'Lower bar to forehead',
      'Only elbows move',
      'Extend back to start'
    ]
  },

  // FOREARM EXERCISES
  {
    id: 'wrist-curl',
    name: 'Wrist Curl',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'barbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Curl weight using only wrist movement.',
    formCues: [
      'Forearms on bench/thighs',
      'Curl wrists up',
      'Full range of motion',
      'Squeeze at top'
    ]
  },
  {
    id: 'reverse-wrist-curl',
    name: 'Reverse Wrist Curl',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'barbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Overhand grip wrist curl for forearm extensors.',
    formCues: [
      'Overhand grip',
      'Extend wrists up',
      'Forearms supported',
      'Light weight, high reps'
    ]
  },
  {
    id: 'farmers-walk',
    name: 'Farmer\'s Walk',
    primaryMuscles: ['forearms', 'traps'],
    secondaryMuscles: ['abs', 'shoulders'],
    equipment: ['dumbbell', 'kettlebell'],
    difficulty: 'beginner',
    movementPattern: 'carry',
    description: 'Walk with heavy weights in each hand. Builds grip and traps.',
    formCues: [
      'Heavy weights in each hand',
      'Walk with upright posture',
      'Shoulders back',
      'Grip as hard as possible'
    ]
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'lower-back'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Hold a push-up position on forearms. Core endurance builder.',
    formCues: [
      'Forearms on ground',
      'Body in straight line',
      'Squeeze abs and glutes',
      'Don\'t let hips sag'
    ]
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['lower-back', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    movementPattern: 'isolation',
    description: 'Roll ab wheel forward, then pull back using core.',
    formCues: [
      'Start on knees',
      'Roll forward slowly',
      'Keep core braced',
      'Pull back to start'
    ]
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'isolation',
    description: 'Hang from bar and raise legs up. Advanced ab exercise.',
    formCues: [
      'Hang from pull-up bar',
      'Raise legs to parallel',
      'Control the movement',
      'No swinging'
    ]
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    equipment: ['cable'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Kneel and crunch down against cable resistance.',
    formCues: [
      'Kneel facing cable',
      'Hold rope at head level',
      'Crunch down',
      'Focus on ab contraction'
    ]
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Seated rotational exercise for obliques.',
    formCues: [
      'Sit with feet elevated',
      'Rotate torso side to side',
      'Hold weight for difficulty',
      'Control the movement'
    ]
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Hold a sideways plank position. Great for obliques.',
    formCues: [
      'Lie on side, prop on forearm',
      'Body in straight line',
      'Hold position',
      'Switch sides'
    ]
  },
  {
    id: 'bicycle-crunch',
    name: 'Bicycle Crunch',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Alternating knee-to-elbow crunches in a bicycle motion.',
    formCues: [
      'Lie on back',
      'Bring knee to opposite elbow',
      'Alternate sides',
      'Controlled tempo'
    ]
  },

  // TRAP EXERCISES
  {
    id: 'barbell-shrug',
    name: 'Barbell Shrug',
    primaryMuscles: ['traps'],
    secondaryMuscles: ['forearms'],
    equipment: ['barbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Shrug shoulders up while holding a barbell.',
    formCues: [
      'Hold bar at thighs',
      'Shrug straight up',
      'Squeeze at top',
      'No rolling shoulders'
    ]
  },
  {
    id: 'dumbbell-shrug',
    name: 'Dumbbell Shrug',
    primaryMuscles: ['traps'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Shrug with dumbbells at sides.',
    formCues: [
      'Dumbbells at sides',
      'Shrug straight up',
      'Hold at top',
      'Greater range than barbell'
    ]
  },

  // LOWER BACK EXERCISES
  {
    id: 'back-extension',
    name: 'Back Extension',
    primaryMuscles: ['lower-back'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: ['machine', 'bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'hinge',
    description: 'Extend your torso from a bent position. Great for lower back health.',
    formCues: [
      'Lie face down on machine',
      'Hinge at hips',
      'Extend back to parallel',
      'Don\'t hyperextend'
    ]
  },
  {
    id: 'supermans',
    name: 'Supermans',
    primaryMuscles: ['lower-back'],
    secondaryMuscles: ['glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'isolation',
    description: 'Lie face down and lift arms and legs simultaneously.',
    formCues: [
      'Lie face down',
      'Lift arms and legs',
      'Squeeze lower back',
      'Hold briefly'
    ]
  },

  // COMPOUND OLYMPIC LIFTS
  {
    id: 'clean',
    name: 'Power Clean',
    primaryMuscles: ['back', 'traps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'shoulders', 'quads'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    movementPattern: 'pull',
    description: 'Explosive lift from floor to shoulders. Olympic weightlifting movement.',
    formCues: [
      'Start like deadlift',
      'Explosive hip extension',
      'Catch on shoulders',
      'Requires coaching'
    ]
  },
  {
    id: 'snatch',
    name: 'Snatch',
    primaryMuscles: ['back', 'traps', 'shoulders'],
    secondaryMuscles: ['quads', 'glutes', 'hamstrings'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    movementPattern: 'pull',
    description: 'Explosive lift from floor to overhead in one motion.',
    formCues: [
      'Wide grip',
      'Explosive pull',
      'Catch overhead',
      'Very technical, get coaching'
    ]
  },

  // ADDITIONAL FUNCTIONAL EXERCISES
  {
    id: 'box-jump',
    name: 'Box Jump',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['calves', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'squat',
    description: 'Explosive jump onto a box or platform.',
    formCues: [
      'Start with hip hinge',
      'Swing arms back',
      'Jump explosively',
      'Land softly'
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    primaryMuscles: ['quads', 'chest', 'shoulders'],
    secondaryMuscles: ['abs', 'triceps'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'push',
    description: 'Drop to push-up, jump back up. Full-body cardio movement.',
    formCues: [
      'Drop to push-up position',
      'Push-up',
      'Jump feet forward',
      'Jump up'
    ]
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['lower-back', 'shoulders', 'abs'],
    equipment: ['kettlebell'],
    difficulty: 'intermediate',
    movementPattern: 'hinge',
    description: 'Hip hinge movement swinging kettlebell from legs to chest height.',
    formCues: [
      'Hip hinge, not squat',
      'Explosive hip drive',
      'Swing to chest height',
      'Kettlebell floats at top'
    ]
  },
  {
    id: 'turkish-getup',
    name: 'Turkish Get-Up',
    primaryMuscles: ['shoulders', 'abs'],
    secondaryMuscles: ['glutes', 'quads'],
    equipment: ['kettlebell', 'dumbbell'],
    difficulty: 'advanced',
    movementPattern: 'carry',
    description: 'Complex movement from lying to standing while holding weight overhead.',
    formCues: [
      'Start lying, weight overhead',
      'Stand up in sequence',
      'Keep weight overhead throughout',
      'Learn the sequence'
    ]
  },
  {
    id: 'sled-push',
    name: 'Sled Push',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['calves', 'shoulders', 'abs'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    movementPattern: 'push',
    description: 'Push a weighted sled. Great for legs without eccentric damage.',
    formCues: [
      'Low body position',
      'Drive with legs',
      'Push through whole foot',
      'No eccentric means less soreness'
    ]
  },
  {
    id: 'battle-ropes',
    name: 'Battle Ropes',
    primaryMuscles: ['shoulders', 'abs'],
    secondaryMuscles: ['forearms', 'back'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    movementPattern: 'carry',
    description: 'Create waves in heavy ropes. Great conditioning.',
    formCues: [
      'Slight squat stance',
      'Alternate or simultaneous waves',
      'Maintain tension',
      'Explosive movement'
    ]
  },
];

// Helper functions
export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return exercises.filter(ex => 
    ex.primaryMuscles.includes(muscle) || ex.secondaryMuscles.includes(muscle)
  );
}

export function getExercisesByEquipment(equipment: Equipment[]): Exercise[] {
  return exercises.filter(ex =>
    ex.equipment.some(eq => equipment.includes(eq))
  );
}

export function getExercisesByDifficulty(difficulty: Difficulty): Exercise[] {
  return exercises.filter(ex => ex.difficulty === difficulty);
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(ex => ex.id === id);
}
