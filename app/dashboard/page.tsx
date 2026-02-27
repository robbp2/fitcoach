'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', filter: 'blur(120px)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', filter: 'blur(120px)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Activity size={32} className="text-indigo-400" />
        </div>

        <div className="space-y-2">
          <p className="text-sm tracking-[0.2em] text-zinc-500 font-medium uppercase">
            Phase 3 — Coming Soon
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mt-4">
            Your personalized program is being engineered. <br />
            The program engine (Phase 3) will power this view.
          </p>
        </div>

        <Link
          href="/"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('fitcoach_profile');
              localStorage.removeItem('fitcoach_program');
            }
          }}
          className="mt-4 flex items-center space-x-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all"
        >
          ← Restart Intake
        </Link>
      </div>
    </div>
  );
}
