import { useAppRouter } from '@/navigation/Stack';
import { Storage } from '@/services/storageService';
import {
  ArrowRight,
  ChevronRight,
  FolderPlus,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HighlightItem {
  icon: string;
  label: string;
  sublabel: string;
}

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: HighlightItem[];
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide_1',
    icon: <Stethoscope size={34} color="#10B981" />,
    badge: 'AYURVEDIC CONSULTATIONS',
    title: 'Consult Senior\nAyurvedic Vaidyas',
    subtitle: '1-on-1 Video & Voice Calls',
    description: 'Connect with certified Ayurvedic specialists for personalized Nadi Pariksha analysis and customized treatment plans.',
    highlights: [
      { icon: '👨‍⚕️', label: '500+ Vaidyas', sublabel: 'Verified Doctors' },
      { icon: '⏱️', label: '15 Min Slots', sublabel: 'Instant Booking' },
      { icon: '⭐', label: '4.9/5 Rating', sublabel: 'Patient Care' },
    ],
  },
  {
    id: 'slide_2',
    icon: <ShoppingBag size={34} color="#10B981" />,
    badge: '100% PURE FORMULATIONS',
    title: 'Authentic Herbal\nMalts & Oils',
    subtitle: 'Direct From Amrutam Store',
    description: 'Explore 50+ organic hair care oils, Nari Sondarya malts, Kumkumadi face elixirs, and digestive churnas.',
    highlights: [
      { icon: '🌿', label: '100% Organic', sublabel: 'Pure Ingredients' },
      { icon: '📦', label: '50+ Formulations', sublabel: 'Malts & Churnas' },
      { icon: '🚚', label: 'Free Delivery', sublabel: 'Doorstep Shipping' },
    ],
  },
  {
    id: 'slide_3',
    icon: <FolderPlus size={34} color="#10B981" />,
    badge: 'HEALTH TIMELINE',
    title: 'Digital Records &\nHealth History',
    subtitle: 'Secure Medical Vault',
    description: 'Track your lab reports, prescriptions, doctor notes, and wellness progress in one organized timeline.',
    highlights: [
      { icon: '📑', label: 'Prescriptions', sublabel: 'Auto Digital Notes' },
      { icon: '🧬', label: 'Nadi Pariksha', sublabel: 'Dosha Reports' },
      { icon: '🔒', label: 'Secure Vault', sublabel: 'Encrypted Data' },
    ],
  },
  {
    id: 'slide_4',
    icon: <ShieldCheck size={34} color="#10B981" />,
    badge: 'OFFLINE SYNC & SUPPORT',
    title: 'Seamless Access &\nInstant Support',
    subtitle: '24/7 Vaidya Assistance',
    description: 'Access your appointments, cart, and health data offline with MMKV persistence and instant push updates.',
    highlights: [
      { icon: '⚡', label: 'MMKV Local', sublabel: 'Zero Data Loss' },
      { icon: '📱', label: 'Offline Access', sublabel: 'Works Unconnected' },
      { icon: '🔔', label: 'Push Reminders', sublabel: 'Live Notifications' },
    ],
  },
];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useAppRouter();
  const [activeStep, setActiveStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleComplete = () => {
    Storage.setItem('hasCompletedOnboarding', true);
    router.consultation();
  };

  const handleNext = () => {
    if (activeStep < ONBOARDING_SLIDES.length - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      scrollViewRef.current?.scrollTo({ x: nextStep * SCREEN_WIDTH, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeStep && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setActiveStep(index);
    }
  };

  const isLastSlide = activeStep === ONBOARDING_SLIDES.length - 1;

  return (
    <View
      className="flex-1 bg-[#F9FBF8]"
      style={{
        paddingTop: Math.max(insets.top + 28, 40),
        paddingBottom: Math.max(insets.bottom, 16),
      }}>
      {/* Top Header Bar */}
      <View className="flex-row justify-between items-center px-6 py-1">
        <View className="flex-row items-center gap-1.5 bg-[#EAF2E8] px-3 py-1 rounded-full border border-[#CDE0CB]">
          <View className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <Text className="text-[#2D5A27] text-xs font-black tracking-widest uppercase">
            Step {activeStep + 1} of {ONBOARDING_SLIDES.length}
          </Text>
        </View>

        <TouchableOpacity onPress={handleComplete} activeOpacity={0.7} className="py-1 px-3">
          <Text className="text-[#3A643B] text-sm font-black tracking-wide">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Brand Logo Header — Properly Proportioned & Fully Visible */}
      <View className="items-center mt-4 mb-2">
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 220, height: 95 }}
          resizeMode="contain"
        />
      </View>

      {/* Horizontal Swipeable Slides Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1">
        {ONBOARDING_SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 px-6 justify-start pt-8 items-center">
            {/* Feature Icon Card — Neat 80x80 Box */}
            <View className="w-20 h-20 rounded-2xl bg-[#EAF2E8] justify-center items-center mb-3 border border-[#CDE0CB] shadow-sm">
              {slide.icon}
            </View>

            {/* Badge Pill */}
            <View className="bg-[#EAF2E8] px-4 py-1.5 rounded-full mb-3 border border-[#CDE0CB]">
              <Text className="text-[#2D5A27] text-xs font-black tracking-wider uppercase">
                {slide.badge}
              </Text>
            </View>

            {/* Title & Subtitle — Enlarged Headings */}
            <Text className="text-[#1A3817] text-3xl font-black text-center leading-9 mb-1.5 mt-0.5">
              {slide.title}
            </Text>
            <Text className="text-[#3A643B] text-sm font-extrabold text-center mb-3 tracking-wide uppercase">
              {slide.subtitle}
            </Text>

            <View className="flex-row items-center gap-1.5 mb-3">
              <View className="w-10 h-[1.5px] bg-[#3A643B]/30" />
              <Text className="text-sm">🌿</Text>
              <View className="w-10 h-[1.5px] bg-[#3A643B]/30" />
            </View>

            {/* Description — Enlarged Body Text */}
            <Text className="text-[#3D523B] text-sm text-center leading-6 px-3 font-bold max-w-[340px]">
              {slide.description}
            </Text>

            {/* Slide Feature Highlights Card (Enlarged Fonts & Icons) */}
            <View className="w-full bg-[#EAF2E8]/80 border border-[#CDE0CB] rounded-2xl p-4 mt-6 flex-row justify-around items-center shadow-sm">
              {slide.highlights.map((h, i) => (
                <React.Fragment key={i}>
                  <View className="items-center px-1 flex-1">
                    <Text className="text-2xl mb-1">{h.icon}</Text>
                    <Text className="text-[#2D5A27] text-xs font-black text-center">{h.label}</Text>
                    <Text className="text-[#3A643B] text-[10.5px] font-extrabold text-center mt-0.5">{h.sublabel}</Text>
                  </View>
                  {i < slide.highlights.length - 1 && (
                    <View className="w-[1px] h-10 bg-[#CDE0CB]" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Footer: Full Width Action Button */}
      <View className="px-6 pt-0 mb-4">
        {/* Full-width Action Button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            style={{ height: 56, borderRadius: 28 }}
            className="w-full bg-[#3A643B] flex-row justify-center items-center gap-2.5 shadow-lg shadow-[#3A643B]/30 active:opacity-90"
            onPress={handleNext}
            activeOpacity={0.85}>
            <Text className="text-white text-lg font-black tracking-wide">
              {isLastSlide ? 'Get Started' : 'Next Step'}
            </Text>
            {isLastSlide ? (
              <ArrowRight size={20} color="#FFFFFF" />
            ) : (
              <ChevronRight size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Pagination Dots Indicator — Centered Below Action Button */}
        <View className="flex-row justify-center items-center gap-2">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <View
              key={idx}
              className={`rounded-full transition-all ${
                idx === activeStep
                  ? 'w-8 h-2 bg-[#3A643B]'
                  : 'w-2 h-2 bg-[#CBD5E1]'
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
