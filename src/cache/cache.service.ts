import { Injectable } from '@nestjs/common';
import { TimeLimits } from '@app/types/time-limits';

interface CacheRecord {
  value: any;
  ttl: number;
}

@Injectable()
export class CacheService {
  constructor() {
    setInterval(() => {
      for (const [ key, record ] of this.cache.entries()) {
        if (record.ttl < Date.now())
          this.cache.delete(key);
      }
    }, TimeLimits.CacheCleanupInterval);
  }

  private readonly cache: Map<string, CacheRecord> = new Map();

  set(key: string, value: any, ttl: number = TimeLimits.CacheDefaultTTL) {
    this.cache.set(key, {
      value,
      ttl: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const record = this.cache.get(key);
    if (!record) return null;
    if (record.ttl < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return record.value;
  }
}
