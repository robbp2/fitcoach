import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutProgram, WorkoutDay } from '../lib/types';
import {
  loadProgram,
  saveProgram,
  handleMissedDays,
  getPhaseName,
  getSplitScienceContext,
  getSplitName,
} from '../lib/program-engine';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const router = useRouter();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const p = await loadProgram();
      if (!p) {
        router.replace('/');
        return;
      }
      const updated = handleMissedDays(p);
      await saveProgram(updated);
      setProgram(updated);
      setLoading(false);
    })();
  }, []);

  // Pulsing dot animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleReset = () => {
    Alert.alert(
      'Reset Program',
      'This will delete your current program and start fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['fitcoach_program', 'fitcoach_profile']);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (loading || !program) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  const week = program.weeks[program.currentWeekIndex];
  const phaseName = getPhaseName(program);
  const scienceContext = getSplitScienceContext(program);
  const splitName = getSplitName(program);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.phaseLabel}>CURRENT PHASE</Text>
            <Text style={s.phaseName}>{phaseName}</Text>
            <Text style={s.splitName}>{splitName}</Text>
          </View>
          <TouchableOpacity style={s.resetBtn} onPress={handleReset}>
            <Ionicons name="pulse" size={22} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* Science context card */}
        <View style={s.scienceCard}>
          <View style={s.scienceHeader}>
            <Ionicons name="book-outline" size={18} color="#818cf8" />
            <Text style={s.scienceBadge}>Evidence Based</Text>
          </View>
          <Text style={s.scienceText}>{scienceContext}</Text>
        </View>

        {/* Weekly blueprint */}
        <Text style={s.blueprintTitle}>YOUR WEEKLY BLUEPRINT</Text>
        <Text style={s.weekLabel}>
          Week {program.currentWeekIndex + 1}
          {week?.isDeload ? ' — Deload' : ''}
        </Text>

        {week?.days.map((day, idx) => (
          <DayCard
            key={idx}
            day={day}
            dayName={DAY_NAMES[idx] ?? `Day ${idx + 1}`}
            isToday={idx === program.currentDayIndex}
            pulseAnim={pulseAnim}
            onStartWorkout={() => router.push('/workout')}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DayCard({
  day,
  dayName,
  isToday,
  pulseAnim,
  onStartWorkout,
}: {
  day: WorkoutDay;
  dayName: string;
  isToday: boolean;
  pulseAnim: Animated.Value;
  onStartWorkout: () => void;
}) {
  if (day.isRest) {
    return (
      <View style={[s.dayCard, s.dayCardRest]}>
        <View style={s.dayCardHeader}>
          <Text style={s.dayName}>{dayName}</Text>
          <Text style={s.restLabel}>Recovery</Text>
        </View>
        <Text style={s.restDesc}>Rest & recovery — sleep 7-9 hours, eat at maintenance or surplus.</Text>
      </View>
    );
  }

  return (
    <View style={[s.dayCard, isToday && s.dayCardToday]}>
      <View style={s.dayCardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
          {isToday && (
            <Animated.View
              style={[s.todayDot, { opacity: pulseAnim }]}
            />
          )}
          <Text style={[s.dayName, isToday && s.dayNameToday]}>{dayName}</Text>
        </View>
        {day.isDeload && (
          <View style={s.deloadBadge}>
            <Text style={s.deloadBadgeText}>DELOAD</Text>
          </View>
        )}
      </View>
      <Text style={s.dayTitle}>{day.name}</Text>
      <Text style={s.dayExerciseCount}>
        {day.exercises.length} exercises
        {day.warmup.length > 0 ? ` · ${day.warmup.length} warmup` : ''}
      </Text>
      {isToday && !day.isRest && (
        <TouchableOpacity style={s.startBtn} onPress={onStartWorkout}>
          <Text style={s.startBtnText}>Start Workout</Text>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </TouchableOpacity>
      )}
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
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 2,
    marginBottom: 4,
  },
  phaseName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  splitName: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 4,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  scienceCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  scienceBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scienceText: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 20,
  },
  blueprintTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#52525b',
    letterSpacing: 2,
    marginBottom: 4,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a1a1aa',
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  dayCardRest: {
    opacity: 0.5,
  },
  dayCardToday: {
    borderColor: '#6366f1',
    backgroundColor: '#0a0a12',
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  dayName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#52525b',
    letterSpacing: 1,
  },
  dayNameToday: {
    color: '#818cf8',
  },
  restLabel: {
    fontSize: 13,
    color: '#52525b',
    fontWeight: '600',
  },
  restDesc: {
    fontSize: 13,
    color: '#3f3f46',
    marginTop: 4,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  dayExerciseCount: {
    fontSize: 13,
    color: '#71717a',
  },
  deloadBadge: {
    backgroundColor: '#422006',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deloadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 1,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
});
