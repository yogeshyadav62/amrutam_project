import React from 'react';
import { Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
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

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className={`rounded-t-3xl p-6 max-h-[75%] ${isDark ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-slate-800/40">
            <Text className={`text-xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Filter & Sort Formulations
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-xl bg-slate-800/40">
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Categories
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      onSelectCategory(cat);
                    }}
                    activeOpacity={0.8}
                    className={`py-2 px-4 rounded-2xl border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-500'
                        : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sort By
            </Text>
            <View className="gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = selectedSort === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      onSelectSort(opt.value);
                    }}
                    activeOpacity={0.8}
                    className={`p-3.5 rounded-2xl border flex-row justify-between items-center ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500'
                        : isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-emerald-500 font-black'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}>
                      {opt.label}
                    </Text>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity
            className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-lg shadow-emerald-600/30 mt-2"
            onPress={onClose}
            activeOpacity={0.8}>
            <Text className="text-white text-xs font-black uppercase tracking-wider">Close & Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
