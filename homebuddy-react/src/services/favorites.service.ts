// services/favorites.service.ts
import { apiClient, ApiResponse } from '@/lib/api-client';

export type FavoriteIdsResponse = {
  variantIds: string[];
};

export type FavoritesPageResponse<TItem> = {
  items: TItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Matches backend SkuListItemResponse shape used for favorites
export type FavoriteItem = {
  id: string;
  sku: string;
  objectId: string;
  slug?: string | null;
  groupName: string;
  mainCategory: string;
  categorySlug: string;
  subcategoryName: string;
  subcategorySlug: string;
  color: string;
  size: string;
  price: number;
  inStock: boolean;
  primaryImageUrl?: string | null;
  groupLink: string;
  moreVariantsCount: number;
};

export const favoritesService = {
  async getFavorites(): Promise<ApiResponse<FavoritesPageResponse<FavoriteItem>>> {
    return apiClient.get<FavoritesPageResponse<FavoriteItem>>('/api/Favorites');
  },

  async getFavoriteIds(): Promise<ApiResponse<FavoriteIdsResponse>> {
    return apiClient.get<FavoriteIdsResponse>('/api/Favorites/ids');
  },

  async checkBySku(sku: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    const encoded = encodeURIComponent(sku);
    return apiClient.get<{ isFavorite: boolean }>(`/api/Favorites/check?sku=${encoded}`);
  },

  async addBySku(sku: string): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.post<{ message?: string }>('/api/Favorites', { sku });
  },

  async removeBySku(sku: string): Promise<ApiResponse<{ message?: string }>> {
    const encoded = encodeURIComponent(sku);
    return apiClient.delete<{ message?: string }>(`/api/Favorites?sku=${encoded}`);
  },
};

