import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Product } from '@/utils/APiCalls';
import { API_ROUTES, BASE_URL } from '@/utils/APIRoutes';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductFilterSheet } from './ProductFilterSheet';
import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import { useTheme } from '@/redux/hooks';
import { Search, SlidersHorizontal, ShoppingBag, Sun, Moon } from 'lucide-react-native';
import { io } from 'socket.io-client';

const CATEGORIES = ['All', 'Hair Care', 'Skin Care', 'Wellness Oils', 'Malts & Churnas', 'Digestive'];

export function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price-low-high' | 'price-high-low'>('popularity');
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const loadingRef = useRef(false);

  // Direct Component API Fetcher (Express Backend + MongoDB)
  const fetchProducts = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loadingRef.current && !isRefresh) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await axios.get(API_ROUTES.PRODUCTS, {
        params: { page: pageNum, pageSize: 20, search: searchQuery, category: selectedCategory, sortBy },
        timeout: 10000,
      });

      const rawData = res.data?.data;
      const list: Product[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

      const total = rawData?.totalCount !== undefined ? rawData.totalCount : list.length;
      const more = rawData?.hasMore !== undefined ? rawData.hasMore : false;

      console.log(`🛒 Live MongoDB Store Products Fetched: ${list.length} items (Total: ${total})`);

      setTotalCount(total);
      setHasMore(more);

      if (isRefresh || pageNum === 1) {
        setProducts(list);
      } else {
        setProducts((prev) => [...prev, ...list]);
      }
    } catch (err) {
      console.warn('API fetch error in ShopScreen:', err);
      if (isRefresh || pageNum === 1) {
        setProducts([]);
        setTotalCount(0);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [searchQuery, selectedCategory, sortBy]);

  // Real-time Socket.io Live Sync Listener
  useEffect(() => {
    const socketHost = BASE_URL.replace('/api', '');
    const socket = io(socketHost);

    socket.on('products_updated', () => {
      console.log('⚡ Products list updated live from Admin Panel via WebSockets');
      setPage(1);
      fetchProducts(1, true);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchProducts]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [hasMore, page, fetchProducts]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard product={item} />
  ), []);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const renderHeader = () => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-4 pt-2">
        <View>
          <Text className={`text-3xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Amrutam Store
          </Text>
          <Text className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {totalCount > 0 ? `${totalCount} Formulations Available` : 'Authentic Ayurvedic Store'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          className={`p-3 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          {isDark ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6366F1" />}
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-3 mb-4">
        <View
          className={`flex-1 flex-row items-center px-4 py-3 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          <Search size={18} color={isDark ? '#64748B' : '#94A3B8'} />
          <TextInput
            placeholder="Search products or ingredients..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className={`flex-1 ml-3 text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
          />
        </View>

        <TouchableOpacity
          onPress={() => setIsFilterSheetOpen(true)}
          activeOpacity={0.8}
          className={`p-3.5 rounded-2xl border ${
            selectedCategory !== 'All'
              ? 'bg-emerald-600 border-emerald-500'
              : isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}>
          <SlidersHorizontal size={18} color={selectedCategory !== 'All' ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
              className={`px-4 py-2.5 rounded-2xl border ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-500'
                  : isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}>
              <Text
                className={`text-xs font-extrabold ${
                  isSelected ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading && page === 1) {
      return (
        <View className="flex-row flex-wrap justify-between">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      );
    }
    return (
      <View className="py-16 items-center justify-center">
        <ShoppingBag size={48} color={isDark ? '#334155' : '#CBD5E1'} />
        <Text className={`text-base font-extrabold mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          No Formulations Found
        </Text>
        <Text className={`text-xs font-medium text-center mt-1 max-w-[240px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Products added in Admin Panel will automatically appear here synced with MongoDB.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || page === 1) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`} style={{ paddingTop: insets.top }}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
      />

      <ProductFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSort={sortBy}
        onSelectSort={setSortBy}
      />
    </View>
  );
}
