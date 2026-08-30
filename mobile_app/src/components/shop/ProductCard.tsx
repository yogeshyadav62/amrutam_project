import React, { memo, useCallback } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Product } from '@/utils/APiCalls';
import { navigateTo } from '@/navigation/Stack';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { addToCart, toggleWishlist } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/common/Toast';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react-native';

const DUMMY_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1608248597262-838d4150b074?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608248597249-14a58eb70df6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
];

interface Props {
  product: Product;
}

export const ProductCard = memo<Props>(({ product }) => {
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const { showToast } = useToast();

  const charCodeSum = (product.id || product.title || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const productImage = (product as any).imageUrl || DUMMY_PRODUCT_IMAGES[charCodeSum % DUMMY_PRODUCT_IMAGES.length];

  const handlePress = useCallback(() => {
    navigateTo.productDetails(product.id);
  }, [product.id]);

  const handleAdd = useCallback((e: any) => {
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    showToast(`Added ${product.title} to Cart!`, 'success');
  }, [dispatch, product, showToast]);

  const handleWishlistToggle = useCallback((e: any) => {
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    showToast(
      isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      isWishlisted ? 'info' : 'success'
    );
  }, [dispatch, product, isWishlisted, showToast]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      className={`w-[48%] p-3.5 rounded-2xl mb-3.5 justify-between border ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
      <View className="flex-row justify-between items-center mb-2">
        <View className="bg-amber-500/10 px-2 py-0.5 rounded-md flex-row items-center gap-1">
          <Sparkles size={10} color="#D97706" />
          <Text className="text-amber-600 text-[9px] font-extrabold">{product.badge || 'Bestseller'}</Text>
        </View>

        <TouchableOpacity onPress={handleWishlistToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Heart size={16} color={isWishlisted ? '#EF4444' : '#94A3B8'} fill={isWishlisted ? '#EF4444' : 'transparent'} />
        </TouchableOpacity>
      </View>

      <View className="h-28 overflow-hidden rounded-xl mb-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <Image
          source={{ uri: productImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="gap-0.5 mb-2.5">
        <View className="flex-row items-center gap-1">
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <Text className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.rating || 4.8} • {product.size || '200ml'}
          </Text>
        </View>
        <Text className={`text-xs font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={2}>
          {product.title}
        </Text>
        <Text className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
          {product.subtitle || 'Pure Herbal Formulation'}
        </Text>
      </View>

      <View className="flex-row justify-between items-end">
        <View>
          <Text className={`text-base font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            ₹{product.price}
          </Text>
          <Text className={`text-[10px] line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            ₹{product.originalPrice}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-emerald-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
          activeOpacity={0.8}
          onPress={handleAdd}>
          <ShoppingCart size={12} color="#FFFFFF" />
          <Text className="text-white text-xs font-bold">+ Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = 'ProductCard';
