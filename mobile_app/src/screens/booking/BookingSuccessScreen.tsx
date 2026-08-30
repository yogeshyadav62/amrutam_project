import React, { useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAppRouter } from '@/navigation/Stack';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { fetchBookingsThunk, updateBookingStatus } from '@/redux/slices/bookingSlice';
import { Booking } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { useToast } from '@/components/common/Toast';
import { ArrowLeft, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react-native';

export function BookingSuccessScreen() {
  const isDark = useTheme().isDark;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const router = useAppRouter();

  const { bookings, isLoading } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchBookingsThunk());
  }, [dispatch]);

  const handleCancel = async (bookingId: string) => {
    try {
      await axios.post(API_ROUTES.CANCEL_BOOKING(bookingId), {}, { timeout: 4000 });
      dispatch(updateBookingStatus({ id: bookingId, status: 'Cancelled' }));
      showToast('Booking cancelled', 'info');
    } catch {
      showToast('Failed to cancel booking', 'error');
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
        <Text className={`text-lg font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>My Consultations</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        <View className="bg-emerald-600 rounded-3xl p-5 items-center mb-5 shadow-sm">
          <CheckCircle2 size={36} color="#FFFFFF" />
          <Text className="text-white text-xl font-extrabold mt-2">Upcoming Appointments</Text>
          <Text className="text-emerald-100 text-xs text-center mt-1">Manage your booked Vaidya consultation slots below.</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#10B981" className="mt-10" />
        ) : bookings.length === 0 ? (
          <View className="items-center py-10">
            <Calendar size={48} color="#94A3B8" />
            <Text className={`text-base font-bold my-4 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>No Bookings Found</Text>
            <TouchableOpacity
              className="bg-emerald-600 px-6 py-3 rounded-2xl"
              onPress={router.consultation}
              activeOpacity={0.8}>
              <Text className="text-white text-sm font-extrabold">Book a Doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((booking: Booking) => (
            <View
              key={booking.id}
              className={`border rounded-3xl p-4 mb-3.5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                    {booking.doctorName}
                  </Text>
                  <Text className="text-xs font-semibold text-emerald-600 mt-0.5">
                    {booking.doctorSpecialty}
                  </Text>
                </View>
                <View
                  className={`px-2.5 py-1 rounded-xl ${
                    booking.status === 'Confirmed'
                      ? 'bg-emerald-500/15'
                      : booking.status === 'Pending'
                      ? 'bg-amber-500/15'
                      : 'bg-red-500/15'
                  }`}>
                  <Text
                    className={`text-[11px] font-extrabold uppercase ${
                      booking.status === 'Confirmed'
                        ? 'text-emerald-600'
                        : booking.status === 'Pending'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                    {booking.status}
                  </Text>
                </View>
              </View>

              <View className="mt-3 gap-1">
                <View className="flex-row items-center gap-1.5">
                  <Calendar size={13} color="#64748B" />
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date: {booking.slotDate}</Text>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <Clock size={13} color="#64748B" />
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time: {booking.slotTime}</Text>
                </View>

                <Text className={`text-sm font-extrabold mt-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Fee Paid: ₹{booking.doctorFee}
                </Text>
              </View>

              {booking.status === 'Confirmed' && (
                <TouchableOpacity
                  className="mt-3.5 py-2 rounded-xl bg-red-500/10 items-center flex-row justify-center gap-1"
                  onPress={() => handleCancel(booking.id)}
                  activeOpacity={0.8}>
                  <XCircle size={14} color="#EF4444" />
                  <Text className="text-red-500 text-xs font-bold">Cancel Appointment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
