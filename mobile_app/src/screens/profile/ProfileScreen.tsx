import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppRouter } from '@/navigation/Stack';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { toggleWishlist, addToCart } from '@/redux/slices/cartSlice';
import { updateBookingStatus } from '@/redux/slices/bookingSlice';
import { Booking, Product } from '@/utils/APiCalls';
import { useToast } from '@/components/common/Toast';
import {
  User,
  Calendar,
  Heart,
  Settings,
  Sun,
  Moon,
  Clock,
  Trash2,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Bell,
  Activity,
  XCircle,
} from 'lucide-react-native';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const router = useAppRouter();

  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'options'>('bookings');

  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const bookings = useAppSelector((state) => state.booking.bookings);

  const handleRemoveFromWishlist = (product: Product) => {
    dispatch(toggleWishlist(product));
    showToast('Removed from Wishlist', 'info');
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    showToast(`Added ${product.title} to Cart!`, 'success');
  };

  const handleCancelBooking = (bookingId: string) => {
    dispatch(updateBookingStatus({ id: bookingId, status: 'Cancelled' }));
    showToast('Consultation Appointment Cancelled', 'info');
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View
      className={`border rounded-3xl p-4 mb-3.5 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {item.doctorName}
          </Text>
          <Text className="text-xs font-semibold text-blue-500 mt-0.5">
            {item.doctorSpecialty}
          </Text>
        </View>
        <View
          className={`px-2.5 py-1 rounded-xl ${
            item.status === 'Confirmed'
              ? 'bg-emerald-500/15'
              : item.status === 'Pending'
              ? 'bg-amber-500/15'
              : 'bg-red-500/15'
          }`}>
          <Text
            className={`text-[11px] font-extrabold uppercase ${
              item.status === 'Confirmed'
                ? 'text-emerald-600'
                : item.status === 'Pending'
                ? 'text-amber-600'
                : 'text-red-600'
            }`}>
            {item.status}
          </Text>
        </View>
      </View>

      <View className="mt-3 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#64748B" />
          <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Date: {item.slotDate}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={13} color="#64748B" />
          <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Time: {item.slotTime}
          </Text>
        </View>
        <Text className={`text-sm font-extrabold mt-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
          Fee Paid: ₹{item.doctorFee}
        </Text>
      </View>

      {item.status === 'Confirmed' && (
        <TouchableOpacity
          className="mt-3 py-2 rounded-xl bg-red-500/10 items-center flex-row justify-center gap-1"
          onPress={() => handleCancelBooking(item.id)}
          activeOpacity={0.8}>
          <XCircle size={14} color="#EF4444" />
          <Text className="text-red-500 text-xs font-bold">Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderWishlistItem = ({ item }: { item: Product }) => (
    <View
      className={`flex-row items-center border rounded-3xl p-3.5 mb-3 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
      <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 items-center justify-center mr-3">
        <Text className="text-3xl">🌿</Text>
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">
          {item.category}
        </Text>
        <Text className={`text-sm font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-sm font-black text-emerald-500 mt-0.5">₹{item.price}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="bg-emerald-600 px-3 py-2 rounded-xl flex-row items-center gap-1"
          onPress={() => handleAddToCart(item)}
          activeOpacity={0.8}>
          <ShoppingCart size={14} color="#FFFFFF" />
          <Text className="text-white text-xs font-bold">Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="p-2 rounded-xl bg-red-500/10"
          onPress={() => handleRemoveFromWishlist(item)}
          activeOpacity={0.8}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      style={{ paddingTop: Math.max(insets.top, 16) }}>
      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View
          className={`border rounded-3xl p-5 mb-5 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center shadow-md">
              <User size={32} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className={`text-xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                Aarav Sharma
              </Text>
              <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                +91 98765 43210 • aarav.sharma@amrutam.co
              </Text>
              <View className="bg-emerald-500/15 px-2.5 py-1 rounded-lg self-start mt-2 flex-row items-center gap-1">
                <Activity size={12} color="#059669" />
                <Text className="color-emerald-600 text-[11px] font-black">
                  Pitta-Kapha Prakriti
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-around w-full mt-5 pt-4 border-t border-slate-200/50">
            <TouchableOpacity onPress={() => setActiveTab('bookings')} className="items-center">
              <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {bookings.length}
              </Text>
              <Text className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Bookings
              </Text>
            </TouchableOpacity>

            <View className="w-px h-7 bg-slate-200" />

            <TouchableOpacity onPress={() => setActiveTab('wishlist')} className="items-center">
              <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {wishlist.length}
              </Text>
              <Text className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Wishlist
              </Text>
            </TouchableOpacity>

            <View className="w-px h-7 bg-slate-200" />

            <TouchableOpacity onPress={router.cart} className="items-center">
              <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                Cart
              </Text>
              <Text className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                View Items
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View
          className={`flex-row p-1.5 rounded-2xl mb-5 border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200/60 border-slate-200'
          }`}>
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 ${
              activeTab === 'bookings' ? 'bg-blue-600 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('bookings')}
            activeOpacity={0.8}>
            <Calendar size={15} color={activeTab === 'bookings' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
            <Text
              className={`text-xs font-black ${
                activeTab === 'bookings' ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
              Bookings ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 ${
              activeTab === 'wishlist' ? 'bg-emerald-600 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('wishlist')}
            activeOpacity={0.8}>
            <Heart size={15} color={activeTab === 'wishlist' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
            <Text
              className={`text-xs font-black ${
                activeTab === 'wishlist' ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
              Wishlist ({wishlist.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 ${
              activeTab === 'options' ? 'bg-purple-600 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('options')}
            activeOpacity={0.8}>
            <Settings size={15} color={activeTab === 'options' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
            <Text
              className={`text-xs font-black ${
                activeTab === 'options' ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
              Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content 1: Bookings */}
        {activeTab === 'bookings' && (
          <View>
            <Text className={`text-base font-extrabold mb-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Booked Consultations
            </Text>
            {bookings.length === 0 ? (
              <View className={`border rounded-3xl p-6 items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Calendar size={40} color="#94A3B8" />
                <Text className={`text-base font-bold mt-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  No Consultations Booked
                </Text>
                <Text className={`text-xs text-center mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Book a video slot with top 5,000+ Ayurvedic Vaidyas.
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 px-5 py-2.5 rounded-xl"
                  onPress={router.consultation}
                  activeOpacity={0.8}>
                  <Text className="text-white text-xs font-extrabold">Explore Doctors</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={renderBookingItem}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {/* Tab Content 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <View>
            <Text className={`text-base font-extrabold mb-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Saved Wishlist Formulations
            </Text>
            {wishlist.length === 0 ? (
              <View className={`border rounded-3xl p-6 items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Heart size={40} color="#94A3B8" />
                <Text className={`text-base font-bold mt-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Your Wishlist is Empty
                </Text>
                <Text className={`text-xs text-center mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Save your favorite Ayurvedic oils, churnas, and health malts.
                </Text>
                <TouchableOpacity
                  className="bg-emerald-600 px-5 py-2.5 rounded-xl"
                  onPress={router.shop}
                  activeOpacity={0.8}>
                  <Text className="text-white text-xs font-extrabold">Explore Shop</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={wishlist}
                keyExtractor={(item) => item.id}
                renderItem={renderWishlistItem}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {/* Tab Content 3: Account Options List */}
        {activeTab === 'options' && (
          <View className={`border rounded-3xl p-4 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <Text className={`text-base font-extrabold mb-3 px-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Account Settings & Preferences
            </Text>

            <TouchableOpacity
              onPress={toggleTheme}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-amber-500/10 items-center justify-center">
                  {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
                </View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Prakriti Health Assessment coming soon', 'info')}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <Activity size={18} color="#10B981" />
                </View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  My Prakriti Health Profile
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Consultation notifications enabled', 'success')}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-blue-500/10 items-center justify-center">
                  <Bell size={18} color="#3B82F6" />
                </View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Reminders & Notifications
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Amrutam Privacy & Terms verified', 'info')}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-purple-500/10 items-center justify-center">
                  <ShieldCheck size={18} color="#8B5CF6" />
                </View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Privacy & Data Protection
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Support team: support@amrutam.co', 'info')}
              className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-teal-500/10 items-center justify-center">
                  <HelpCircle size={18} color="#14B8A6" />
                </View>
                <Text className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Help & Vaidya Support
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Logged out', 'info')}
              className="flex-row items-center justify-between p-3.5 rounded-2xl mt-1 border border-red-500/20 bg-red-500/5">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-red-500/10 items-center justify-center">
                  <LogOut size={18} color="#EF4444" />
                </View>
                <Text className="text-sm font-extrabold text-red-500">
                  Log Out
                </Text>
              </View>
              <ChevronRight size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
