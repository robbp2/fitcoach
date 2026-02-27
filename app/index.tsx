import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../lib/types';
import { generateProgramAsync, saveProgram, loadProgram } from '../lib/program-engine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PhysiqueGoal = UserProfile['physiqueGoal'];
type ExperienceLevel = UserProfile['experienceLevel'];
type DaysPerWeek = UserProfile['daysPerWeek'];
type Equipment = UserProfile['equipment'];

export default function IntakeSurvey() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Profile state
  const [goal, setGoal] = useState<PhysiqueGoal>('hypertrophy');
  const [experience, setExperience] = useState<ExperienceLevel>('intermediate');
  const [days, setDays] = useState<DaysPerWeek>(6);
  const [equipment, setEquipment] = useState<Equipment>('full-gym');
  const [hasKahuna, setHasKahuna] = useState(false);
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<'male' | 'female'>('male');

  // Check for existing program on mount
  useEffect(() => {
    (async () => {
      const existing = await loadProgram();
      if (existing) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const animateTransition = (next: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const profile: UserProfile = {
        physiqueGoal: goal,
        experienceLevel: experience,
        daysPerWeek: days,
        equipment,
        hasKahuna: equipment === 'home-gym' ? hasKahuna : undefined,
        age,
        biologicalSex: sex,
        injuries: [],
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('fitcoach_profile', JSON.stringify(profile));
      const program = await generateProgramAsync(profile);
      await saveProgram(program);
      router.replace('/dashboard');
    } catch (e) {
      console.error('Failed to generate program:', e);
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = 6;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={s.progressBar}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                s.progressDot,
                i <= step && s.progressDotActive,
              ]}
            />
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {step === 0 && (
            <StepGoal value={goal} onChange={setGoal} />
          )}
          {step === 1 && (
            <StepExperience value={experience} onChange={setExperience} />
          )}
          {step === 2 && (
            <StepDays value={days} onChange={setDays} />
          )}
          {step === 3 && (
            <StepEquipment
              value={equipment}
              onChange={setEquipment}
              hasKahuna={hasKahuna}
              onKahunaChange={setHasKahuna}
            />
          )}
          {step === 4 && (
            <StepPersonal
              age={age}
              onAgeChange={setAge}
              sex={sex}
              onSexChange={setSex}
            />
          )}
          {step === 5 && (
            <StepSummary
              goal={goal}
              experience={experience}
              days={days}
              equipment={equipment}
              hasKahuna={hasKahuna}
              age={age}
              sex={sex}
              generating={generating}
              onGenerate={handleGenerate}
            />
          )}
        </Animated.View>

        {/* Navigation buttons */}
        <View style={s.navRow}>
          {step > 0 && (
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => animateTransition(step - 1)}
            >
              <Ionicons name="arrow-back" size={20} color="#a1a1aa" />
              <Text style={s.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < totalSteps - 1 && (
            <TouchableOpacity
              style={s.nextBtn}
              onPress={() => animateTransition(step + 1)}
            >
              <Text style={s.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepGoal({ value, onChange }: { value: PhysiqueGoal; onChange: (v: PhysiqueGoal) => void }) {
  const options: { key: PhysiqueGoal; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'hypertrophy', label: 'Hypertrophy', desc: 'Maximum muscle growth', icon: 'barbell-outline' },
    { key: 'strength', label: 'Strength', desc: 'Peak force production', icon: 'flash-outline' },
    { key: 'metabolic', label: 'Metabolic', desc: 'Fat loss & conditioning', icon: 'flame-outline' },
    { key: 'athletic', label: 'Athletic', desc: 'Power & performance', icon: 'fitness-outline' },
  ];

  return (
    <View>
      <Text style={s.stepTitle}>What's your primary goal?</Text>
      <Text style={s.stepSubtitle}>This determines your rep ranges, rest periods, and volume</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[s.card, value === opt.key && s.cardSelected]}
          onPress={() => onChange(opt.key)}
        >
          <Ionicons
            name={opt.icon}
            size={28}
            color={value === opt.key ? '#10b981' : '#71717a'}
          />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={[s.cardTitle, value === opt.key && s.cardTitleSelected]}>
              {opt.label}
            </Text>
            <Text style={s.cardDesc}>{opt.desc}</Text>
          </View>
          {value === opt.key && (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StepExperience({ value, onChange }: { value: ExperienceLevel; onChange: (v: ExperienceLevel) => void }) {
  const options: { key: ExperienceLevel; label: string; desc: string }[] = [
    { key: 'beginner', label: 'Beginner', desc: 'Less than 1 year of consistent training' },
    { key: 'intermediate', label: 'Intermediate', desc: '1-3 years of structured programming' },
    { key: 'advanced', label: 'Advanced', desc: '3+ years, approaching genetic potential' },
  ];

  return (
    <View>
      <Text style={s.stepTitle}>Experience Level</Text>
      <Text style={s.stepSubtitle}>Determines exercise complexity and volume tolerance</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[s.card, value === opt.key && s.cardSelected]}
          onPress={() => onChange(opt.key)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[s.cardTitle, value === opt.key && s.cardTitleSelected]}>
              {opt.label}
            </Text>
            <Text style={s.cardDesc}>{opt.desc}</Text>
          </View>
          {value === opt.key && (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StepDays({ value, onChange }: { value: DaysPerWeek; onChange: (v: DaysPerWeek) => void }) {
  const options: { key: DaysPerWeek; label: string }[] = [
    { key: 5, label: '5' },
    { key: 6, label: '6' },
    { key: 7, label: '7' },
  ];

  return (
    <View>
      <Text style={s.stepTitle}>Training Frequency</Text>
      <Text style={s.stepSubtitle}>How many days per week can you train?</Text>
      <View style={s.daysRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[s.dayCard, value === opt.key && s.dayCardSelected]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[s.dayNumber, value === opt.key && s.dayNumberSelected]}>
              {opt.label}
            </Text>
            <Text style={[s.dayLabel, value === opt.key && s.dayLabelSelected]}>
              days/wk
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepEquipment({
  value,
  onChange,
  hasKahuna,
  onKahunaChange,
}: {
  value: Equipment;
  onChange: (v: Equipment) => void;
  hasKahuna: boolean;
  onKahunaChange: (v: boolean) => void;
}) {
  const options: { key: Equipment; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'full-gym', label: 'Full Gym', desc: 'Commercial gym with all equipment', icon: 'business-outline' },
    { key: 'home-gym', label: 'Home Gym', desc: 'Barbell, dumbbells, bench', icon: 'home-outline' },
    { key: 'bodyweight', label: 'Bodyweight', desc: 'No equipment needed', icon: 'body-outline' },
  ];

  return (
    <View>
      <Text style={s.stepTitle}>Equipment Access</Text>
      <Text style={s.stepSubtitle}>Filters exercises to match your setup</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[s.card, value === opt.key && s.cardSelected]}
          onPress={() => onChange(opt.key)}
        >
          <Ionicons
            name={opt.icon}
            size={28}
            color={value === opt.key ? '#10b981' : '#71717a'}
          />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={[s.cardTitle, value === opt.key && s.cardTitleSelected]}>
              {opt.label}
            </Text>
            <Text style={s.cardDesc}>{opt.desc}</Text>
          </View>
          {value === opt.key && (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          )}
        </TouchableOpacity>
      ))}
      {value === 'home-gym' && (
        <TouchableOpacity
          style={[s.kahunaCard, hasKahuna && s.kahunaCardActive]}
          onPress={() => onKahunaChange(!hasKahuna)}
        >
          <View style={s.kahunaToggle}>
            <View style={[s.toggleTrack, hasKahuna && s.toggleTrackActive]}>
              <View style={[s.toggleThumb, hasKahuna && s.toggleThumbActive]} />
            </View>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.kahunaLabel}>Kahuna System</Text>
            <Text style={s.kahunaDesc}>Smith machine + 3 cable systems + pec fly</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StepPersonal({
  age,
  onAgeChange,
  sex,
  onSexChange,
}: {
  age: number;
  onAgeChange: (v: number) => void;
  sex: 'male' | 'female';
  onSexChange: (v: 'male' | 'female') => void;
}) {
  return (
    <View>
      <Text style={s.stepTitle}>Personal Details</Text>
      <Text style={s.stepSubtitle}>Used for exercise selection optimization</Text>

      {/* Age spinner */}
      <View style={s.ageContainer}>
        <Text style={s.ageLabel}>Age</Text>
        <View style={s.ageSpinner}>
          <TouchableOpacity
            style={s.ageBtn}
            onPress={() => onAgeChange(Math.max(14, age - 1))}
          >
            <Ionicons name="remove" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.ageValue}>{age}</Text>
          <TouchableOpacity
            style={s.ageBtn}
            onPress={() => onAgeChange(Math.min(80, age + 1))}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sex toggle */}
      <View style={s.sexContainer}>
        <Text style={s.ageLabel}>Biological Sex</Text>
        <View style={s.sexRow}>
          <TouchableOpacity
            style={[s.sexBtn, sex === 'male' && s.sexBtnActive]}
            onPress={() => onSexChange('male')}
          >
            <Text style={[s.sexBtnText, sex === 'male' && s.sexBtnTextActive]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.sexBtn, sex === 'female' && s.sexBtnActive]}
            onPress={() => onSexChange('female')}
          >
            <Text style={[s.sexBtnText, sex === 'female' && s.sexBtnTextActive]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function StepSummary({
  goal,
  experience,
  days,
  equipment,
  hasKahuna,
  age,
  sex,
  generating,
  onGenerate,
}: {
  goal: PhysiqueGoal;
  experience: ExperienceLevel;
  days: DaysPerWeek;
  equipment: Equipment;
  hasKahuna: boolean;
  age: number;
  sex: string;
  generating: boolean;
  onGenerate: () => void;
}) {
  const rows = [
    { label: 'Goal', value: goal.charAt(0).toUpperCase() + goal.slice(1) },
    { label: 'Experience', value: experience.charAt(0).toUpperCase() + experience.slice(1) },
    { label: 'Frequency', value: `${days} days/week` },
    { label: 'Equipment', value: equipment === 'full-gym' ? 'Full Gym' : equipment === 'home-gym' ? `Home Gym${hasKahuna ? ' + Kahuna' : ''}` : 'Bodyweight' },
    { label: 'Age', value: `${age}` },
    { label: 'Sex', value: sex.charAt(0).toUpperCase() + sex.slice(1) },
  ];

  return (
    <View>
      <Text style={s.stepTitle}>Your Profile</Text>
      <Text style={s.stepSubtitle}>Review your selections</Text>

      <View style={s.summaryCard}>
        {rows.map((row, i) => (
          <View key={row.label} style={[s.summaryRow, i < rows.length - 1 && s.summaryRowBorder]}>
            <Text style={s.summaryLabel}>{row.label}</Text>
            <Text style={s.summaryValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[s.generateBtn, generating && { opacity: 0.6 }]}
        onPress={onGenerate}
        disabled={generating}
      >
        {generating ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Ionicons name="flash" size={20} color="#000" />
            <Text style={s.generateBtnText}>Generate My Program</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    flexGrow: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27272a',
  },
  progressDotActive: {
    backgroundColor: '#6366f1',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#a1a1aa',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#0a0f0d',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  cardTitleSelected: {
    color: '#34d399',
  },
  cardDesc: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dayCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
  },
  dayCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#0a0f0d',
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#71717a',
  },
  dayNumberSelected: {
    color: '#34d399',
  },
  dayLabel: {
    fontSize: 13,
    color: '#52525b',
    marginTop: 4,
  },
  dayLabelSelected: {
    color: '#10b981',
  },
  kahunaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  kahunaCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#0a0a10',
  },
  kahunaToggle: {
    justifyContent: 'center',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3f3f46',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#6366f1',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#a1a1aa',
  },
  toggleThumbActive: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  kahunaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  kahunaDesc: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  ageContainer: {
    marginBottom: 28,
  },
  ageLabel: {
    fontSize: 15,
    color: '#a1a1aa',
    marginBottom: 12,
    fontWeight: '600',
  },
  ageSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  ageBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    minWidth: 80,
    textAlign: 'center',
  },
  sexContainer: {
    marginBottom: 16,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sexBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  sexBtnActive: {
    borderColor: '#6366f1',
    backgroundColor: '#0a0a10',
  },
  sexBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#71717a',
  },
  sexBtnTextActive: {
    color: '#818cf8',
  },
  summaryCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#71717a',
  },
  summaryValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
  generateBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 15,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
