import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { Storage } from './storageService';
import { Booking } from '@/utils/APiCalls';
import { API_ROUTES } from '@/utils/APIRoutes';
import { logger } from './logger';

const STORAGE_KEY_OFFLINE_QUEUE = 'amrutam_offline_booking_queue';

class SyncService {
  private isSyncing = false;

  public init() {
    logger.info('Initializing Automatic Network Sync Engine...');

    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        this.triggerSync();
      }
    });
  }

  public async triggerSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const queue = Storage.getItem<Booking[]>(STORAGE_KEY_OFFLINE_QUEUE, []) || [];
      if (queue.length > 0) {
        logger.info('Internet connection restored. Processing offline booking queue...');
        const res = await axios.post(API_ROUTES.SYNC, { pendingBookings: queue }, { timeout: 4000 });
        if (res.data?.data?.syncedBookings || res.status === 200) {
          Storage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
        }
      }
    } catch (error) {
      logger.error('Error processing offline queue during auto-sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
