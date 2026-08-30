import React from 'react';
import { Text, View, Modal, TouchableOpacity, useColorScheme } from 'react-native';
import { HealthRecord } from '@/utils/APiCalls';
import { X, FileText, Image as ImageIcon, Download } from 'lucide-react-native';

interface Props {
  record: HealthRecord | null;
  onClose: () => void;
}

export function AttachmentPreviewModal({ record, onClose }: Props) {
  const isDark = useColorScheme() === 'dark';

  if (!record) return null;

  return (
    <Modal visible={!!record} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 justify-center items-center p-5">
        <View className={`rounded-3xl p-6 w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-lg font-black flex-1 mr-2 ${isDark ? 'text-slate-50' : 'text-slate-900'}`} numberOfLines={1}>
              {record.title}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <Text className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {record.doctorName} • {record.date} • {record.fileType} ({record.fileSize})
          </Text>

          <View className="h-52 bg-purple-500/10 rounded-2xl justify-center items-center mb-4">
            {record.fileType === 'IMAGE' ? (
              <View className="items-center">
                <ImageIcon size={48} color="#8B5CF6" />
                <Text className="color-purple-600 text-xs font-bold mt-2">Image Document Preview</Text>
              </View>
            ) : (
              <View className="items-center">
                <FileText size={48} color="#8B5CF6" />
                <Text className="color-purple-600 text-xs font-bold mt-2">PDF Document Thumbnail</Text>
              </View>
            )}
          </View>

          <Text className={`text-xs leading-5 mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{record.summary}</Text>

          <TouchableOpacity
            className="bg-purple-600 py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
            onPress={onClose}
            activeOpacity={0.8}>
            <Download size={16} color="#FFFFFF" />
            <Text className="text-white text-sm font-extrabold">Download Attachment ({record.fileSize})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
