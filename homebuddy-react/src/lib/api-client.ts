// lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

/* =========================================================
   Shared Types (for storefront pages)
   ========================================================= */

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type VariantListItem = {
  sku: string;
  groupId?: string | null;
  groupSlug?: string | null;
  groupName: string;
  price: number;
  inStock: boolean;
  color?: string | null;
  size?: string | null;
  primaryImageUrl?: string | null;
  moreVariantsCount?: number;
  slug?: string | null;
  objectId?: string | null;
};

export type GroupedProductCard = {
  groupId?: string | null;
  groupSlug?: string | null;
  groupName: string;
  primaryImageUrl?: string | null;
  minPrice: number;
  maxPrice: number;
  totalVariants: number;
  anyInStock: boolean;
  /** convenient variant to deep-link via ?sku=... */
  sampleSku?: string;
};

export interface GroupDetail {
  groupId: string;
  groupSlug: string;
  name: string;
  mainCategory: string;
  heroImageUrl: string;
  minPrice: number;
  maxPrice: number;
  inStockAny: boolean;
  variants: VariantDetail[];
  facets: {
    colors: { value: string; count: number }[];
    sizes: { value: string; count: number }[];
  };
}

export type ProductListingParams = {
  categorySlug: string;
  color?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  /** maps to Sort/Dir on backend */
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  page?: string;
  pageSize?: string;
};

/* =========================================================
   Existing Axios Client (kept intact)
   ========================================================= */

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// API Error structure
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Backend auth response from C# (AuthResponseDto)
interface BackendAuthResponse {
  email: string;
  token: string;
}

// User with role extracted from JWT
export interface UserFromToken {
  id?: number;
  email?: string;
  role?: string; // "User" or "Admin"
}

export interface VariantDetail {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  inStock: boolean;
  primaryImageUrl: string;
  images: string[]; // We will flatten this to strings immediately
  description: string | null;
  brand: string | null;
  material: string | null;
}

class ApiClient {
  private client: AxiosInstance;
  private tokenRefreshInProgress = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7039',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add JWT token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Don't intercept errors from login/register endpoints
        const isAuthEndpoint =
          originalRequest.url?.includes('/api/auth/login') ||
          originalRequest.url?.includes('/api/auth/register') ||
          originalRequest.url?.includes('/api/auth/admin/login');

        // If 401 and haven't retried yet, try to refresh token (but not for auth endpoints)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          if (this.tokenRefreshInProgress) {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  (originalRequest.headers as any).Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.tokenRefreshInProgress = true;

          try {
            const newToken = await this.refreshToken();
            this.tokenRefreshInProgress = false;

            // Notify all waiting requests
            this.refreshSubscribers.forEach((cb) => cb(newToken));
            this.refreshSubscribers = [];

            // Retry original request with new token
            if (originalRequest.headers) {
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.tokenRefreshInProgress = false;
            this.refreshSubscribers = [];
            this.clearToken();
            // Let AuthContext/UI handle login
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );

    const newToken = (response.data as any).token || (response.data as any).accessToken;
    this.setToken(newToken);
    return newToken;
  }

  // Decode JWT to extract user info
  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  // Normalize backend auth response to match frontend expectations
  private normalizeAuthResponse(backendResponse: BackendAuthResponse): BackendAuthResponse {
    return {
      email: backendResponse.email,
      token: backendResponse.token,
    };
  }

  // Generic CRUD methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return { data: response.data, status: response.status };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Auth specific methods
  async login(email: string, password: string): Promise<ApiResponse<BackendAuthResponse>> {
    try {
      const response = await this.client.post<BackendAuthResponse>('/api/auth/login', { email, password });
      const normalizedData = this.normalizeAuthResponse(response.data);

      // Store tokens
      this.setToken(normalizedData.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', normalizedData.token);
      }

      return { data: normalizedData, status: response.status };
    } catch (error) {
      console.error('❌ API Client: Login failed:', error);
      return this.handleError(error);
    }
  }

  // Admin login method - separate from regular user login
  async adminLogin(userName: string, password: string): Promise<ApiResponse<BackendAuthResponse>> {
    try {
      const response = await this.client.post<BackendAuthResponse>('/api/auth/admin/login', { userName, password });
      const normalizedData = this.normalizeAuthResponse(response.data);

      // Store tokens
      this.setToken(normalizedData.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', normalizedData.token);
      }

      return { data: normalizedData, status: response.status };
    } catch (error) {
      console.error('❌ API Client: Admin login failed:', error);
      return this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      /* await this.post('/api/auth/logout'); */
    } catch (error) {
      console.warn('Logout endpoint may not exist, clearing token locally:', error);
    } finally {
      this.clearToken();
    }
  }

  // Extract user info AND role from JWT
  async getCurrentUser(): Promise<ApiResponse<UserFromToken>> {
    const token = this.getToken();
    if (!token) {
      return { error: 'No token found', status: 401 };
    }

    const decoded = this.decodeJwt(token);
    if (!decoded) {
      return { error: 'Invalid token', status: 401 };
    }

    // Extract claims
    const userId =
      decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decoded?.nameid ||
      decoded?.sub;

    const userEmail = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded?.email;

    const userRole =
      decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || decoded?.role;

    const user: UserFromToken = {
      id: userId ? parseInt(userId) : undefined,
      email: userEmail,
      role: userRole, // "User" or "Admin"
    };

    return { data: user, status: 200 };
  }

  // Error handler
  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        error?: string;
        errors?: Record<string, string[]>;
        message?: string;
      }>;

      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'An error occurred';

      console.error('🚨 API Client Error:', {
        status: axiosError.response?.status,
        message: errorMessage,
        url: axiosError.config?.url,
      });

      return { error: errorMessage, status: axiosError.response?.status || 500 };
    }

    return { error: error.message || 'An unexpected error occurred', status: 500 };
  }

  // Helper for query params
  buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    return query.toString();
  }
}

// Export singleton instance (unchanged)
export const apiClient = new ApiClient();

// Export class for testing or custom instances (unchanged)
export default ApiClient;

/* =========================================================
   Storefront helpers (server/client safe)
   - Use fetch on the server (App Router SSR)
   - Fallback to axios client on the browser
   ========================================================= */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7039';

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  // Server-side: use fetch (better for App Router data caching)
  if (typeof window === 'undefined') {
    // For local development with self-signed certificates
    // Disable SSL verification (only for development!)
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      // Adjust revalidate as needed
      next: { revalidate: 60 },
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${path} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
  }

  // Client-side: reuse axios instance (respects auth headers/interceptors)
  const r = await apiClient.get<T>(path);
  if (r.error) throw new Error(r.error);
  return r.data as T;
}

/** Categories for nav/landing */
export async function fetchCategories(): Promise<Category[]> {
  return requestJSON<Category[]>('/api/categories');
}

/** Variant-level listing for a category; group these on the UI */
export async function fetchCategoryListing(
  params: ProductListingParams
): Promise<VariantListItem[]> {
  const sp = new URLSearchParams();
  sp.set('CategorySlug', params.categorySlug);
  if (params.color) sp.set('Color', params.color);
  if (params.size) sp.set('Size', params.size);
  if (params.minPrice) sp.set('MinPrice', params.minPrice);
  if (params.maxPrice) sp.set('MaxPrice', params.maxPrice);

  if (params.sort) {
    if (params.sort.startsWith('price')) {
      sp.set('Sort', 'price');
      sp.set('Dir', params.sort.endsWith('asc') ? 'asc' : 'desc');
    } else if (params.sort.startsWith('name')) {
      sp.set('Sort', 'name');
      sp.set('Dir', params.sort.endsWith('asc') ? 'asc' : 'desc');
    }
  }

  if (params.page) sp.set('Page', params.page);
  if (params.pageSize) sp.set('PageSize', params.pageSize);

  return requestJSON<VariantListItem[]>(`/api/products?${sp.toString()}`);
}

/** Product group detail (with all variants + color/size facets) */
// lib/api-client.ts
// lib/api-client.ts - Updated fetchGroupDetail function
export async function fetchGroupDetail(slugOrId: string, sku?: string): Promise<GroupDetail> {
  const query = sku ? `?sku=${encodeURIComponent(sku)}` : '';
  const raw = await requestJSON<any>(`/api/groups/${encodeURIComponent(slugOrId)}${query}`);
  
  return {
    groupId: raw.objectId,
    groupSlug: raw.slug,
    name: raw.name,
    mainCategory: raw.mainCategory,
    heroImageUrl: raw.heroImageUrl,
    minPrice: raw.minPrice,
    maxPrice: raw.maxPrice,
    inStockAny: raw.inStockAny,
    variants: (raw.variants || []).map((v: any) => {
      // 1. Flatten Images: Convert [{url: "..."}] to ["..."]
      const galleryImages: string[] = (v.images || []).map((img: any) => img.url);

      // 2. Ensure Primary Image is in the gallery list
      if (v.primaryImageUrl && !galleryImages.includes(v.primaryImageUrl)) {
        galleryImages.unshift(v.primaryImageUrl);
      }

      // 3. If no images found at all, try using the Group Hero
      if (galleryImages.length === 0 && raw.heroImageUrl) {
        galleryImages.push(raw.heroImageUrl);
      }

      return {
        id: v.sku, // Use SKU as ID if ID is missing
        sku: v.sku,
        color: v.color,
        size: v.size,
        price: v.price,
        inStock: v.inStock,
        primaryImageUrl: v.primaryImageUrl,
        images: galleryImages, 
        // 4. Direct Mapping (Since raw group doesn't have these, we trust the variant)
        description: v.description || null,
        brand: v.brand || null,
        material: v.material || null,
      };
    }),
    facets: {
      colors: raw.colors || [],
      sizes: raw.sizes || [],
    }
  };
}

/** Group variant rows (listing) into product cards for category grids */
export function groupVariantsToProducts(rows: VariantListItem[]): GroupedProductCard[] {
  const map = new Map<string, GroupedProductCard & { _min: number; _max: number }>();

  for (const r of rows) {
    // Use slug (from backend) OR groupSlug OR objectId
    const key = r.slug || r.groupSlug || r.objectId || r.groupName;
    
    if (!key) {
      console.warn('⚠️ Skipping variant without valid group identifier:', r);
      continue;
    }
    
    if (!map.has(key)) {
      map.set(key, {
        groupId: r.objectId ?? null,           // objectId as groupId
        groupSlug: r.slug ?? r.groupSlug,      // slug from backend
        groupName: r.groupName || 'Unnamed Product',
        primaryImageUrl: r.primaryImageUrl ?? undefined,
        minPrice: r.price,
        maxPrice: r.price,
        totalVariants: 1,
        anyInStock: !!r.inStock,
        sampleSku: r.sku,
        _min: r.price,
        _max: r.price,
      });
    } else {
      const g = map.get(key)!;
      g.totalVariants += 1;
      g.anyInStock = g.anyInStock || !!r.inStock;
      g._min = Math.min(g._min, r.price);
      g._max = Math.max(g._max, r.price);
      // Prefer a primary image if missing
      if (!g.primaryImageUrl && r.primaryImageUrl) g.primaryImageUrl = r.primaryImageUrl;
      // Prefer an in-stock sample sku if possible
      const currentSample = rows.find((x) => x.sku === g.sampleSku);
      if (!g.sampleSku || (currentSample && !currentSample.inStock && r.inStock)) {
        g.sampleSku = r.sku;
      }
    }
  }

  return Array.from(map.values()).map((g) => ({
    groupId: g.groupId,
    groupSlug: g.groupSlug,
    groupName: g.groupName,
    primaryImageUrl: g.primaryImageUrl,
    minPrice: g._min,
    maxPrice: g._max,
    totalVariants: g.totalVariants,
    anyInStock: g.anyInStock,
    sampleSku: g.sampleSku,
  }));
}
