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
import { OffersCarousel } from '@/components/shop/OffersCarousel';
import { ProductCardSkeleton } from '@/components/skeletons/ProductCardSkeleton';
import { useTheme } from '@/redux/hooks';
import { useAppRouter } from '@/navigation/Stack';
import { Storage } from '@/services/storageService';
import { Search, SlidersHorizontal, ShoppingBag, Sun, Moon, User, XCircle } from 'lucide-react-native';
import { io } from 'socket.io-client';

const CATEGORIES = ['All', 'Hair Care', 'Skin Care', 'Wellness Oils', 'Malts & Churnas', 'Digestive'];
const STORAGE_KEY_PRODUCTS = 'amrutam_cached_products';

export function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const router = useAppRouter();

  // Offline-first: Load initially from MMKV local storage
  const [products, setProducts] = useState<Product[]>(() => {
    return Storage.getItem<Product[]>(STORAGE_KEY_PRODUCTS, []) || [];
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price-low-high' | 'price-high-low'>('popularity');
  const [totalCount, setTotalCount] = useState(() => products.length);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const loadingRef = useRef(false);

  const fetchProducts = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loadingRef.current && !isRefresh) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await axios.get(API_ROUTES.PRODUCTS, {
        params: { page: pageNum, pageSize: 20, search: searchQuery, category: selectedCategory, sortBy },
        timeout: 6000,
      });

      const rawData = res.data?.data;
      const list: Product[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

      const total = rawData?.totalCount !== undefined ? rawData.totalCount : list.length;
      const more = rawData?.hasMore !== undefined ? rawData.hasMore : false;

      setTotalCount(total);
      setHasMore(more);

      if (isRefresh || pageNum === 1) {
        setProducts(list);
        if (list.length > 0) {
          // Sync fresh backend products into MMKV local storage
          Storage.setItem(STORAGE_KEY_PRODUCTS, list);
        }
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = list.filter((p) => !existingIds.has(p.id));
          const updated = [...prev, ...newItems];
          Storage.setItem(STORAGE_KEY_PRODUCTS, updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('API fetch warning in ShopScreen (loading offline MMKV cache):', err);
      // Net off / Error: load from MMKV local storage
      const cached = Storage.getItem<Product[]>(STORAGE_KEY_PRODUCTS, []);
      if (cached && cached.length > 0) {
        let filtered = cached;
        if (selectedCategory !== 'All') {
          filtered = filtered.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
        }
        if (searchQuery.trim()) {
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setProducts(filtered);
        setTotalCount(filtered.length);
        setHasMore(false);
      } else if (isRefresh || pageNum === 1) {
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

  // Live WebSocket update when Admin adds/modifies products
  useEffect(() => {
    try {
      const socketHost = BASE_URL.replace('/api', '');
      const socket = io(socketHost, { timeout: 3000 });

      socket.on('products_updated', () => {
        console.log('⚡ Products list updated live from Admin Panel via WebSockets');
        setPage(1);
        fetchProducts(1, true);
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.warn('WebSocket init warning:', e);
    }
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

  const renderEmpty = useCallback(() => {
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
          Products added in Admin Panel will automatically appear here synced with MongoDB & MMKV Storage.
        </Text>
      </View>
    );
  }, [isLoading, page, isDark]);

  const renderFooter = useCallback(() => {
    if (!isLoading || page === 1 || !hasMore || products.length === 0) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  }, [isLoading, page, hasMore, products.length]);

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`} style={{ paddingTop: insets.top }}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3 pt-2">
              <View className="flex-1 mr-2">
                <Text className={`text-2xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Amrutam Store
                </Text>
                <Text className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {totalCount > 0 ? `${totalCount} Formulations Available` : 'Authentic Ayurvedic Store'}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                {/* Dark / Light Mode Toggle */}
                <TouchableOpacity
                  onPress={toggleTheme}
                  activeOpacity={0.7}
                  className={`p-2.5 rounded-2xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                  {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
                </TouchableOpacity>

                {/* Profile Shortcut Button */}
                <TouchableOpacity
                  onPress={() => router.profile()}
                  activeOpacity={0.7}
                  className={`p-2.5 rounded-2xl border flex-row items-center gap-1.5 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                  <User size={18} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Compact Search Bar */}
            <View className="flex-row items-center gap-3 mb-2">
              <View
                className={`flex-1 flex-row items-center px-3.5 h-11 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                <Search size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                <TextInput
                  placeholder="Search Products or Herbs..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                  className={`flex-1 ml-2 text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                />
                {searchQuery.trim() !== '' && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <XCircle size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setIsFilterSheetOpen(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
                className={`p-2.5 h-11 w-11 items-center justify-center rounded-xl border ${
                  selectedCategory !== 'All'
                    ? 'bg-emerald-600 border-emerald-500'
                    : isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}>
                <SlidersHorizontal size={16} color={selectedCategory !== 'All' ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'} />
              </TouchableOpacity>
            </View>

            {/* Top 5 Special Offer Banner Carousel */}
            <OffersCarousel />

            {/* Categories Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-2">
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
        }
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
