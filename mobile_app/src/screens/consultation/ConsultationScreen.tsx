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
import { DoctorCardSkeleton } from '@/components/skeletons/DoctorCardSkeleton';
import { useTheme } from '@/redux/hooks';
import { Search, SlidersHorizontal, Calendar, Sun, Moon } from 'lucide-react-native';
import { io } from 'socket.io-client';

export function ConsultationScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const loadingRef = useRef(false);

  const [filters, setFilters] = useState<DoctorFilterOptions>({
    searchQuery: '',
    specialty: 'All',
    minExperience: 0,
    maxFee: 5000,
  });

  // Direct Live MongoDB Backend API Query Fetcher with ref lock
  const fetchDoctors = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loadingRef.current && !isRefresh) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await axios.get(API_ROUTES.DOCTORS, {
        params: {
          page: pageNum,
          pageSize: 20,
          search: filters.searchQuery,
          specialty: filters.specialty,
          minExperience: filters.minExperience,
          maxFee: filters.maxFee,
        },
        timeout: 10000,
      });

      const rawData = res.data?.data;
      const list: Doctor[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

      const total = rawData?.totalCount !== undefined ? rawData.totalCount : list.length;
      const more = rawData?.hasMore !== undefined ? rawData.hasMore : false;

      console.log(`🌿 Live Backend MongoDB Doctors Fetched: ${list.length} records (Total: ${total})`);

      setTotalCount(total);
      setHasMore(more);

      if (isRefresh || pageNum === 1) {
        setDoctors(list);
      } else {
        setDoctors((prev) => [...prev, ...list]);
      }
    } catch (err) {
      console.warn('API fetch error in ConsultationScreen:', err);
      if (isRefresh || pageNum === 1) {
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
    setPage(1);
    fetchDoctors(1, true);
  }, [filters.searchQuery, filters.specialty, filters.minExperience, filters.maxFee]);

  // Real-Time Socket.io Live Sync Listener
  useEffect(() => {
    const socketHost = BASE_URL.replace('/api', '');
    const socket = io(socketHost);

    socket.on('doctors_updated', () => {
      console.log('⚡ Doctors list updated live from Admin Panel via WebSockets');
      setPage(1);
      fetchDoctors(1, true);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDoctors]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchDoctors(nextPage);
    }
  }, [hasMore, page, fetchDoctors]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchDoctors(1, true);
  }, [fetchDoctors]);

  const renderDoctorItem = useCallback(({ item }: { item: Doctor }) => (
    <DoctorCard doctor={item} />
  ), []);

  const keyExtractor = useCallback((item: Doctor) => item.id, []);

  const renderHeader = () => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-4 pt-2">
        <View>
          <Text className={`text-3xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Find Certified Doctors
          </Text>
          <Text className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {totalCount > 0 ? `${totalCount} Verified Practitioners Available` : 'Live Ayurvedic Consultations'}
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
            placeholder="Search doctor name or specialty..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={filters.searchQuery}
            onChangeText={(text) => setFilters((prev) => ({ ...prev, searchQuery: text }))}
            className={`flex-1 ml-3 text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
          />
        </View>

        <TouchableOpacity
          onPress={() => setIsFilterModalOpen(true)}
          activeOpacity={0.8}
          className={`p-3.5 rounded-2xl border ${
            filters.specialty !== 'All' || filters.minExperience > 0 || filters.maxFee < 5000
              ? 'bg-emerald-600 border-emerald-500'
              : isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}>
          <SlidersHorizontal
            size={18}
            color={
              filters.specialty !== 'All' || filters.minExperience > 0 || filters.maxFee < 5000
                ? '#FFFFFF'
                : isDark
                ? '#94A3B8'
                : '#475569'
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
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
          Registered doctors will automatically show here synced from MongoDB.
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
        data={doctors}
        renderItem={renderDoctorItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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
        onClose={() => setIsFilterModalOpen(false)}
      />
    </View>
  );
}
