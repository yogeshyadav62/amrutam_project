import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { X, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/redux/hooks';

const SPECIALTIES = [
  'All',
  'Kaya Chikitsa (General Medicine)',
  'Panchakarma Specialist',
  'Shalya Tantra (Surgery)',
  'Skin & Hair Wellness',
  'Digestive & Metabolic Disorders',
];

export interface DoctorFilterOptions {
  searchQuery: string;
  specialty: string;
  minExperience: number;
  maxFee: number;
}

interface Props {
  visible: boolean;
  filters: DoctorFilterOptions;
  onApply: (filters: Partial<DoctorFilterOptions>) => void;
  onReset: () => void;
  onClose: () => void;
}

export function DoctorFilterModal({ visible, filters, onApply, onReset, onClose }: Props) {
  const { isDark } = useTheme();

  if (!visible) return null;

  const safeFilters: DoctorFilterOptions = filters || {
    searchQuery: '',
    specialty: 'All',
    minExperience: 0,
    maxFee: 5000,
  };

  const hasActiveFilters =
    safeFilters.specialty !== 'All' ||
    safeFilters.minExperience > 0 ||
    safeFilters.maxFee < 5000 ||
    safeFilters.searchQuery.trim() !== '';

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderColor: isDark ? '#1E293B' : '#E2E8F0',
          },
        ]}>
        {/* Header Row */}
        <View style={[styles.headerRow, { borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Filter Doctors
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={onReset}
                style={styles.clearBtn}
                activeOpacity={0.8}>
                <RotateCcw size={12} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          {/* Specialty */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Specialty
          </Text>
          <View style={styles.chipGrid}>
            {SPECIALTIES.map((spec) => {
              const isSelected = safeFilters.specialty === spec;
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => onApply({ specialty: spec })}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? '#10B981'
                        : isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isSelected
                        ? '#059669'
                        : isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : isDark ? '#CBD5E1' : '#334155' },
                    ]}>
                    {spec}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Minimum Experience */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Minimum Experience
          </Text>
          <View style={styles.chipGrid}>
            {[0, 5, 10, 15].map((exp) => {
              const isSelected = safeFilters.minExperience === exp;
              return (
                <TouchableOpacity
                  key={exp}
                  onPress={() => onApply({ minExperience: exp })}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? '#10B981'
                        : isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isSelected
                        ? '#059669'
                        : isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : isDark ? '#CBD5E1' : '#334155' },
                    ]}>
                    {exp === 0 ? 'Any' : `${exp}+ Years`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Max Consultation Fee */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Max Consultation Fee
          </Text>
          <View style={styles.chipGrid}>
            {[500, 800, 1200, 2000, 5000].map((fee) => {
              const isSelected = safeFilters.maxFee === fee;
              return (
                <TouchableOpacity
                  key={fee}
                  onPress={() => onApply({ maxFee: fee })}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? '#10B981'
                        : isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isSelected
                        ? '#059669'
                        : isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : isDark ? '#CBD5E1' : '#334155' },
                    ]}>
                    Under ₹{fee}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Apply Action Button */}
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={onClose}
          activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    zIndex: 999999,
    elevation: 999999,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 22,
    maxHeight: '80%',
    zIndex: 1000000,
    elevation: 1000000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
