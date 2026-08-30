import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTheme } from '@/redux/hooks';

const CATEGORIES = ['All', 'Hair Care', 'Skin Care', 'Wellness Oils', 'Malts & Churnas', 'Digestive'];

type SortType = 'popularity' | 'rating' | 'price-low-high' | 'price-high-low';

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Rating (High to Low)', value: 'rating' },
  { label: 'Price (Low to High)', value: 'price-low-high' },
  { label: 'Price (High to Low)', value: 'price-high-low' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSort: SortType;
  onSelectSort: (sort: SortType) => void;
}

export function ProductFilterSheet({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
}: Props) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

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
        {/* Header */}
        <View style={[styles.headerRow, { borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Filter & Sort Products
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Categories
          </Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => onSelectCategory(cat)}
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
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sort Options */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Sort By
          </Text>
          <View style={{ gap: 8 }}>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = selectedSort === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => onSelectSort(opt.value)}
                  activeOpacity={0.8}
                  style={[
                    styles.sortItem,
                    {
                      backgroundColor: isSelected
                        ? isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5'
                        : isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isSelected
                        ? '#10B981'
                        : isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.sortText,
                      { color: isSelected ? '#10B981' : isDark ? '#F8FAFC' : '#0F172A' },
                    ]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Check size={16} color="#10B981" />}
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
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 12.5,
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
