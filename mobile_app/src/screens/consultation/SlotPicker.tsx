import React from 'react';
import { Text, View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Slot } from '@/utils/APiCalls';
import { Clock, Sun, Moon, Check, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/redux/hooks';

interface Props {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: Slot) => void;
  isLoading?: boolean;
}

export function SlotPicker({ slots, selectedSlotId, onSelectSlot, isLoading = false }: Props) {
  const { isDark } = useTheme();

  const safeSlots = Array.isArray(slots) ? slots : [];

  const morningSlots = safeSlots.filter(
    (s) => s && typeof s.time === 'string' && s.time.toLowerCase().includes('am')
  );
  const afternoonSlots = safeSlots.filter(
    (s) => s && typeof s.time === 'string' && s.time.toLowerCase().includes('pm')
  );
  const otherSlots = safeSlots.filter(
    (s) =>
      s &&
      typeof s.time === 'string' &&
      !s.time.toLowerCase().includes('am') &&
      !s.time.toLowerCase().includes('pm')
  );

  const renderSlotItem = (slot: Slot) => {
    if (!slot || !slot.id || !slot.time) return null;

    const isSelected = selectedSlotId === slot.id || selectedSlotId === slot.time;
    const isDisabled = Boolean(slot.isBooked || slot.isExpired);

    const slotBg = isDisabled
      ? isDark
        ? '#0F172A'
        : '#F1F5F9'
      : isSelected
      ? '#10B981' // Solid Emerald Green when selected
      : isDark
      ? '#064E3B' // Soft Dark Emerald button in Dark mode
      : '#F0FDF4'; // Soft Green button tint in Light mode

    const slotBorder = isDisabled
      ? isDark
        ? '#1E293B'
        : '#CBD5E1'
      : isSelected
      ? '#047857' // Deep Emerald Border when selected
      : isDark
      ? '#10B981'
      : '#34D399'; // Bright Green border

    const textColor = isDisabled
      ? isDark
        ? '#475569'
        : '#94A3B8'
      : isSelected
      ? '#FFFFFF' // Pure White text when selected
      : isDark
      ? '#A7F3D0'
      : '#047857'; // Dark Emerald text when unselected

    const iconColor = isDisabled
      ? '#94A3B8'
      : isSelected
      ? '#FFFFFF'
      : isDark
      ? '#A7F3D0'
      : '#10B981';

    return (
      <Pressable
        key={slot.id}
        disabled={isDisabled}
        onPress={() => onSelectSlot(slot)}
        style={({ pressed }) => [
          styles.slotButton,
          {
            backgroundColor: slotBg,
            borderColor: slotBorder,
            borderBottomWidth: isSelected ? 4 : 3,
            transform: [{ translateY: pressed ? 2 : 0 }],
            opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1,
            elevation: isSelected ? 6 : 2,
            shadowColor: isSelected ? '#10B981' : '#059669',
            shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
            shadowOpacity: isSelected ? 0.4 : 0.12,
            shadowRadius: 4,
          },
        ]}>
        <View style={styles.buttonContent}>
          <Clock size={12} color={iconColor} style={{ marginRight: 4 }} />
          <Text style={[styles.slotTimeText, { color: textColor }]}>
            {slot.time}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.checkBadge}>
            <Check size={9} color="#FFFFFF" />
          </View>
        )}

        {slot.isBooked && (
          <Text style={styles.bookedText}>Booked</Text>
        )}
        {slot.isExpired && (
          <Text style={styles.expiredText}>Expired</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ marginVertical: 2 }}>
      <View className="flex-row items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800/40">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center">
            <Clock size={16} color="#10B981" />
          </View>
          <View>
            <Text className={`text-base font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Select Consultation Time Slot
            </Text>
            <Text className={`text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              👇 Click any button below to pick time
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="py-6 items-center justify-center flex-row gap-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-3">
          <ActivityIndicator size="small" color="#10B981" />
          <Text className={`text-xs font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Fetching Live Vaidya Slots...
          </Text>
        </View>
      ) : safeSlots.length === 0 ? (
        <View className="py-4 items-center justify-center">
          <Text className={`text-xs font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No consultation slots configured for this doctor today.
          </Text>
        </View>
      ) : (
        <>
          {morningSlots.length > 0 && (
            <View className="mb-4">
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Sun size={14} color="#F59E0B" />
                <Text className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Morning Slots (AM)
                </Text>
              </View>

              <View style={styles.slotGrid}>
                {morningSlots.map(renderSlotItem)}
              </View>
            </View>
          )}

          {afternoonSlots.length > 0 && (
            <View className="mb-4">
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Moon size={14} color="#6366F1" />
                <Text className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Afternoon & Evening Slots (PM)
                </Text>
              </View>

              <View style={styles.slotGrid}>
                {afternoonSlots.map(renderSlotItem)}
              </View>
            </View>
          )}

          {otherSlots.length > 0 && (
            <View>
              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Sparkles size={14} color="#10B981" />
                <Text className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Available Time Slots
                </Text>
              </View>

              <View style={styles.slotGrid}>
                {otherSlots.map(renderSlotItem)}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotButton: {
    width: '31%',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 20, // Rounded Pill Button style
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTimeText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  bookedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#EF4444',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  expiredText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
