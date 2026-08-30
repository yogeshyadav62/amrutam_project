import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Doctor } from '@/utils/APiCalls';
import { API_ROUTES, BASE_URL } from '@/utils/APIRoutes';
import { DoctorCard } from '@/components/consultation/DoctorCard';
import { DoctorFilterModal, DoctorFilterOptions } from './DoctorFilterModal';
import { OffersCarousel } from '@/components/shop/OffersCarousel';
import { DoctorCardSkeleton } from '@/components/skeletons/DoctorCardSkeleton';
import { useTheme, useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchBookingsThunk, resetBookings } from '@/redux/slices/bookingSlice';
import { useAppRouter } from '@/navigation/Stack';
import { Storage } from '@/services/storageService';
import { Search, SlidersHorizontal, Calendar, Sun, Moon, RotateCcw, Filter, User, XCircle } from 'lucide-react-native';
import { io } from 'socket.io-client';

export function ConsultationScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const router = useAppRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.booking);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const loadingRef = useRef(false);
  const pageRef = useRef(1);

  const [filters, setFilters] = useState<DoctorFilterOptions>({
    searchQuery: '',
    specialty: 'All',
    minExperience: 0,
    maxFee: 5000,
  });

  const hasActiveFilters =
    filters.specialty !== 'All' ||
    filters.minExperience > 0 ||
    filters.maxFee < 5000 ||
    filters.searchQuery.trim() !== '';

  const handleResetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      specialty: 'All',
      minExperience: 0,
      maxFee: 5000,
    });
  }, []);

  const fetchDoctors = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loadingRef.current && !isRefresh) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await axios.get(API_ROUTES.DOCTORS, {
        params: {
          page: pageNum,
          pageSize: 15,
          search: filters.searchQuery,
          specialty: filters.specialty,
          minExperience: filters.minExperience,
          maxFee: filters.maxFee,
        },
        timeout: 8000,
      });

      const rawData = res.data?.data;
      const list: Doctor[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

      const total = rawData?.totalCount !== undefined ? rawData.totalCount : list.length;
      const more = rawData?.hasMore !== undefined ? rawData.hasMore : false;

      setTotalCount(total);
      setHasMore(more);
      pageRef.current = pageNum;
      setPage(pageNum);

      if (isRefresh || pageNum === 1) {
        setDoctors(list);
        if (list.length > 0) {
          Storage.setItem('amrutam_cached_doctors', list);
        }
      } else {
        setDoctors((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const newItems = list.filter((d) => !existingIds.has(d.id));
          const updated = [...prev, ...newItems];
          Storage.setItem('amrutam_cached_doctors', updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('API fetch error in ConsultationScreen (using offline cache):', err);
      const cached = Storage.getItem<Doctor[]>('amrutam_cached_doctors', []);
      if (cached && cached.length > 0) {
        setDoctors(cached);
        setTotalCount(cached.length);
        setHasMore(false);
      } else if (isRefresh || pageNum === 1) {
        setDoctors([]);
        setTotalCount(0);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.id) {
      dispatch(fetchBookingsThunk(auth.user.id));
    } else {
      dispatch(resetBookings());
    }
  }, [auth.isAuthenticated, auth.user?.id, dispatch]);

  useEffect(() => {
    setDoctors([]);
    pageRef.current = 1;
    setPage(1);
    fetchDoctors(1, true);
  }, [filters.searchQuery, filters.specialty, filters.minExperience, filters.maxFee]);

  useEffect(() => {
    const socketHost = BASE_URL.replace('/api', '');
    const socket = io(socketHost, { timeout: 3000 });

    socket.on('doctors_updated', () => {
      console.log('⚡ Doctors list updated live from Admin Panel via WebSockets');
      pageRef.current = 1;
      setPage(1);
      fetchDoctors(1, true);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDoctors]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      const nextPage = pageRef.current + 1;
      fetchDoctors(nextPage);
    }
  }, [hasMore, fetchDoctors]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    pageRef.current = 1;
    setPage(1);
    fetchDoctors(1, true);
  }, [fetchDoctors]);

  const renderDoctorItem = useCallback(({ item }: { item: Doctor }) => {
    if (!item) return null;
    return <DoctorCard doctor={item} />;
  }, []);

  const keyExtractor = useCallback((item: Doctor, index: number) => {
    return item?.id ? `${item.id}_${index}` : `doc_key_${index}`;
  }, []);

  const renderEmpty = useCallback(() => {
    if (isLoading && page === 1) {
      return (
        <View className="gap-1">
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </View>
      );
    }
    return (
      <View className="py-16 items-center justify-center">
        <Calendar size={48} color={isDark ? '#334155' : '#CBD5E1'} />
        <Text className={`text-base font-extrabold mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          No Practitioners Found
        </Text>
        <Text className={`text-xs font-medium text-center mt-1 max-w-[240px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Try adjusting your search query or clear active filters.
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={handleResetFilters}
            className="mt-4 bg-emerald-600 px-5 py-2.5 rounded-2xl flex-row items-center gap-1.5">
            <RotateCcw size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-extrabold">Reset All Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [isLoading, page, isDark, hasActiveFilters, handleResetFilters]);

  const renderFooter = useCallback(() => {
    if (!isLoading || page === 1 || !hasMore || doctors.length === 0) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  }, [isLoading, page, hasMore, doctors.length]);

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`} style={{ paddingTop: insets.top }}>
      <FlatList
        data={doctors}
        extraData={[bookings, isDark]}
        renderItem={renderDoctorItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3 pt-2">
              <View className="flex-1 mr-2">
                <Text className={`text-2xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Find Certified Doctors
                </Text>
                <Text className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {totalCount > 0
                    ? `${totalCount} ${hasActiveFilters ? 'Filtered' : 'Verified'} Practitioners`
                    : 'Live Ayurvedic Consultations'}
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

            <View className="flex-row items-center gap-3 mb-2">
              <View
                className={`flex-1 flex-row items-center px-3.5 h-11 rounded-xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                <Search size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                <TextInput
                  placeholder="Search Dr. Rajesh or Specialty..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={filters.searchQuery}
                  onChangeText={(text) => setFilters((prev) => ({ ...prev, searchQuery: text }))}
                  style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                  className={`flex-1 ml-2 text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                />
                {filters.searchQuery.trim() !== '' && (
                  <TouchableOpacity
                    onPress={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <XCircle size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setIsFilterModalOpen(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
                className={`p-2.5 h-11 w-11 items-center justify-center rounded-xl border ${
                  hasActiveFilters
                    ? 'bg-emerald-600 border-emerald-500'
                    : isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}>
                <SlidersHorizontal
                  size={16}
                  color={hasActiveFilters ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'}
                />
              </TouchableOpacity>
            </View>

            {/* Top 5 Special Offers Auto-Scrolling Carousel */}
            <OffersCarousel />

            {hasActiveFilters && (
              <View className="flex-row justify-between items-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-2 mt-2">
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <Filter size={15} color="#10B981" />
                  <Text className="text-emerald-500 text-xs font-extrabold" numberOfLines={1}>
                    {totalCount} {totalCount === 1 ? 'Doctor' : 'Doctors'} Found
                    {filters.specialty !== 'All' ? ` • ${filters.specialty}` : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleResetFilters}
                  className="flex-row items-center gap-1 bg-emerald-600 px-3 py-1.5 rounded-xl shadow-sm">
                  <RotateCcw size={12} color="#FFFFFF" />
                  <Text className="text-white text-xs font-black">Clear All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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

      <DoctorFilterModal
        visible={isFilterModalOpen}
        filters={filters}
        onApply={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
        onReset={handleResetFilters}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </View>
  );
}
