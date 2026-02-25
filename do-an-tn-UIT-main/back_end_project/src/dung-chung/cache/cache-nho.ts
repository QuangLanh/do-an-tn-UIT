/**
 * Cache in-memory nhẹ (Map + TTL).
 * Dùng cho kết quả báo cáo/dashboard, TTL 60s để giảm tải MongoDB
 * khi người dùng refresh hoặc chuyển qua lại trang.
 * Không thêm package, không làm project nặng hơn.
 */

const DEFAULT_TTL_MS = 60_000; // 60 giây

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheNho {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /** Xóa mọi key bắt đầu bằng prefix (để invalidate khi có đơn mới/cập nhật) */
  clearByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

/** Singleton dùng chung cho toàn app (báo cáo, dashboard, giao dịch). */
export const cacheNho = new CacheNho();
