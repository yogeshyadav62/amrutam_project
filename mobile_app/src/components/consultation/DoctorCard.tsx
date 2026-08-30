import { useAppRouter } from '@/navigation/Stack';
import { useAppSelector, useTheme } from '@/redux/hooks';
import { Doctor } from '@/utils/APiCalls';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldCheck,
  Sprout,
  Star,
  Video,
} from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DUMMY_DOCTOR_IMAGES = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813566-78a9c464b73b?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80',
];

interface Props {
  doctor: Doctor;
  index?: number;
}

export const DoctorCard = memo<Props>(({ doctor, index = 0 }) => {
  const { isDark } = useTheme();
  const router = useAppRouter();
  const auth = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.booking);

  const charCodeSum = (doctor.id || doctor.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const doctorAvatar = (doctor as any).imageUrl || DUMMY_DOCTOR_IMAGES[charCodeSum % DUMMY_DOCTOR_IMAGES.length];
  const shouldShowNetworkImage = index < 2;

  const rawDoctorName = doctor.name || 'Ayurvedic Vaidya';
  const nameInitials = rawDoctorName
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AV';

  const userBooking = bookings.find((b) => {
    if (!b || b.status === 'Cancelled') return false;

    const docIdStr = String(doctor.id || (doctor as any)._id || '');
    const bookingDocIdStr = String(b.doctorId || '');
    const docIdMatch =
      docIdStr === bookingDocIdStr ||
      (doctor.id && String(b.doctorId) === String(doctor.id)) ||
      ((doctor as any)._id && String(b.doctorId) === String((doctor as any)._id));

    if (!docIdMatch) return false;

    if (auth.isAuthenticated && auth.user) {
      const userCleanId = String(auth.user.id || '').trim();
      const bookingCleanId = String(b.patientId || '').trim();
      const isIdMatch = userCleanId !== '' && bookingCleanId !== '' && userCleanId === bookingCleanId;
      if (isIdMatch) return true;

      const userCleanEmail = String(auth.user.email || '').toLowerCase().trim();
      const bookingCleanEmail = String(b.patientEmail || '').toLowerCase().trim();
      const isEmailMatch = userCleanEmail !== '' && bookingCleanEmail !== '' && userCleanEmail === bookingCleanEmail;
      if (isEmailMatch) return true;
    }

    // Guest matching: match guest booking IDs
    const bookingPatientId = String(b.patientId || '');
    return bookingPatientId.startsWith('usr_guest');
  });

  const isBooked = Boolean(userBooking);

  const handlePress = useCallback(() => {
    router.doctorDetails(doctor.id);
  }, [doctor.id, router]);

  const fullName = doctor.name?.toLowerCase().startsWith('dr.')
    ? doctor.name
    : `Dr. ${doctor.name || 'Ayurvedic Vaidya'}`;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isBooked ? '#1B5E20' : isDark ? '#334155' : '#EAEAEA',
        },
      ]}>
      <View>
        {/* Top Header Row (SLOT CONFIRMED & Date Time) */}
        {isBooked && (
          <View style={styles.topHeaderRow}>
            <View style={styles.confirmedBadge}>
              <CheckCircle2 size={12} color="#1B5E20" style={{ marginRight: 4 }} />
              <Text style={styles.confirmedBadgeText}>SLOT CONFIRMED</Text>
            </View>

            <View style={styles.dateTimeContainer}>
              <Calendar size={12} color={isDark ? '#4ADE80' : '#1B5E20'} style={{ marginRight: 4 }} />
              <Text style={[styles.dateTimeText, { color: isDark ? '#4ADE80' : '#1B5E20' }]}>
                {userBooking?.slotDate || '30 Aug 2026'} • {userBooking?.slotTime || '07:30 PM'}
              </Text>
            </View>
          </View>
        )}

        {/* Doctor Main Info Row */}
        <View style={styles.doctorInfoRow}>
          {/* Round Doctor Avatar with Green Overlay Shield */}
          <View style={styles.avatarWrapper}>
            {shouldShowNetworkImage ? (
              <Image source={{ uri: doctorAvatar }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarImage, { backgroundColor: isDark ? '#334155' : '#EAF2E8', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CDE0CB' }]}>
                <Text style={{ color: isDark ? '#38BDF8' : '#2D5A27', fontSize: 16, fontWeight: '900' }}>{nameInitials}</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={10} color="#FFFFFF" />
            </View>
          </View>

          {/* Doctor Details Column */}
          <View style={styles.doctorDetailsCol}>
            {/* Name & Rating Pill */}
            <View style={styles.nameRatingRow}>
              <Text style={[styles.doctorNameText, { color: isDark ? '#F8FAFC' : '#1A1A1A' }]} numberOfLines={1}>
                {fullName}
              </Text>

              <View style={styles.ratingPill}>
                <Star size={11} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 3 }} />
                <Text style={styles.ratingText}>{doctor.rating || 4.8}</Text>
              </View>
            </View>

            {/* Degree Subtitle */}
            <Text style={[styles.degreeText, { color: isDark ? '#94A3B8' : '#666666' }]} numberOfLines={1}>
              {doctor.degree || 'BAMS, MD (Ayurveda)'}
            </Text>

            {/* Specialty Pill & Experience */}
            <View style={styles.specialtyExpRow}>
              <View style={styles.specialtyPill}>
                <Sprout size={11} color="#1B5E20" style={{ marginRight: 4 }} />
                <Text style={styles.specialtyText} numberOfLines={1}>
                  {doctor.specialty || 'General Medicine'}
                </Text>
              </View>

              <Text style={styles.dividerPipe}>|</Text>

              <View style={styles.expRow}>
                <Clock size={11} color="#666666" style={{ marginRight: 3 }} />
                <Text style={[styles.expText, { color: isDark ? '#CBD5E1' : '#666666' }]}>
                  {doctor.experienceYears || 25} Yrs Exp
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Row: Video Pill, Fee & Action Button */}
        <View style={styles.bottomRow}>
          {/* Video & Voice Call Pill */}
          <View style={[styles.videoCallPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F4F6F4' }]}>
            <Video size={12} color={isDark ? '#94A3B8' : '#2E3A2D'} style={{ marginRight: 5 }} />
            <Text style={[styles.videoCallText, { color: isDark ? '#E2E8F0' : '#2E3A2D' }]}>
              Video & Voice Call
            </Text>
          </View>

          {/* Fee & Action Button Section */}
          <View style={styles.rightActionBox}>
            <View style={styles.feeBox}>
              <Text style={[styles.feeText, { color: isDark ? '#F8FAFC' : '#000000' }]}>
                Fee - ₹{doctor.consultationFee || 999}
              </Text>
            </View>

            {isBooked ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePress}
                style={styles.bookedBtn}>
                <CheckCircle2 size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={styles.bookedBtnText}>Booked</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePress}
                style={[
                  styles.bookSlotBtn,
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                ]}>
                <Calendar size={13} color="#1B5E20" style={{ marginRight: 5 }} />
                <Text style={styles.bookSlotBtnText}>Book Slot</Text>
                <ChevronRight size={13} color="#1B5E20" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

DoctorCard.displayName = 'DoctorCard';

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
  },
  confirmedBadgeText: {
    color: '#1B5E20',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
    width: 66,
    height: 66,
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1B5E20',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorDetailsCol: {
    flex: 1,
  },
  nameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorNameText: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
  },
  degreeText: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  specialtyExpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  specialtyText: {
    color: '#1B5E20',
    fontSize: 10.5,
    fontWeight: '800',
  },
  dividerPipe: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  videoCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  videoCallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rightActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  bookedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookedBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  bookSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  bookSlotBtnText: {
    color: '#1B5E20',
    fontSize: 11.5,
    fontWeight: '900',
  },
});
