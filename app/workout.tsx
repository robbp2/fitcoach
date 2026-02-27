import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

import type { WorkoutProgram, WorkoutDay, Exercise } from '../lib/types';
import {
  loadProgram,
  saveProgram,
  getTodaysWorkout,
  advanceProgram,
} from '../lib/program-engine';

// UPDATE THIS to your deployed app URL
const VIDEO_BASE_URL = 'https://fitcoach-56okh.ondigitalocean.app';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_HEIGHT * 0.38;
const TIMER_SIZE = 120;




export default function WorkoutScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);

  // Combine warmup + exercises into a single list
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  // Video state
  const [isPlaying, setIsPlaying] = useState(true);

  // Rest timer
  const [resting, setResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const timerProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const p = await loadProgram();
      if (!p) {
        router.replace('/');
        return;
      }
      const w = getTodaysWorkout(p);
      if (!w) {
        router.replace('/dashboard');
        return;
      }
      setProgram(p);
      setWorkout(w);
      const combined = [...w.warmup, ...w.exercises];
      setAllExercises(combined);
      setCompletedSets(new Array(combined.length).fill(0));
      setLoading(false);
    })();
  }, []);

  const currentExercise = allExercises[exerciseIndex];
  const currentCompletedSets = completedSets[exerciseIndex] ?? 0;

  // Rest timer countdown
  useEffect(() => {
    if (!resting || restTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          setResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resting, restTimeLeft]);

  // Animate timer ring
  useEffect(() => {
    if (resting && restTotal > 0) {
      timerProgress.setValue(0);
      Animated.timing(timerProgress, {
        toValue: 1,
        duration: restTotal * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [resting, restTotal]);

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise) return;

    const newCompleted = currentCompletedSets + 1;
    const newArr = [...completedSets];
    newArr[exerciseIndex] = newCompleted;
    setCompletedSets(newArr);

    if (newCompleted < currentExercise.sets) {
      // Start rest timer
      setRestTotal(currentExercise.restSeconds);
      setRestTimeLeft(currentExercise.restSeconds);
      setResting(true);
    }
  }, [currentExercise, currentCompletedSets, completedSets, exerciseIndex]);

  const handleNextExercise = useCallback(() => {
    setResting(false);
    if (exerciseIndex < allExercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
      setIsPlaying(true);
    }
  }, [exerciseIndex, allExercises.length]);

  const handleCompleteWorkout = useCallback(async () => {
    if (!program) return;
    const updated = advanceProgram(program);
    await saveProgram(updated);
    router.replace('/dashboard');
  }, [program]);

  const handleSkipRest = useCallback(() => {
    setResting(false);
    setRestTimeLeft(0);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  }, []);

  if (loading || !currentExercise) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  const isWarmup = currentExercise.isWarmup;
  const isLastExercise = exerciseIndex === allExercises.length - 1;
  const allSetsComplete = currentCompletedSets >= currentExercise.sets;

  const videoUri = `${VIDEO_BASE_URL}/${currentExercise.videoPath}`;

    return (
    <View style={s.container}>
      {/* Video section */}
      <View style={s.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={s.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping
          isMuted
        />
        {/* Play/pause overlay */}
        <TouchableOpacity style={s.videoOverlay} onPress={togglePlayPause} activeOpacity={0.8}>
          {!isPlaying && (
            <View style={s.playIcon}>
              <Ionicons name="play" size={36} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        {/* Back button */}
        <SafeAreaView style={s.backBtnContainer} edges={['top']}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/dashboard')}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        {/* Exercise counter */}
        <View style={s.exerciseCounter}>
          <Text style={s.exerciseCounterText}>
            {exerciseIndex + 1} / {allExercises.length}
          </Text>
        </View>
      </View>

      {/* Panel section */}
      <ScrollView style={s.panel} contentContainerStyle={s.panelContent} showsVerticalScrollIndicator={false}>
        {/* Exercise info */}
        <View style={s.exerciseHeader}>
          {isWarmup && (
            <View style={s.warmupBadge}>
              <Text style={s.warmupBadgeText}>WARMUP</Text>
            </View>
          )}
          <Text style={s.exerciseName}>{currentExercise.name}</Text>
          <View style={s.statsRow}>
            <StatPill
              icon="layers-outline"
              label={`${currentCompletedSets}/${currentExercise.sets} sets`}
              color="#fbbf24"
            />
            <StatPill
              icon="repeat-outline"
              label={currentExercise.repRange}
              color="#22d3ee"
            />
            <StatPill
              icon="time-outline"
              label={`${currentExercise.restSeconds}s rest`}
              color="#a1a1aa"
            />
            {currentExercise.rpe != null && (
              <StatPill
                icon="flash-outline"
                label={`RPE ${currentExercise.rpe}`}
                color="#f87171"
              />
            )}
          </View>
        </View>

        {/* Rest timer */}
        {resting && (
          <View style={s.timerContainer}>
            <View style={s.timerRing}>
              <View style={s.timerCircle}>
                <Text style={s.timerText}>{restTimeLeft}</Text>
                <Text style={s.timerLabel}>REST</Text>
              </View>
            </View>
            <TouchableOpacity style={s.skipBtn} onPress={handleSkipRest}>
              <Text style={s.skipBtnText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Science note */}
        {currentExercise.scienceNote && (
          <View style={s.scienceCard}>
            <View style={s.scienceHeader}>
              <Ionicons name="book-outline" size={16} color="#818cf8" />
              <Text style={s.scienceLabel}>Kinesiology</Text>
            </View>
            <Text style={s.scienceText}>{currentExercise.scienceNote}</Text>
          </View>
        )}

        {/* Set progression buttons */}
        {!allSetsComplete && !resting && (
          <TouchableOpacity style={s.setBtn} onPress={handleCompleteSet}>
            <Ionicons name="checkmark-circle" size={22} color="#000" />
            <Text style={s.setBtnText}>
              Complete Set {currentCompletedSets + 1}
            </Text>
          </TouchableOpacity>
        )}

        {/* Next exercise / Complete workout */}
        {allSetsComplete && (
          <TouchableOpacity
            style={s.nextBtn}
            onPress={isLastExercise ? handleCompleteWorkout : handleNextExercise}
          >
            <Text style={s.nextBtnText}>
              {isLastExercise ? 'Complete Workout' : 'Next Exercise'}
            </Text>
            <Ionicons
              name={isLastExercise ? 'checkmark' : 'arrow-forward'}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        )}

        {/* Spacer for bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatPill({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={s.statPill}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[s.statPillText, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Video
  videoContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  backBtnContainer: {
    position: 'absolute',
    top: 0,
    left: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCounter: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  exerciseCounterText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '700',
  },
  // Panel
  panel: {
    flex: 1,
  },
  panelContent: {
    padding: 20,
  },
  exerciseHeader: {
    marginBottom: 20,
  },
  warmupBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#422006',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  warmupBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 1,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Timer
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  timerRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: 5,
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99,102,241,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 2,
  },
  skipBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  skipBtnText: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '600',
  },
  // Science
  scienceCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scienceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
  },
  scienceText: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 20,
  },
  // Buttons
  setBtn: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  setBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  nextBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
});
