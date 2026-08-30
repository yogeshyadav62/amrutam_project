import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigateTo } from '@/navigation/Stack';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { updateQuantity, removeFromCart, clearCart } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/common/Toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, CheckCircle } from 'lucide-react-native';

export function CartScreen() {
  const isDark = useTheme().isDark;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart.cart);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal > 1000 ? Math.floor(subtotal * 0.1) : 0;
  const delivery = subtotal === 0 ? 0 : subtotal >= 750 ? 0 : 50;
  const grandTotal = subtotal - discount + delivery;

  const executeOrder = () => {
    const patientName = auth.user?.name || 'Patient';
    showToast(`Order Placed Successfully for ${patientName}! 🛒`, 'success');
    dispatch(clearCart());
    navigateTo.shop();
  };

  const handleCheckout = () => {
    if (!auth.isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    executeOrder();
  };

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      style={{ paddingTop: Math.max(insets.top, 16) }}>
      <View className={`flex-row items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity onPress={navigateTo.goBack} className="flex-row items-center gap-1.5 py-1">
          <ArrowLeft size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
          <Text className={`text-base font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Back</Text>
        </TouchableOpacity>
        <Text className={`text-lg font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>My Shopping Cart</Text>
        <TouchableOpacity onPress={() => dispatch(clearCart())}>
          <Text className="text-red-500 text-xs font-bold">Clear</Text>
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <ShoppingBag size={64} color="#94A3B8" />
          <Text className={`text-xl font-black mt-4 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Your Cart is Empty</Text>
          <Text className={`text-xs text-center mt-1.5 mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Explore authentic Ayurvedic formulations.
          </Text>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-2xl"
            onPress={navigateTo.shop}
            activeOpacity={0.8}>
            <Text className="text-white text-sm font-extrabold">Explore Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View
                key={item.product.id}
                className={`border rounded-3xl p-4 mb-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <Text className="text-2xl">🌿</Text>
                  </View>

                  <View className="flex-1">
                    <Text className={`text-base font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={1}>
                      {item.product.title}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.product.size} • ₹{item.product.price}
                    </Text>
                    <Text className="text-base font-black text-emerald-500 mt-0.5">
                      ₹{item.product.price * item.quantity}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => dispatch(removeFromCart(item.product.id))} className="p-1">
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-slate-200/40">
                  <Text className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quantity:</Text>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity - 1 }))}
                      className={`w-7 h-7 rounded-lg border justify-center items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <Minus size={12} color={isDark ? '#F8FAFC' : '#0F172A'} />
                    </TouchableOpacity>

                    <Text className={`text-sm font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity + 1 }))}
                      className={`w-7 h-7 rounded-lg border justify-center items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <Plus size={12} color={isDark ? '#F8FAFC' : '#0F172A'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View className={`border rounded-3xl p-5 mt-2 mb-8 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <Text className={`text-base font-extrabold mb-3.5 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Order Bill Summary</Text>

              <View className="flex-row justify-between mb-2.5">
                <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Item Subtotal</Text>
                <Text className={`text-xs font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{subtotal}</Text>
              </View>

              {discount > 0 && (
                <View className="flex-row justify-between mb-2.5">
                  <Text className="text-xs text-emerald-500 font-semibold">Special Discount (10%)</Text>
                  <Text className="text-xs font-bold text-emerald-500">- ₹{discount}</Text>
                </View>
              )}

              <View className="flex-row justify-between mb-2.5">
                <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Delivery Charges</Text>
                <Text className={`text-xs font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </Text>
              </View>

              <View className={`h-px my-2.5 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />

              <View className="flex-row justify-between items-center">
                <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Grand Total</Text>
                <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{grandTotal}</Text>
              </View>
            </View>
          </ScrollView>

          <View className={`flex-row justify-between items-center px-5 py-4 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <View>
              <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>To Pay</Text>
              <Text className={`text-xl font-black mt-0.5 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{grandTotal}</Text>
            </View>

            <TouchableOpacity
              className="bg-emerald-600 px-6 py-3.5 rounded-2xl flex-row items-center gap-2"
              activeOpacity={0.8}
              onPress={handleCheckout}>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text className="text-white text-sm font-extrabold">Place Order Now</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={executeOrder}
      />
    </View>
  );
}
