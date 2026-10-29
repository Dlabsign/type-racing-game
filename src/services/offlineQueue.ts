export interface OfflineQueueItem {
  id: string;
  type: 'LOG_ACTIVITY' | 'SAVE_RACE' | 'UPDATE_CAREER' | 'SAVE_TOURNAMENT' | 'UPSERT_LEADERBOARD' | 'UNLOCK_ACHIEVEMENT';
  payload: Record<string, unknown>;
  queuedAt: number;
  attempts: number;
}

const STORAGE_KEY = 'typeracing_offline_queue';

export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[OfflineQueue] Failed to read queue:', err);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(0, 100))); // keep max 100 items
  } catch (err) {
    console.warn('[OfflineQueue] Failed to persist queue:', err);
  }
}

export function enqueueOfflineItem(type: OfflineQueueItem['type'], payload: Record<string, unknown>): void {
  const item: OfflineQueueItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    payload,
    queuedAt: Date.now(),
    attempts: 0
  };

  const queue = getOfflineQueue();
  queue.push(item);
  saveOfflineQueue(queue);
  console.info(`[OfflineQueue] Enqueued ${type} item (${item.id}). Total in queue: ${queue.length}`);
}

export function removeOfflineItem(id: string): void {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  saveOfflineQueue(queue);
}
