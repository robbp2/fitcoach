# FitCoach - Interactive Fitness Coaching Platform

A complete, production-ready Next.js fitness coaching web application with science-based workout programming.

## ✅ Completed Features

### 1. Visual Intake Survey (Fully Functional)
- **8-step interactive form** with smooth transitions and progress tracking
- **Step 1**: Basic info (height, weight, age, sex)
- **Step 2**: Training history (beginner/intermediate/advanced, years training, frequency)
- **Step 3**: **Visual physique selection** with 6 archetype options:
  - Lean Athletic (Brad Pitt Fight Club style)
  - Classic Bodybuilder (Frank Zane golden era)
  - Mass Monster (heavyweight bodybuilder)
  - Powerlifter Strong (thick and powerful)
  - CrossFit Functional (balanced athletic)
  - Swimmer/Runner Lean (endurance focused)
  - Each with high-quality Unsplash images
- **Step 4**: Equipment selection (barbell, dumbbell, cable, machine, etc.)
- **Step 5**: Schedule (days per week, time per session)
- **Step 6**: Injury history with checkboxes + free text
- **Step 7**: Goal prioritization (interactive sliders for muscle growth, fat loss, strength, endurance, flexibility)
- **Step 8**: Review and submit

Beautiful dark mode UI with Tailwind CSS, mobile-responsive design.

### 2. Daily Workout Dashboard (Fully Functional)
- **Weekly calendar view** showing which days have workouts
- **Today's workout display** with:
  - Exercise cards showing name, muscle groups, sets/reps, rest periods, RPE targets
  - Placeholder for exercise demo videos (ready for Remotion integration)
  - Set logging interface (weight, reps, RPE per set)
  - Checkboxes to mark sets complete
  - Progress tracking (X/Y sets completed)
- **Exercise details**:
  - Primary and secondary muscles highlighted
  - Collapsible form cues and technique tips
  - Full exercise descriptions
- **Program notes** displayed at bottom
- **Reset profile** button to start over

### 3. Workout Program Engine (Complete)
Located in `app/lib/program-engine.ts`

**Intelligent program generation based on:**
- Training days available (3, 4, 5, or 6 days)
- Training experience level
- Equipment availability
- Primary goals (strength, hypertrophy, endurance)

**Program splits supported:**
- **PPL (Push/Pull/Legs)** - 6 days/week
- **Upper/Lower** - 4 days/week  
- **Full Body** - 3 days/week
- **Bro Split** - 5 days/week

**Science-based volume recommendations:**
- Beginner: 10-12 sets per muscle per week
- Intermediate: 14-18 sets per muscle per week
- Advanced: 18-22 sets per muscle per week

**Rep ranges tailored to goals:**
- Strength: 3-6 reps, 3-5min rest
- Hypertrophy: 8-12 reps, 60-90s rest
- Endurance: 15-20 reps, 30-45s rest

### 4. Exercise Database (Complete)
Located in `app/lib/exercises.ts`

**80+ exercises** covering all muscle groups:
- **Chest**: Bench press variations, flyes, dips, push-ups
- **Back**: Deadlifts, rows, pull-ups, lat pulldowns
- **Shoulders**: Overhead press, lateral raises, rear delt work
- **Legs**: Squats, lunges, leg press, Romanian deadlifts
- **Arms**: Curls, tricep extensions, close-grip bench
- **Core**: Planks, ab wheel, hanging leg raises
- **Olympic**: Clean, snatch
- **Functional**: Kettlebell swings, farmer's walks, box jumps

**Each exercise includes:**
- Primary and secondary muscle groups
- Equipment needed
- Difficulty level (beginner/intermediate/advanced)
- Movement pattern (push/pull/squat/hinge/isolation)
- Detailed description
- 4+ form cues for proper technique

## 🏗️ Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **File-based storage** (JSON) - no database required
- **REST API** for profile management

## 🚀 Running the App

```bash
cd /Users/pilipos/.openclaw/workspace-fitcoach/app
npm run dev
```

Visit: http://localhost:3000

## 📁 Project Structure

```
app/
├── app/
│   ├── api/
│   │   └── profile/
│   │       └── route.ts          # Profile save/load API
│   ├── components/
│   │   ├── IntakeSurvey.tsx      # 8-step intake form
│   │   └── Dashboard.tsx         # Daily workout view
│   ├── lib/
│   │   ├── exercises.ts          # 80+ exercise database
│   │   └── program-engine.ts     # Program generation logic
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main app page
├── public/                       # Static assets
└── package.json
```

## 💾 Data Storage

Client profiles are saved to:
```
/Users/pilipos/.openclaw/workspace-fitcoach/client-profile.json
```

This file contains:
- Full client profile (demographics, goals, equipment, injuries)
- Generated workout program
- Weekly schedule

## 🎯 Key Features

### Smart Exercise Selection
The program engine intelligently selects exercises based on:
- Available equipment
- Training level (excludes advanced moves for beginners)
- Primary muscle targets
- Movement patterns (prioritizes compounds first)

### Progression Tracking
Each set can be logged with:
- Weight used
- Reps completed
- RPE (Rate of Perceived Exertion)
- Completion status

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Smooth animations and transitions
- Dark mode optimized

## 🔮 Future Enhancements

Ready for integration:
- **Remotion videos** for exercise demos
- **Progress charts** and analytics
- **Workout history** tracking
- **Progressive overload** suggestions
- **Deload weeks** programming
- **Nutrition guidance** integration

## 🏋️ Example Programs Generated

### PPL (6 days/week)
- Day 1: Push (Chest, Shoulders, Triceps)
- Day 2: Pull (Back, Biceps, Rear Delts)
- Day 3: Legs (Quads, Hamstrings, Glutes, Calves)
- Repeat for days 4-6

### Upper/Lower (4 days/week)
- Day 1: Upper A (Horizontal emphasis)
- Day 2: Lower A (Squat emphasis)
- Day 3: Upper B (Vertical emphasis)
- Day 4: Lower B (Hinge emphasis)

### Full Body (3 days/week)
- Each session trains entire body
- Different exercise variations per day
- High frequency for skill development

## 🎨 Design Philosophy

- **Clean, modern UI** with gradient accents
- **Card-based layouts** for easy scanning
- **Progressive disclosure** (collapsible form cues)
- **Visual feedback** (checkmarks, progress bars, colors)
- **Accessibility** focused

## 📝 Notes

- All images use Unsplash URLs (reliable, high-quality stock photos)
- No external API dependencies
- Fully self-contained application
- Production-ready code with TypeScript types
- Mobile responsive throughout

## 🏃 Quick Start

1. Complete the 8-step intake survey
2. Review your generated program
3. Select a day from the weekly calendar
4. Log your sets as you work out
5. Track your progress over time

---

**Built with** ❤️ **using science-based training principles**
