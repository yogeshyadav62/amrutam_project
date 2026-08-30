import React, { memo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { HealthRecord } from '@/utils/APiCalls';
import { useTheme } from '@/redux/hooks';
import { FileText, Activity, ShieldCheck, Stethoscope, AlertTriangle, Eye } from 'lucide-react-native';

interface Props {
  record: HealthRecord;
  onPreview: (record: HealthRecord) => void;
}

export const TimelineItem = memo<Props>(({ record, onPreview }) => {
  const { isDark } = useTheme();

  const renderIcon = (type: string) => {
    switch (type) {
      case 'Lab Report':
        return <Activity size={22} color="#8B5CF6" />;
      case 'Prescription':
        return <FileText size={22} color="#8B5CF6" />;
      case 'Consultation':
        return <Stethoscope size={22} color="#8B5CF6" />;
      case 'Vaccination':
        return <ShieldCheck size={22} color="#8B5CF6" />;
      case 'Allergy':
        return <AlertTriangle size={22} color="#EF4444" />;
      default:
        return <FileText size={22} color="#8B5CF6" />;
    }
  };

  return (
    <View
      className={`p-4 rounded-2xl mb-3 border ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
      <View className="flex-row gap-3">
        <View className="w-11 h-11 rounded-full bg-purple-500/10 items-center justify-center">
          {renderIcon(record.type)}
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-[11px] font-extrabold uppercase text-purple-500 tracking-wider">
            {record.type}
          </Text>
          <Text className={`text-base font-bold mt-0.5 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {record.title}
          </Text>
          <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {record.doctorName} • {record.date}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2 mt-2.5">
        {record.tags.map((t) => (
          <View key={t} className={`px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <Text className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t}
            </Text>
          </View>
        ))}
      </View>

      <View className={`h-px my-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />

      <View className="flex-row justify-between items-center">
        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {record.fileType} ({record.fileSize})
        </Text>
        <TouchableOpacity
          className="bg-purple-500/10 px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
          activeOpacity={0.8}
          onPress={() => onPreview(record)}>
          <Eye size={13} color="#8B5CF6" />
          <Text className="color-purple-600 text-xs font-bold">Preview {record.fileType}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

TimelineItem.displayName = 'TimelineItem';
