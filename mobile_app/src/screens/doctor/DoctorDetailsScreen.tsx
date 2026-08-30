import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Doctor, Slot, Booking } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { useAppRouter } from '@/navigation/Stack';
import { SlotPicker } from '@/screens/consultation/SlotPicker';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { addBooking, addOfflineBooking } from '@/redux/slices/bookingSlice';
import { useToast } from '@/components/common/Toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { triggerBookingNotification } from '@/services/notificationService';
import { ArrowLeft, User, Building, CheckCircle, AlertCircle } from 'lucide-react-native';

export function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useTheme().isDark;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const router = useAppRouter();

  const auth = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.booking);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDoctorProfile() {
      if (!id) return;
      setIsLoadingDoctor(true);

      try {
        const res = await axios.get(API_ROUTES.DOCTOR_BY_ID(id), { timeout: 5000 });
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
        const res = await axios.get(API_ROUTES.DOCTOR_SLOTS(id), {
          params: {
            date: selectedDate,
            patientId: auth.user?.id || '',
            patientEmail: auth.user?.email || '',
          },
          timeout: 5000,
        });
        if (isMounted && res.data?.data) {
          setSlots(Array.isArray(res.data.data) ? res.data.data : []);
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
  }, [id, selectedDate, auth.user?.id, auth.user?.email]);

  const handleSelectSlot = useCallback((slot: Slot) => {
    setSelectedSlot(slot);
    setIsBookingSuccess(false);
  }, []);

  if (isLoadingDoctor || !doctor) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const fullName = doctor.name?.toLowerCase().startsWith('dr.')
    ? doctor.name
    : `Dr. ${doctor.name || 'Ayurvedic Vaidya'}`;

  const executeBooking = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    const patient = auth.user;
    const guestUniqueId = `usr_guest_${Date.now()}`;

    try {
      const res = await axios.post(
        API_ROUTES.BOOKINGS,
        {
          doctorId: doctor.id,
          slotId: selectedSlot.id,
          dateStr: selectedDate,
          slotTime: selectedSlot.time,
          patientId: patient?.id || guestUniqueId,
          patientName: patient?.name || 'Guest Patient',
          patientEmail: patient?.email || `guest_${Date.now()}@amrutam.com`,
          patientPhone: patient?.phone || '+91 9876543210',
        },
        { timeout: 5000 }
      );

      const newBooking: Booking = res.data.data;
      const formattedBooking: Booking = {
        ...newBooking,
        doctorId: doctor.id || (doctor as any)._id || newBooking.doctorId,
        patientId: patient?.id || newBooking.patientId,
        patientEmail: patient?.email || newBooking.patientEmail,
        doctorName: fullName,
        status: (newBooking.status as Booking['status']) || 'Confirmed',
      };

      dispatch(addBooking(formattedBooking));
      setIsBookingSuccess(true);
      showToast('Consultation Slot Booked Successfully! 🎉', 'success');

      // Trigger Native Push Notification on Device
      triggerBookingNotification(fullName, selectedDate, selectedSlot.time);

      setTimeout(() => {
        router.bookingSuccess();
      }, 800);
    } catch {
      const offlineBooking: Booking = {
        id: `offline_bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        doctorId: doctor.id || (doctor as any)._id,
        doctorName: fullName,
        doctorSpecialty: doctor.specialty || 'General Medicine',
        doctorFee: doctor.consultationFee || 500,
        patientId: patient?.id || guestUniqueId,
        patientName: patient?.name || 'Guest Patient',
        patientEmail: patient?.email || `guest_${Date.now()}@amrutam.com`,
        patientPhone: patient?.phone || '+91 9876543210',
        slotId: selectedSlot.id,
        slotTime: selectedSlot.time,
        slotDate: selectedDate,
        createdAt: new Date().toISOString(),
        status: 'Confirmed',
        isOfflineQueued: true,
      };

      dispatch(addOfflineBooking(offlineBooking));
      setIsBookingSuccess(true);
      showToast('Booking saved offline. Will auto-sync when online. 📶', 'info');

      // Trigger Native Push Notification on Device
      triggerBookingNotification(fullName, selectedDate, selectedSlot.time);

      setTimeout(() => {
        router.bookingSuccess();
      }, 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      showToast('Please select an available time slot', 'warning');
      return;
    }

    if (selectedSlot.isBooked) {
      showToast('This slot is already booked. Please pick another time.', 'error');
      return;
    }

    // Double Booking Prevention Check
    const existingBooking = bookings.find(
      (b) =>
        (b.doctorId === doctor?.id || (doctor as any)?._id === b.doctorId) &&
        b.slotDate === selectedDate &&
        b.slotTime === selectedSlot.time &&
        b.status !== 'Cancelled'
    );

    if (existingBooking) {
      showToast(
        `Double Booking Prevented ⚠️: You already have a confirmed slot on ${selectedDate} at ${selectedSlot.time}`,
        'warning'
      );
      return;
    }

    if (!auth.isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    executeBooking();
  };

  const isSlotBooked = Boolean(selectedSlot?.isBooked);

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

      <ScrollView className="p-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className={`items-center border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Image
            source={{
              uri:
                (doctor as any).imageUrl ||
                [
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1594824813566-78a9c464b73b?w=300&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
                ][(doctor.id || '').length % 6],
            }}
            className="w-24 h-24 rounded-full border-4 border-emerald-500/30 mb-3 bg-slate-200 dark:bg-slate-700"
            resizeMode="cover"
          />
          <Text className={`text-xl font-black text-center ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{fullName}</Text>
          <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.degree || 'BAMS'}</Text>
          <Text className="text-sm font-bold text-emerald-600 mt-1">{doctor.specialty || 'General Medicine'}</Text>

          <View className="flex-row items-center justify-around w-full mt-5 pt-4 border-t border-slate-200/50">
            <View className="items-center">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{doctor.experienceYears ?? 5}+ Yrs</Text>
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Experience</Text>
            </View>
            <View className="w-px h-7 bg-slate-200" />
            <View className="items-center">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{doctor.rating ?? 4.8} ★</Text>
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.reviewCount ?? 100} Reviews</Text>
            </View>
            <View className="w-px h-7 bg-slate-200" />
            <View className="items-center">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{doctor.consultationFee ?? 500}</Text>
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fee</Text>
            </View>
          </View>
        </View>

        <View className={`border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className={`text-base font-extrabold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>About Doctor</Text>
          <Text className={`text-xs leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.bio || 'Experienced Ayurvedic Vaidya specializing in root-cause healing.'}</Text>
          <View className="flex-row items-center gap-1.5 mt-3">
            <Building size={14} color="#64748B" />
            <Text className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{doctor.hospital || 'Amrutam Ayurvedic Clinic'}</Text>
          </View>
        </View>

        <View className={`border rounded-3xl p-5 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          {isLoadingSlots ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <>
              <SlotPicker
                slots={slots}
                selectedSlotId={selectedSlot?.id || null}
                onSelectSlot={handleSelectSlot}
              />

              {selectedSlot && (
                <View className="mt-3 pt-3 border-t border-slate-700/30 flex-row items-center justify-between">
                  <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isSlotBooked ? 'Selected Slot:' : 'Selected Time Slot:'}
                  </Text>
                  <View
                    className={`px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 shadow-sm ${
                      isSlotBooked ? 'bg-red-500/20 border border-red-500/40' : 'bg-emerald-600'
                    }`}>
                    {isSlotBooked ? (
                      <AlertCircle size={13} color="#EF4444" />
                    ) : (
                      <CheckCircle size={13} color="#FFFFFF" />
                    )}
                    <Text className={`text-xs font-black ${isSlotBooked ? 'text-red-500' : 'text-white'}`}>
                      {selectedSlot.time} {isSlotBooked ? '(Booked)' : ''}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Booking Confirmation Action Bar */}
      <View className={`flex-row justify-between items-center px-5 py-4 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <View>
          <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isSlotBooked ? 'Slot Availability' : 'Total Consultation Fee'}
          </Text>
          <Text className={`text-xl font-black mt-0.5 ${isSlotBooked ? 'text-red-500' : isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {isSlotBooked ? 'Already Booked' : `₹${doctor.consultationFee ?? 500}`}
          </Text>
        </View>

        <TouchableOpacity
          disabled={isSlotBooked || isSubmitting || isBookingSuccess}
          className={`px-6 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-lg ${
            isBookingSuccess
              ? 'bg-emerald-700 shadow-emerald-700/40'
              : isSlotBooked
              ? 'bg-slate-500 opacity-50'
              : 'bg-emerald-600 shadow-emerald-600/30'
          }`}
          activeOpacity={0.8}
          onPress={handleConfirmBooking}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : isBookingSuccess ? (
            <>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text className="text-white text-sm font-black">Booked! 🎉</Text>
            </>
          ) : isSlotBooked ? (
            <>
              <AlertCircle size={16} color="#FFFFFF" />
              <Text className="text-white text-sm font-extrabold">Booked</Text>
            </>
          ) : (
            <>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text className="text-white text-sm font-extrabold">Confirm Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={executeBooking}
      />
    </View>
  );
}
