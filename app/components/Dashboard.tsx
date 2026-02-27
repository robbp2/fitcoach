'use client';

import { useState, useEffect } from 'react';
import { WorkoutProgram, WorkoutDay, WorkoutExercise, getTodaysWorkout } from '../lib/program-engine';

interface SetLog {
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

interface DashboardProps {
  program: WorkoutProgram;
}

export default function Dashboard({ program }: DashboardProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({});

  useEffect(() => {
    const todayWorkout = getTodaysWorkout(program, selectedDay);
    setWorkout(todayWorkout);
    
    // Initialize set logs for each exercise
    if (todayWorkout) {
      const logs: Record<string, SetLog[]> = {};
      todayWorkout.exercises.forEach(ex => {
        logs[ex.exercise.id] = Array(ex.sets).fill(null).map(() => ({
          weight: 0,
          reps: 0,
          rpe: 7,
          completed: false
        }));
      });
      setSetLogs(logs);
    }
  }, [selectedDay, program]);

  const updateSetLog = (exerciseId: string, setIndex: number, data: Partial<SetLog>) => {
    setSetLogs(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((log, idx) => 
        idx === setIndex ? { ...log, ...data } : log
      )
    }));
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    setSetLogs(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((log, idx) => 
        idx === setIndex ? { ...log, completed: !log.completed } : log
      )
    }));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-2">{program.programName}</h1>
          <p className="text-gray-400">{program.split}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Weekly Calendar */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Weekly Schedule</h2>
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day, idx) => {
              const dayWorkout = getTodaysWorkout(program, idx);
              const isToday = idx === new Date().getDay();
              const isSelected = idx === selectedDay;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(idx)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/20'
                      : dayWorkout
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                      : 'border-gray-700 bg-gray-900 opacity-50'
                  } ${isToday ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <div className="text-sm text-gray-400">{day}</div>
                  <div className="text-xs mt-1 font-semibold">
                    {dayWorkout ? dayWorkout.name : 'Rest'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Workout */}
        {workout ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{workout.name}</h2>
                <p className="text-gray-400">{workout.focus}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Progress</div>
                <div className="text-2xl font-bold text-blue-500">
                  {Object.values(setLogs).flat().filter(s => s.completed).length} / {Object.values(setLogs).flat().length}
                </div>
              </div>
            </div>

            {/* Exercise Cards */}
            <div className="space-y-6">
              {workout.exercises.map((workoutEx, exIdx) => {
                const exercise = workoutEx.exercise;
                const logs = setLogs[exercise.id] || [];
                const completedSets = logs.filter(s => s.completed).length;

                return (
                  <div key={exercise.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                    {/* Exercise Header */}
                    <div className="p-6 border-b border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{exercise.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                              {exercise.primaryMuscles.join(', ')}
                            </span>
                            {exercise.secondaryMuscles.length > 0 && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                                {exercise.secondaryMuscles.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-500">
                            {completedSets}/{workoutEx.sets}
                          </div>
                          <div className="text-xs text-gray-400">sets</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-400">Sets × Reps:</span>
                          <div className="font-semibold">{workoutEx.sets} × {workoutEx.reps}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Rest:</span>
                          <div className="font-semibold">{workoutEx.restSeconds}s</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Target RPE:</span>
                          <div className="font-semibold">{workoutEx.rpe}</div>
                        </div>
                      </div>

                      {/* Placeholder for video */}
                      <div className="mt-4 bg-gray-900 rounded-lg p-8 text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm">Exercise demo video (coming soon)</div>
                      </div>
                    </div>

                    {/* Set Logging */}
                    <div className="p-6">
                      <h4 className="font-semibold mb-3">Log Your Sets</h4>
                      <div className="space-y-3">
                        {logs.map((log, setIdx) => (
                          <div 
                            key={setIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              log.completed 
                                ? 'border-green-500 bg-green-500/10' 
                                : 'border-gray-700 bg-gray-900'
                            }`}
                          >
                            <button
                              onClick={() => toggleSetComplete(exercise.id, setIdx)}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                log.completed
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              {log.completed && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs text-gray-400 block mb-1">Weight (kg)</label>
                                <input
                                  type="number"
                                  value={log.weight || ''}
                                  onChange={(e) => updateSetLog(exercise.id, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
                                  placeholder="0"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-gray-400 block mb-1">Reps</label>
                                <input
                                  type="number"
                                  value={log.reps || ''}
                                  onChange={(e) => updateSetLog(exercise.id, setIdx, { reps: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
                                  placeholder={workoutEx.reps}
                                />
                              </div>

                              <div>
                                <label className="text-xs text-gray-400 block mb-1">RPE</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  step="0.5"
                                  value={log.rpe || ''}
                                  onChange={(e) => updateSetLog(exercise.id, setIdx, { rpe: parseFloat(e.target.value) || 7 })}
                                  className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
                                  placeholder="7"
                                />
                              </div>
                            </div>

                            <div className="text-sm font-semibold text-gray-400">
                              Set {setIdx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form Cues (Collapsible) */}
                    <details className="border-t border-gray-700">
                      <summary className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors font-semibold">
                        Form Cues & Tips
                      </summary>
                      <div className="p-4 pt-0 space-y-2">
                        <p className="text-gray-400 text-sm mb-3">{exercise.description}</p>
                        <ul className="space-y-1">
                          {exercise.formCues.map((cue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-gray-300">{cue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>

            {/* Complete Workout Button */}
            <div className="mt-8 text-center">
              <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-lg transition-all">
                Complete Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏖️</div>
            <h2 className="text-2xl font-bold mb-2">Rest Day</h2>
            <p className="text-gray-400">Recovery is just as important as training!</p>
          </div>
        )}

        {/* Program Notes */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold mb-3">Program Notes</h3>
          <ul className="space-y-2">
            {program.notes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-blue-500 mt-1">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
