import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Doctor, Slot, Booking } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { useAppRouter } from '@/navigation/Stack';
import { SlotPicker } from '@/screens/consultation/SlotPicker';
import { useAppDispatch, useTheme } from '@/redux/hooks';
import { addBooking, addOfflineBooking } from '@/redux/slices/bookingSlice';
import { useToast } from '@/components/common/Toast';
import { ArrowLeft, User, Building, CheckCircle } from 'lucide-react-native';

export function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useTheme().isDark;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const router = useAppRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDoctorProfile() {
      if (!id) return;
      setIsLoadingDoctor(true);

      try {
        const res = await axios.get(API_ROUTES.DOCTOR_BY_ID(id), { timeout: 4000 });
        if (isMounted && res.data?.data) {
          setDoctor(res.data.data);
        }
      } catch (err) {
        console.warn('API fetch error for Doctor details:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDoctor(false);
        }
      }
    }

    loadDoctorProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadDoctorSlots() {
      if (!id) return;
      setIsLoadingSlots(true);

      try {
        const res = await axios.get(API_ROUTES.DOCTOR_SLOTS(id), { params: { date: selectedDate }, timeout: 4000 });
        if (isMounted && res.data?.data) {
          setSlots(res.data.data);
        }
      } catch (err) {
        console.warn('API fetch error for Doctor slots:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadDoctorSlots();

    return () => {
      isMounted = false;
    };
  }, [id, selectedDate]);

  if (isLoadingDoctor || !doctor) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      showToast('Please select an available time slot', 'warning');
      return;
    }

    try {
      const res = await axios.post(
        API_ROUTES.BOOKINGS,
        {
          doctorId: doctor.id,
          slotId: selectedSlot.id,
          dateStr: selectedDate,
          slotTime: selectedSlot.time,
        },
        { timeout: 4000 }
      );

      const newBooking: Booking = res.data.data;
      const formattedBooking: Booking = {
        ...newBooking,
        status: (newBooking.status as Booking['status']) || 'Confirmed',
      };

      dispatch(addBooking(formattedBooking));
      showToast('Consultation Slot Booked Successfully! 🎉', 'success');
      router.bookingSuccess();
    } catch {
      const offlineBooking: Booking = {
        id: `offline_bk_${Date.now()}`,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorFee: doctor.consultationFee,
        slotId: selectedSlot.id,
        slotTime: selectedSlot.time,
        slotDate: selectedDate,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        isOfflineQueued: true,
      };

      dispatch(addOfflineBooking(offlineBooking));
      showToast('Booking saved offline. Will auto-sync when online.', 'info');
      router.bookingSuccess();
    }
  };

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      style={{ paddingTop: Math.max(insets.top, 16) }}>
      <View className={`flex-row items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity onPress={router.goBack} className="flex-row items-center gap-1.5 py-1">
          <ArrowLeft size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
          <Text className={`text-base font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Back</Text>
        </TouchableOpacity>
        <Text className={`text-lg font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Doctor Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        <View className={`items-center border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <View className="w-20 h-20 rounded-full bg-emerald-500/10 items-center justify-center mb-3">
            <User size={40} color="#10B981" />
          </View>
          <Text className={`text-xl font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{doctor.name}</Text>
          <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.degree}</Text>
          <Text className="text-sm font-bold text-emerald-600 mt-1">{doctor.specialty}</Text>

          <View className="flex-row items-center justify-around w-full mt-5 pt-4 border-t border-slate-200/50">
            <View className="items-center">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{doctor.experienceYears}+ Yrs</Text>
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Experience</Text>
            </View>
            <View className="w-px h-7 bg-slate-200" />
            <View className="items-center">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{doctor.rating} ★</Text>
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.reviewCount} Reviews</Text>
            </View>
            <View className="w-px h-7 bg-slate-200" />
            <View className="items-center">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{doctor.consultationFee}</Text>
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fee</Text>
            </View>
          </View>
        </View>

        <View className={`border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className={`text-base font-extrabold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>About Doctor</Text>
          <Text className={`text-xs leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.bio}</Text>
          <View className="flex-row items-center gap-1.5 mt-3">
            <Building size={14} color="#64748B" />
            <Text className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{doctor.hospital}</Text>
          </View>
        </View>

        <View className={`border rounded-3xl p-5 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          {isLoadingSlots ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <SlotPicker
              slots={slots}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={setSelectedSlot}
            />
          )}
        </View>
      </ScrollView>

      <View className={`flex-row justify-between items-center px-5 py-4 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <View>
          <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Consultation Fee</Text>
          <Text className={`text-xl font-black mt-0.5 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{doctor.consultationFee}</Text>
        </View>
        <TouchableOpacity
          className="bg-emerald-600 px-6 py-3.5 rounded-2xl flex-row items-center gap-2"
          activeOpacity={0.8}
          onPress={handleConfirmBooking}>
          <CheckCircle size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-extrabold">Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
