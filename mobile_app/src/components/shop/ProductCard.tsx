import React, { memo, useCallback } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Product } from '@/utils/APiCalls';
import { navigateTo } from '@/navigation/Stack';
import { useAppDispatch, useAppSelector, useTheme } from '@/redux/hooks';
import { addToCart, toggleWishlist } from '@/redux/slices/cartSlice';
import { useToast } from '@/components/common/Toast';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react-native';

interface Props {
  product: Product;
}

export const ProductCard = memo<Props>(({ product }) => {
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const { showToast } = useToast();

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
          <Text className="text-amber-600 text-[9px] font-extrabold">{product.badge}</Text>
        </View>

        <TouchableOpacity onPress={handleWishlistToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Heart size={16} color={isWishlisted ? '#EF4444' : '#94A3B8'} fill={isWishlisted ? '#EF4444' : 'transparent'} />
        </TouchableOpacity>
      </View>

      <View className="h-16 justify-center items-center bg-emerald-500/10 rounded-xl mb-2.5">
        <Text className="text-2xl">🌿</Text>
      </View>

      <View className="gap-0.5 mb-2.5">
        <View className="flex-row items-center gap-1">
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <Text className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.rating} • {product.size}
          </Text>
        </View>
        <Text className={`text-sm font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={2}>
          {product.title}
        </Text>
        <Text className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
          {product.subtitle}
        </Text>
      </View>

      <View className="flex-row justify-between items-end">
        <View>
          <Text className={`text-base font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            ₹{product.price}
          </Text>
          <Text className={`text-[11px] line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
