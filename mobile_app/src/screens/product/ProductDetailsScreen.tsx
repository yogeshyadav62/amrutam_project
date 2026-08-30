import React, { useState, useEffect } from 'react';
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
import { Product } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { navigateTo } from '@/navigation/Stack';
import { useAppDispatch, useTheme } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/common/Toast';
import { Storage } from '@/services/storageService';
import { ArrowLeft, ShoppingBag, ShoppingCart, Sparkles, Plus, Minus, Check } from 'lucide-react-native';

const DUMMY_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1608248597262-838d4150b074?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608248597249-14a58eb70df6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
];

const STORAGE_KEY_PRODUCTS = 'amrutam_cached_products';

export function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useTheme().isDark;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  // Load initial product from MMKV local storage cache if available
  const [product, setProduct] = useState<Product | null>(() => {
    if (!id) return null;
    const cached1 = Storage.getItem<Product[]>('amrutam_cached_products', []) || [];
    const cached2 = Storage.getItem<Product[]>('amrutam_persistent_products', []) || [];
    const allCached = [...cached1, ...cached2];
    return allCached.find((p) => String(p.id) === String(id) || String((p as any)._id) === String(id)) || null;
  });

  const [isLoading, setIsLoading] = useState(!product);
  const [quantity, setQuantity] = useState(1);

  // Direct Component API Fetcher
  useEffect(() => {
    let isMounted = true;

    async function loadProductDetails() {
      if (!id) return;
      if (!product) setIsLoading(true);

      try {
        const res = await axios.get(API_ROUTES.PRODUCT_BY_ID(id), { timeout: 5000 });
        if (isMounted && res.data?.data) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.warn('API fetch error for Product details (using offline cache):', err);
        if (isMounted) {
          const cached1 = Storage.getItem<Product[]>('amrutam_cached_products', []) || [];
          const cached2 = Storage.getItem<Product[]>('amrutam_persistent_products', []) || [];
          const allCached = [...cached1, ...cached2];
          const found = allCached.find((p) => String(p.id) === String(id) || String((p as any)._id) === String(id));
          if (found) setProduct(found);
        }
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

  // Robust Image Resolution
  const charCodeSum = (product.id || product.title || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rawImage =
    (product as any).imageUrl ||
    (product as any).image ||
    (Array.isArray((product as any).images) && (product as any).images[0]);

  const productImage =
    typeof rawImage === 'string' && rawImage.trim().length > 0 && rawImage.startsWith('http')
      ? rawImage
      : DUMMY_PRODUCT_IMAGES[charCodeSum % DUMMY_PRODUCT_IMAGES.length];

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      style={{ paddingTop: Math.max(insets.top, 16) }}>
      <View className={`flex-row items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity onPress={navigateTo.goBack} className="flex-row items-center gap-1.5 py-1">
          <ArrowLeft size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
          <Text className={`text-base font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Back</Text>
        </TouchableOpacity>
        <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'} max-w-[200px]`} numberOfLines={1}>
          {product.title}
        </Text>
        <TouchableOpacity onPress={navigateTo.cart}>
          <ShoppingBag size={22} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
        {/* Product Hero Image */}
        <View className="h-64 rounded-3xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm">
          <Image
            source={{ uri: productImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Product Title & Pricing */}
        <View className={`border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className="text-xs font-black uppercase text-emerald-500 tracking-wider">{product.category || 'Ayurvedic Care'}</Text>
          <Text className={`text-xl font-black mt-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{product.title}</Text>
          <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.subtitle || 'Pure Herbal Formulation'}</Text>

          <View className="flex-row items-center gap-2.5 mt-4">
            <Text className={`text-2xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text className={`text-sm line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{product.originalPrice}</Text>
            )}
            <View className="bg-amber-500/10 px-2.5 py-1 rounded-lg flex-row items-center gap-1">
              <Sparkles size={10} color="#D97706" />
              <Text className="color-amber-600 text-[10px] font-black">{product.badge || '100% Organic'}</Text>
            </View>
          </View>
        </View>

        {/* Description & Ingredients */}
        <View className={`border rounded-3xl p-5 mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className={`text-base font-extrabold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Description</Text>
          <Text className={`text-xs leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.description || 'Authentic Ayurvedic formulation crafted with pure herbal extracts for holistic health and wellness.'}
          </Text>

          <Text className={`text-base font-extrabold mt-4 mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Key Herbal Ingredients</Text>
          <View className="flex-row flex-wrap gap-2">
            {(product.ingredients && product.ingredients.length > 0 ? product.ingredients : ['Amla', 'Bhringraj', 'Jatamansi', 'Brahmi']).map((ing) => (
              <View key={ing} className="bg-emerald-500/10 px-3 py-1.5 rounded-xl flex-row items-center gap-1 border border-emerald-500/20">
                <Check size={12} color="#059669" />
                <Text className="color-emerald-700 dark:text-emerald-400 text-xs font-bold">{ing}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quantity Controls */}
        <View className={`border rounded-3xl p-5 mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Text className={`text-base font-extrabold mb-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Quantity</Text>
          <View className="flex-row items-center gap-4 mt-2">
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              className={`w-10 h-10 rounded-xl border justify-center items-center ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <Minus size={16} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>

            <Text className={`text-lg font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{quantity}</Text>

            <TouchableOpacity
              onPress={() => setQuantity((q) => q + 1)}
              className={`w-10 h-10 rounded-xl border justify-center items-center ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <Plus size={16} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Bottom Bar */}
      <View className={`flex-row gap-3 px-5 py-4 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <TouchableOpacity
          className="flex-1 bg-emerald-500/10 py-3.5 rounded-2xl flex-row items-center justify-center gap-1.5 border border-emerald-500/20"
          activeOpacity={0.8}
          onPress={handleAddToCart}>
          <ShoppingCart size={16} color="#10B981" />
          <Text className="color-emerald-600 dark:text-emerald-400 text-sm font-extrabold">Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-emerald-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
          activeOpacity={0.8}
          onPress={handleBuyNow}>
          <ShoppingBag size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-extrabold">Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
