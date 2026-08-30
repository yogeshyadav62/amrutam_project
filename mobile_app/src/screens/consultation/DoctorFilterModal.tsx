import React from 'react';
import { Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';
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
  onClose: () => void;
}

export function DoctorFilterModal({ visible, filters, onApply, onClose }: Props) {
  const { isDark } = useTheme();

  const safeFilters: DoctorFilterOptions = filters || {
    searchQuery: '',
    specialty: 'All',
    minExperience: 0,
    maxFee: 5000,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className={`rounded-t-3xl p-6 max-h-[80%] ${isDark ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-800/40">
            <Text className={`text-xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Filter Doctors</Text>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-xl bg-slate-800/40">
              <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
            <Text className={`text-xs font-bold uppercase tracking-wider mt-2 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Specialty</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {SPECIALTIES.map((spec) => {
                const isSelected = safeFilters.specialty === spec;
                return (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => onApply({ specialty: spec })}
                    className={`py-2 px-3.5 rounded-2xl border ${
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
                      {spec}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className={`text-xs font-bold uppercase tracking-wider mt-3 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Minimum Experience</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {[0, 5, 10, 15].map((exp) => {
                const isSelected = safeFilters.minExperience === exp;
                return (
                  <TouchableOpacity
                    key={exp}
                    onPress={() => onApply({ minExperience: exp })}
                    className={`py-2 px-3.5 rounded-2xl border ${
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
                      {exp === 0 ? 'Any' : `${exp}+ Years`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className={`text-xs font-bold uppercase tracking-wider mt-3 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Max Consultation Fee</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {[500, 800, 1200, 2000, 5000].map((fee) => {
                const isSelected = safeFilters.maxFee === fee;
                return (
                  <TouchableOpacity
                    key={fee}
                    onPress={() => onApply({ maxFee: fee })}
                    className={`py-2 px-3.5 rounded-2xl border ${
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
                      Under ₹{fee}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-lg shadow-emerald-600/30 mt-2" onPress={onClose} activeOpacity={0.8}>
            <Text className="text-white text-xs font-black uppercase tracking-wider">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
