import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';
import { Tag, Sparkles, Gift, ArrowRight, Clock } from 'lucide-react-native';
import { useToast } from '@/components/common/Toast';
import { useTheme } from '@/redux/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Leave margin on left and right

export interface OfferBanner {
  id: string;
  badgeText: string;
  title: string;
  subtitle: string;
  code: string;
  gradientBg: string;
  accentColor: string;
  iconType: 'sparkles' | 'gift' | 'percent';
}

const TOP_5_OFFERS: OfferBanner[] = [
  {
    id: 'offer_1',
    badgeText: 'FLAT 25% OFF',
    title: 'Panchakarma & Hair Care Kits',
    subtitle: '100% Pure Herbal Hair & Body Formulations',
    code: 'AMRUTAM25',
    gradientBg: '#047857', // Emerald
    accentColor: '#34D399',
    iconType: 'sparkles',
  },
  {
    id: 'offer_2',
    badgeText: 'BUY 1 GET 1 FREE',
    title: 'Nari Sondarya Malt Special',
    subtitle: 'Women Holistic Health & Vitality Elixir',
    code: 'BOGOAMRUTAM',
    gradientBg: '#BE123C', // Rose
    accentColor: '#FB7185',
    iconType: 'gift',
  },
  {
    id: 'offer_3',
    badgeText: 'FREE CONSULTATION',
    title: 'Free Doctor Call on ₹999+',
    subtitle: 'Get 1-on-1 Nadi Pariksha with Senior Vaidya',
    code: 'FREEDOC',
    gradientBg: '#1D4ED8', // Royal Blue
    accentColor: '#60A5FA',
    iconType: 'percent',
  },
  {
    id: 'offer_4',
    badgeText: 'FLAT ₹300 CASHBACK',
    title: 'Ayurvedic Wellness Oils',
    subtitle: 'Kuntal Care & Bhringraj Scalp Oils',
    code: 'AYUR300',
    gradientBg: '#6D28D9', // Deep Violet
    accentColor: '#C084FC',
    iconType: 'sparkles',
  },
  {
    id: 'offer_5',
    badgeText: 'SUPER SAVER 40%',
    title: 'Digestive & Metabolic Churnas',
    subtitle: 'Root-Cause Gut Balance Formulations',
    code: 'SAVER40',
    gradientBg: '#C2410C', // Amber Orange
    accentColor: '#FDBA74',
    iconType: 'gift',
  },
];

interface Props {
  onClaimOffer?: (offer: OfferBanner) => void;
}

export function OffersCarousel({ onClaimOffer }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % TOP_5_OFFERS.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (CARD_WIDTH + 12),
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + 12));
    if (index !== activeIndex && index >= 0 && index < TOP_5_OFFERS.length) {
      setActiveIndex(index);
    }
  };

  const handleCopyCode = (code: string) => {
    showToast(`Coupon Code '${code}' Copied! 🎟️`, 'success');
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Sparkles size={16} color="#10B981" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Top 5 Exclusive Offers
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#94A3B8' : '#475569' }]}>
              Auto-swiping special discounts & coupons
            </Text>
          </View>
        </View>

        {/* Live Active Index Counter */}
        <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.12)' }]}>
          <Text style={styles.countText}>{activeIndex + 1}/5</Text>
        </View>
      </View>

      {/* Horizontal Swipeable Cards List */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        {TOP_5_OFFERS.map((offer) => (
          <TouchableOpacity
            key={offer.id}
            activeOpacity={0.9}
            onPress={() => onClaimOffer?.(offer)}
            style={[styles.card, { backgroundColor: offer.gradientBg }]}>
            {/* Top Badge & Discount Icon */}
            <View style={styles.cardHeader}>
              <View style={[styles.discountBadge, { borderColor: offer.accentColor }]}>
                <Tag size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.discountBadgeText}>{offer.badgeText}</Text>
              </View>

              <View style={styles.timeTag}>
                <Clock size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.timeTagText}>Limited Offer</Text>
              </View>
            </View>

            {/* Offer Title & Description */}
            <Text style={styles.offerTitle} numberOfLines={1}>
              {offer.title}
            </Text>
            <Text style={styles.offerSubtitle} numberOfLines={1}>
              {offer.subtitle}
            </Text>

            {/* Bottom Actions: Coupon Code & Claim Button */}
            <View style={styles.cardFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCopyCode(offer.code)}
                style={styles.couponBox}>
                <Gift size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.couponText}>Code: {offer.code}</Text>
              </TouchableOpacity>

              <View style={styles.claimBtn}>
                <Text style={styles.claimBtnText}>Claim</Text>
                <ArrowRight size={12} color="#0F172A" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Indicator Dots */}
      <View style={styles.dotsContainer}>
        {TOP_5_OFFERS.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  timeTagText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '700',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  offerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  couponText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  claimBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#10B981',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
});
