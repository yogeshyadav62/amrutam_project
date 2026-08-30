import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SectionList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { HealthRecord, GroupedHealthRecords } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { TimelineItem } from '@/components/healthRecords/TimelineItem';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { useTheme } from '@/redux/hooks';
import { Search, FileText, Tag, Calendar, Sun, Moon } from 'lucide-react-native';

const RECORD_TYPES = ['All', 'Lab Report', 'Prescription', 'Consultation', 'Vaccination', 'Allergy'];
const RECORD_TAGS = ['All', '#Prakriti', '#BloodTest', '#Skin', '#Panchakarma', '#FollowUp', '#Digestive'];

export function HealthRecordsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();

  const [groupedRecords, setGroupedRecords] = useState<GroupedHealthRecords[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<HealthRecord | null>(null);

  const fetchHealthRecords = async (pageNum: number, isRefresh = false) => {
    if (isLoading && !isRefresh) return;
    setIsLoading(true);

    try {
      const res = await axios.get(API_ROUTES.HEALTH_RECORDS, {
        params: { page: pageNum, pageSize: 50, type: selectedType, tag: selectedTag },
        timeout: 4000,
      });

      const payload = res.data.data;
      setTotalCount(payload.totalCount);
      setHasMore(payload.hasMore);

      if (isRefresh || pageNum === 1) {
        setGroupedRecords(payload.groups);
      } else {
        setGroupedRecords(payload.groups);
      }
    } catch (err) {
      console.warn('API fetch error in HealthRecordsScreen:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchHealthRecords(1, true);
  }, [searchQuery, selectedType, selectedTag]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHealthRecords(nextPage);
    }
  };

  const renderHeader = () => (
    <View className="mb-2.5">
      <View className="flex-row justify-between items-center mb-4 pt-2">
        <View>
          <Text className={`text-3xl font-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            Health Records
          </Text>
          <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            10,000+ Patient Timeline ({totalCount || 10000} Records)
          </Text>
        </View>

        {/* Redux Toolkit Dark / Light Mode Toggle Button */}
        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}
          onPress={toggleTheme}
          activeOpacity={0.8}>
          {isDark ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6366F1" />}
        </TouchableOpacity>
      </View>

      <View
        className={`flex-row items-center px-3.5 py-2.5 rounded-2xl mb-3.5 border ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          className={`flex-1 ml-2.5 text-sm p-0 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}
          placeholder="Search 10,000 records, doctors..."
          placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="flex-row items-center gap-1 mb-1.5 mt-1">
        <FileText size={12} color="#10B981" />
        <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Record Type:
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2.5">
        {RECORD_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-2xl mr-2 border ${
              selectedType === type
                ? 'bg-emerald-600 border-emerald-600'
                : isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
            <Text
              className={`text-xs font-bold ${
                selectedType === type ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-row items-center gap-1 mb-1.5 mt-1">
        <Tag size={12} color="#10B981" />
        <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Filter by Tag:
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2.5">
        {RECORD_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-xl mr-2 border ${
              selectedTag === tag
                ? 'bg-emerald-500/20 border-emerald-500'
                : isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
            <Text
              className={`text-[11px] font-bold ${
                selectedTag === tag ? 'text-emerald-600' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      style={{ paddingTop: Math.max(insets.top, 16) }}>
      <SectionList
        sections={groupedRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimelineItem record={item} onPreview={setSelectedRecordForPreview} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className={`py-2.5 my-1.5 flex-row items-center gap-1.5 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Calendar size={15} color="#10B981" />
            <Text className={`text-base font-extrabold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              {title}
            </Text>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          isLoading ? (
            <View className="py-5 items-center">
              <ActivityIndicator size="small" color="#10B981" />
              <Text className={`text-xs mt-1.5 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Loading timeline records...
              </Text>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, maxWidth: 600, width: '100%', alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
      />

      <AttachmentPreviewModal
        record={selectedRecordForPreview}
        onClose={() => setSelectedRecordForPreview(null)}
      />
    </View>
  );
}
