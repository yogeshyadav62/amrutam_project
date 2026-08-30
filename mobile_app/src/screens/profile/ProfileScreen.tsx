import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { toggleWishlist, addToCart, removeFromCart, updateQuantity, clearCart } from '@/redux/slices/cartSlice';
import { logout } from '@/redux/slices/authSlice';
import { resetBookings, updateBookingStatus, setBookings } from '@/redux/slices/bookingSlice';
import { Booking, Product } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { useAppRouter } from '@/navigation/Stack';
import { Storage } from '@/services/storageService';
import { useToast } from '@/components/common/Toast';
import { AuthModal } from '@/components/auth/AuthModal';
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
  RotateCcw,
  XCircle,
  LogIn,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react-native';

const DUMMY_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1608248597262-838d4150b074?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608248597249-14a58eb70df6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&auto=format&fit=crop&q=80',
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const router = useAppRouter();

  const auth = useAppSelector((state) => state.auth);
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const cart = useAppSelector((state) => state.cart.cart);
  const { bookings: reduxBookings } = useAppSelector((state) => state.booking);

  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'cart'>('bookings');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const patientBookings = reduxBookings;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    async function fetchPatientBookings() {
      if (!auth.isAuthenticated || !auth.user?.id) {
        dispatch(resetBookings());
        return;
      }
      setIsLoadingBookings(true);
      try {
        const res = await axios.get(API_ROUTES.BOOKINGS, {
          params: { patientId: auth.user.id },
          timeout: 5000,
        });
        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const userList: Booking[] = list.filter(
          (b: any) =>
            b.patientId === auth.user?.id ||
            (auth.user?.email && b.patientEmail === auth.user.email)
        );
        dispatch(setBookings({ userId: auth.user.id, bookings: userList }));
      } catch (err) {
        console.warn('API fetch error for patient bookings:', err);
      } finally {
        setIsLoadingBookings(false);
      }
    }
    fetchPatientBookings();
  }, [auth.isAuthenticated, auth.user?.id, auth.user?.email, dispatch]);

  const handleRemoveFromWishlist = (product: Product) => {
    dispatch(toggleWishlist(product));
    showToast('Removed from Wishlist', 'info');
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    showToast(`Added ${product.title} to Cart!`, 'success');
  };

  const handleUpdateQty = (productId: string, newQty: number) => {
    dispatch(updateQuantity({ productId, quantity: newQty }));
  };

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
    showToast('Item removed from Cart', 'info');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    showToast('Cart cleared', 'info');
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.post(API_ROUTES.CANCEL_BOOKING(bookingId), {}, { timeout: 4000 });
      dispatch(updateBookingStatus({ id: bookingId, status: 'Cancelled' }));
      showToast('Consultation Appointment Cancelled', 'info');
    } catch {
      showToast('Failed to cancel appointment', 'warning');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetBookings());
    dispatch(clearCart());
    showToast('Logged out successfully', 'info');
  };

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
            <View className="w-16 h-16 rounded-full bg-emerald-600 items-center justify-center shadow-md">
              <User size={32} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className={`text-xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {auth.isAuthenticated ? auth.user?.name : 'Guest Patient'}
              </Text>
              <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {auth.isAuthenticated
                  ? `${auth.user?.phone || ''} • ${auth.user?.email || ''}`
                  : 'Sign in to book & manage doctor consultations'}
              </Text>
              {auth.isAuthenticated ? (
                <View className="bg-emerald-500/15 px-2.5 py-1 rounded-lg self-start mt-2 flex-row items-center gap-1">
                  <Activity size={12} color="#059669" />
                  <Text className="color-emerald-600 text-[11px] font-black">
                    Verified Amrutam Patient
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsAuthModalOpen(true)}
                  className="bg-emerald-600 px-4 py-1.5 rounded-xl self-start mt-2.5 flex-row items-center gap-1.5">
                  <LogIn size={13} color="#FFFFFF" />
                  <Text className="text-white text-xs font-black">Sign In / Register</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center justify-around w-full mt-5 pt-4 border-t border-slate-200/50">
            <TouchableOpacity onPress={() => setActiveTab('bookings')} className="items-center">
              <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {patientBookings.length}
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

            <TouchableOpacity onPress={() => setActiveTab('cart')} className="items-center">
              <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {totalCartCount}
              </Text>
              <Text className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                My Cart
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher — using StyleSheet to avoid NativeWind/expo-router context conflict */}
        <View style={[tabStyles.switcher, { backgroundColor: isDark ? '#1E293B' : 'rgba(226,232,240,0.6)', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>

          {/* Bookings Tab */}
          <TouchableOpacity
            style={[tabStyles.tabBtn, activeTab === 'bookings' && tabStyles.tabBtnActive]}
            onPress={() => setActiveTab('bookings')}
            activeOpacity={0.8}>
            <Calendar size={15} color={activeTab === 'bookings' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[tabStyles.tabLabel, { color: activeTab === 'bookings' ? '#FFFFFF' : isDark ? '#CBD5E1' : '#374151' }]}>
              Bookings
            </Text>
            {patientBookings.length > 0 && (
              <View style={[tabStyles.badge, { backgroundColor: activeTab === 'bookings' ? 'rgba(255,255,255,0.3)' : '#10B981' }]}>
                <Text style={tabStyles.badgeText}>{patientBookings.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Wishlist Tab */}
          <TouchableOpacity
            style={[tabStyles.tabBtn, activeTab === 'wishlist' && tabStyles.tabBtnActive]}
            onPress={() => setActiveTab('wishlist')}
            activeOpacity={0.8}>
            <Heart size={15} color={activeTab === 'wishlist' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[tabStyles.tabLabel, { color: activeTab === 'wishlist' ? '#FFFFFF' : isDark ? '#CBD5E1' : '#374151' }]}>
              Wishlist
            </Text>
            {wishlist.length > 0 && (
              <View style={[tabStyles.badge, { backgroundColor: activeTab === 'wishlist' ? 'rgba(255,255,255,0.3)' : '#F43F5E' }]}>
                <Text style={tabStyles.badgeText}>{wishlist.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* My Cart Tab (Replaced Setting place) */}
          <TouchableOpacity
            style={[tabStyles.tabBtn, activeTab === 'cart' && tabStyles.tabBtnActive]}
            onPress={() => setActiveTab('cart')}
            activeOpacity={0.8}>
            <ShoppingCart size={15} color={activeTab === 'cart' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[tabStyles.tabLabel, { color: activeTab === 'cart' ? '#FFFFFF' : isDark ? '#CBD5E1' : '#374151' }]}>
              My Cart
            </Text>
            {totalCartCount > 0 && (
              <View style={[tabStyles.badge, { backgroundColor: activeTab === 'cart' ? 'rgba(255,255,255,0.3)' : '#F59E0B' }]}>
                <Text style={tabStyles.badgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <View className="mb-6">
            <Text className={`text-base font-extrabold mb-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Booked Consultations
            </Text>
            {!auth.isAuthenticated ? (
              <View className={`border rounded-3xl p-6 items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Calendar size={40} color="#94A3B8" />
                <Text className={`text-base font-bold mt-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Sign In to View Appointments
                </Text>
                <Text className={`text-xs text-center mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Logged-in patients can track consultation slots and status live.
                </Text>
                <TouchableOpacity
                  className="bg-emerald-600 px-5 py-2.5 rounded-xl flex-row items-center gap-1.5"
                  onPress={() => setIsAuthModalOpen(true)}
                  activeOpacity={0.8}>
                  <LogIn size={15} color="#FFFFFF" />
                  <Text className="text-white text-xs font-extrabold">Sign In / Register</Text>
                </TouchableOpacity>
              </View>
            ) : isLoadingBookings ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : patientBookings.length === 0 ? (
              <View className={`border rounded-3xl p-6 items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Calendar size={40} color="#94A3B8" />
                <Text className={`text-base font-bold mt-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  No Consultations Booked Yet
                </Text>
                <Text className={`text-xs text-center mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Book a video slot with top Ayurvedic Vaidyas.
                </Text>
              </View>
            ) : (
              patientBookings.map((item) => (
                <View
                  key={item.id || item.createdAt}
                  className={`border rounded-3xl p-4 mb-3.5 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                        {item.doctorName}
                      </Text>
                      <Text className="text-xs font-semibold text-emerald-600 mt-0.5">
                        {item.doctorSpecialty}
                      </Text>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-xl ${
                        item.status === 'Confirmed' ? 'bg-emerald-500/15'
                          : item.status === 'Completed' ? 'bg-blue-500/15'
                          : 'bg-red-500/15'
                      }`}>
                      <Text
                        className={`text-[11px] font-extrabold uppercase ${
                          item.status === 'Confirmed' ? 'text-emerald-600'
                            : item.status === 'Completed' ? 'text-blue-600'
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
              ))
            )}
          </View>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <View className="mb-6">
            <Text className={`text-base font-extrabold mb-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              Saved Wishlist Formulations ({wishlist.length})
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
              </View>
            ) : (
              wishlist.map((item, idx) => {
                const imgUri =
                  (item as any).imageUrl ||
                  DUMMY_PRODUCT_IMAGES[((item.id || '').length + idx) % DUMMY_PRODUCT_IMAGES.length];
                return (
                  <View
                    key={item.id || `wish_idx_${idx}`}
                    className={`flex-row items-center border rounded-3xl p-3.5 mb-3 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                    <View className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 mr-3 border border-slate-200">
                      <Image source={{ uri: imgUri }} className="w-full h-full" resizeMode="cover" />
                    </View>

                    <View className="flex-1 mr-2">
                      <Text className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                        {(item as any).category || 'Herbal'}
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
              })
            )}
          </View>
        )}

        {/* Tab 3: My Cart (Replaced Settings Position) */}
        {activeTab === 'cart' && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                My Cart Items ({totalCartCount})
              </Text>
              {cart.length > 0 && (
                <TouchableOpacity onPress={handleClearCart} className="flex-row items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/10">
                  <Trash2 size={13} color="#EF4444" />
                  <Text className="text-red-500 text-xs font-bold">Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {cart.length === 0 ? (
              <View className={`border rounded-3xl p-6 items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <ShoppingCart size={44} color="#94A3B8" />
                <Text className={`text-base font-bold mt-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Your Cart is Empty
                </Text>
                <Text className={`text-xs text-center mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Add authentic Ayurvedic formulations, churnas, and malts from store.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {cart.map((cartItem, idx) => {
                  const product = cartItem.product;
                  const imgUri =
                    (product as any).imageUrl ||
                    DUMMY_PRODUCT_IMAGES[((product.id || '').length + idx) % DUMMY_PRODUCT_IMAGES.length];
                  return (
                    <View
                      key={product.id || `cart_item_${idx}`}
                      className={`border rounded-3xl p-4 ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                      <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 mr-3 border border-slate-200">
                          <Image source={{ uri: imgUri }} className="w-full h-full" resizeMode="cover" />
                        </View>

                        <View className="flex-1 mr-2">
                          <Text className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                            {product.category || 'Ayurvedic'}
                          </Text>
                          <Text className={`text-sm font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={1}>
                            {product.title}
                          </Text>
                          <Text className="text-xs font-bold text-slate-500 mt-0.5">
                            Unit Price: ₹{product.price}
                          </Text>
                        </View>

                        <TouchableOpacity
                          className="p-2 rounded-xl bg-red-500/10 self-start"
                          onPress={() => handleRemoveFromCart(product.id)}
                          activeOpacity={0.8}>
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      {/* Quantity & Subtotal Row */}
                      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-700/40">
                        <View className={`flex-row items-center border rounded-2xl px-2 py-1 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                          <TouchableOpacity
                            onPress={() => handleUpdateQty(product.id, cartItem.quantity - 1)}
                            className="p-1.5 rounded-lg bg-emerald-600/10">
                            <Minus size={14} color="#10B981" />
                          </TouchableOpacity>
                          <Text className={`px-3 text-xs font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {cartItem.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleUpdateQty(product.id, cartItem.quantity + 1)}
                            className="p-1.5 rounded-lg bg-emerald-600">
                            <Plus size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>

                        <Text className="text-base font-black text-emerald-500">
                          ₹{product.price * cartItem.quantity}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {/* Cart Order Summary */}
                <View className={`border rounded-3xl p-5 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <Text className={`text-base font-extrabold mb-3 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                    Order Payment Summary
                  </Text>

                  <View className="flex-row justify-between mb-2">
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Items Total ({totalCartCount} items)</Text>
                    <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>₹{totalCartPrice}</Text>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ayurvedic Shipping</Text>
                    <Text className="text-xs font-bold text-emerald-500">FREE</Text>
                  </View>

                  <View className="flex-row justify-between pt-3 border-t border-slate-200 dark:border-slate-700 mt-1">
                    <Text className={`text-sm font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Total Payable</Text>
                    <Text className="text-lg font-black text-emerald-500">₹{totalCartPrice}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => showToast('Order placement initialized!', 'success')}
                    className="bg-emerald-600 py-3.5 rounded-2xl items-center mt-4 shadow-lg shadow-emerald-600/30 flex-row justify-center gap-2">
                    <CheckCircle2 size={18} color="#FFFFFF" />
                    <Text className="text-white text-xs font-black uppercase tracking-wider">
                      Proceed to Checkout (₹{totalCartPrice})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Collapsible Account Settings Section */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => setShowSettings((prev) => !prev)}
            className={`flex-row items-center justify-between p-4 rounded-3xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-amber-500/10 items-center justify-center">
                <Settings size={20} color="#F59E0B" />
              </View>
              <View>
                <Text className={`text-sm font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Account Settings & Preferences
                </Text>
                <Text className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Theme, Notifications, Support & Logout
                </Text>
              </View>
            </View>
            <ChevronRight
              size={18}
              color="#94A3B8"
              style={{ transform: [{ rotate: showSettings ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {showSettings && (
            <View className={`border rounded-3xl p-4 mt-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
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
                onPress={() => showToast('Consultation reminders active', 'success')}
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
                onPress={() => showToast('Amrutam Privacy Policy verified', 'info')}
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
                onPress={() => showToast('Support Email: support@amrutam.co', 'info')}
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

              {/* Reset & Launch Onboarding Tutorial Button */}
              <TouchableOpacity
                onPress={() => {
                  Storage.setItem('hasCompletedOnboarding', false);
                  showToast('Onboarding reset! Redirecting to tutorial slides...', 'info');
                  setTimeout(() => {
                    router.onboarding();
                  }, 400);
                }}
                className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-2 border ${
                  isDark ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-emerald-50 border-emerald-200'
                }`}>
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-xl bg-emerald-500/20 items-center justify-center">
                    <RotateCcw size={18} color="#10B981" />
                  </View>
                  <View>
                    <Text className={`text-sm font-extrabold ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                      Reset & View Onboarding Screen
                    </Text>
                    <Text className={`text-[10px] font-semibold ${isDark ? 'text-emerald-400/80' : 'text-emerald-600'}`}>
                      Clear onboarding status & replay intro slides
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#10B981" />
              </TouchableOpacity>

              {auth.isAuthenticated ? (
                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-row items-center justify-between p-3.5 rounded-2xl mt-1 border border-red-500/20 bg-red-500/5">
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl bg-red-500/10 items-center justify-center">
                      <LogOut size={18} color="#EF4444" />
                    </View>
                    <Text className="text-sm font-extrabold text-red-500">
                      Log Out ({auth.user?.name})
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#EF4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsAuthModalOpen(true)}
                  className="flex-row items-center justify-between p-3.5 rounded-2xl mt-1 border border-emerald-500/20 bg-emerald-500/5">
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center">
                      <LogIn size={18} color="#10B981" />
                    </View>
                    <Text className="text-sm font-extrabold text-emerald-500">
                      Sign In / Register Account
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

      </ScrollView>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#10B981',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
