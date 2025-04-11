/**
 * Cache service for storing and retrieving generated images
 * Provides TTL support, error handling, and consistent cache key generation
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { GenerateClothingImageInput, GenerateClothingImageOutput } from '@/app/actions';

// Types for cache entries
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number | null; // null means no expiration
}

// Cache configuration
interface CacheConfig {
  basePath: string;
  defaultTTL: number | null; // in milliseconds, null means no expiration
}

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  basePath: path.join(process.cwd(), '.cache'),
  defaultTTL: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
};

/**
 * Service for caching generated images and related data
 */
export class CacheService {
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Ensure cache directory exists
    if (!existsSync(this.config.basePath)) {
      mkdirSync(this.config.basePath, { recursive: true });
    }
  }

  /**
   * Generate a consistent cache key from input parameters
   */
  public createCacheKey(input: GenerateClothingImageInput): string {
    const data = {
      clothingUrl: input.clothingItemUrl,
      model: {
        gender: input.modelGender,
        bodyType: input.modelBodyType,
        ageRange: input.modelAgeRange,
        ethnicity: input.modelEthnicity,
      },
      environment: {
        description: input.environmentDescription,
        lighting: input.lightingStyle,
        lens: input.lensStyle,
      }
    };
    
    // Create a deterministic hash of the input data
    return crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Get the full path to a cache file
   */
  private getCachePath(key: string): string {
    return path.join(this.config.basePath, `${key}.json`);
  }

  /**
   * Store data in the cache with optional TTL
   */
  public async set<T>(
    key: string, 
    data: T, 
    ttl: number | null = this.config.defaultTTL
  ): Promise<void> {
    try {
      const cachePath = this.getCachePath(key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : null,
      };
      
      await fs.writeFile(cachePath, JSON.stringify(entry), 'utf-8');
    } catch (error) {
      console.error(`Cache write error for key ${key}:`, error);
      // Fail gracefully - don't throw errors for cache operations
    }
  }

  /**
   * Retrieve data from the cache if it exists and is not expired
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const cachePath = this.getCachePath(key);
      
      // Check if cache file exists
      try {
        await fs.access(cachePath);
      } catch {
        return null; // File doesn't exist
      }
      
      // Read and parse cache file
      const data = await fs.readFile(cachePath, 'utf-8');
      const entry = JSON.parse(data) as CacheEntry<T>;
      
      // Check if entry is expired
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        // Expired entry - delete it asynchronously and return null
        fs.unlink(cachePath).catch(err => 
          console.error(`Failed to delete expired cache entry ${key}:`, err)
        );
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error(`Cache read error for key ${key}:`, error);
      return null; // Fail gracefully
    }
  }

  /**
   * Delete a cache entry
   */
  public async delete(key: string): Promise<boolean> {
    try {
      const cachePath = this.getCachePath(key);
      await fs.unlink(cachePath);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<boolean> {
    try {
      const files = await fs.readdir(this.config.basePath);
      
      await Promise.all(
        files.map(file => 
          fs.unlink(path.join(this.config.basePath, file))
            .catch(err => console.error(`Failed to delete cache file ${file}:`, err))
        )
      );
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Check if a cache entry exists and is not expired
   */
  public async has(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result !== null;
  }
}

// Export a singleton instance for use throughout the application
export const imageCache = new CacheService({
  basePath: path.join(process.cwd(), '.cache', 'images'),
});
