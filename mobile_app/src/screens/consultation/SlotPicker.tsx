import React from 'react';
import { Text, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Slot } from '@/utils/APiCalls';
import { Clock } from 'lucide-react-native';

interface Props {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: Slot) => void;
}

export function SlotPicker({ slots, selectedSlotId, onSelectSlot }: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View className="my-2">
      <View className="flex-row items-center gap-1.5 mb-3">
        <Clock size={16} color="#3B82F6" />
        <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
          Select Consultation Time Slot
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isDisabled = slot.isBooked || slot.isExpired;

          return (
            <TouchableOpacity
              key={slot.id}
              disabled={isDisabled}
              onPress={() => onSelectSlot(slot)}
              className={`w-[30%] py-3 px-2 rounded-2xl border items-center justify-center ${
                isDisabled
                  ? isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-100 border-slate-200'
                  : isSelected
                  ? 'bg-blue-600 border-blue-600'
                  : isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}>
              <Text
                className={`text-xs font-extrabold ${
                  isDisabled
                    ? isDark
                      ? 'text-slate-600'
                      : 'text-slate-400'
                    : isSelected
                    ? 'text-white'
                    : isDark
                    ? 'text-slate-50'
                    : 'text-slate-900'
                }`}>
                {slot.time}
              </Text>

              {slot.isBooked && (
                <Text className="text-[9px] font-black uppercase text-red-500 mt-0.5">Booked</Text>
              )}
              {slot.isExpired && (
                <Text className="text-[9px] font-black uppercase text-slate-400 mt-0.5">Expired</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
