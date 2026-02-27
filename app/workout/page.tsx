'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Dumbbell } from 'lucide-react';

export default function WorkoutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(99,102,241,0.10)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(16,185,129,0.10)', filter: 'blur(120px)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Dumbbell size={36} className="text-indigo-400" />
        </div>

        <div className="space-y-3">
          <p className="text-xs tracking-[0.2em] text-indigo-400 uppercase font-medium">
            Coming Soon
          </p>
          <h1 className="text-3xl font-semibold">Active Workout</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The full active workout view with exercise videos, set tracking, and rest timers
            is coming in Phase 5.
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
