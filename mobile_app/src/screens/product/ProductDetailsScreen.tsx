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
import { Product } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { navigateTo } from '@/navigation/Stack';
import { useAppDispatch, useTheme } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/common/Toast';
import { ArrowLeft, ShoppingBag, ShoppingCart, Sparkles, Plus, Minus, Check } from 'lucide-react-native';

export function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useTheme().isDark;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Direct Component API Fetcher with async/await and try-catch
  useEffect(() => {
    let isMounted = true;

    async function loadProductDetails() {
      if (!id) return;
      setIsLoading(true);

      try {
        const res = await axios.get(API_ROUTES.PRODUCT_BY_ID(id), { timeout: 4000 });
        if (isMounted && res.data?.data) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.warn('API fetch error for Product details:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProductDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading || !product) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    showToast(`Added ${quantity} x ${product.title} to Cart!`, 'success');
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, quantity }));
    navigateTo.cart();
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
        <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={1}>
          {product.title}
        </Text>
        <TouchableOpacity onPress={navigateTo.cart}>
          <ShoppingBag size={22} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        <View className="h-56 bg-emerald-500/10 rounded-3xl justify-center items-center mb-4">
          <Text className="text-7xl">🌿</Text>
        </View>

        <View className={`border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className="text-xs font-black uppercase text-emerald-500 tracking-wider">{product.category}</Text>
          <Text className={`text-xl font-black mt-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{product.title}</Text>
          <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.subtitle}</Text>

          <View className="flex-row items-center gap-2.5 mt-4">
            <Text className={`text-2xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{product.price}</Text>
            <Text className={`text-sm line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{product.originalPrice}</Text>
            <View className="bg-amber-500/10 px-2.5 py-1 rounded-lg flex-row items-center gap-1">
              <Sparkles size={10} color="#D97706" />
              <Text className="color-amber-600 text-[10px] font-black">{product.badge}</Text>
            </View>
          </View>
        </View>

        <View className={`border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className={`text-base font-extrabold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Description</Text>
          <Text className={`text-xs leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</Text>

          <Text className={`text-base font-extrabold mt-4 mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Key Herbal Ingredients</Text>
          <View className="flex-row flex-wrap gap-2">
            {product.ingredients?.map((ing) => (
              <View key={ing} className="bg-emerald-500/10 px-3 py-1.5 rounded-xl flex-row items-center gap-1">
                <Check size={12} color="#059669" />
                <Text className="color-emerald-700 text-xs font-bold">{ing}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={`border rounded-3xl p-5 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className={`text-base font-extrabold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Quantity</Text>
          <View className="flex-row items-center gap-4 mt-2">
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              className={`w-10 h-10 rounded-xl border justify-center items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Minus size={16} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>

            <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{quantity}</Text>

            <TouchableOpacity
              onPress={() => setQuantity((q) => q + 1)}
              className={`w-10 h-10 rounded-xl border justify-center items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Plus size={16} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className={`flex-row gap-3 px-5 py-4 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <TouchableOpacity
          className="flex-1 bg-emerald-500/10 py-3.5 rounded-2xl flex-row items-center justify-center gap-1.5"
          activeOpacity={0.8}
          onPress={handleAddToCart}>
          <ShoppingCart size={16} color="#10B981" />
          <Text className="color-emerald-600 text-sm font-extrabold">Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-emerald-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-1.5"
          activeOpacity={0.8}
          onPress={handleBuyNow}>
          <ShoppingBag size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-extrabold">Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
