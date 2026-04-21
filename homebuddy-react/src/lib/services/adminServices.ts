// ============================================
// File: lib/services/adminServices.ts
// ============================================
import { apiClient } from '@/lib/api-client';

// ========== Types ==========
export interface Admin {
    id: number;
    username: string;
}

export interface User {
    id: number;
    email: string;
    cart?: string | object;
}

export interface Review {
    id: number;
    productGroupSlug: string;
    rating: number;
    title: string;
    comment: string;
    createdUtc: string;
    updatedUtc?: string | null;
    productGroup?: ProductGroup;
}

export interface Item {
    id: string;
    sku: string;
    objectId: string;
    slug: string;
    groupName: string;
    mainCategory: string;
    categorySlug: string;
    subcategoryName: string;
    subcategorySlug: string;
    color: string;
    size: string;
    price: number;
    listPrice?: number;
    inStock: boolean;
    primaryImageUrl: string;
    groupLink: string;
    moreVariantsCount: number;
}

/** Response from GET /api/products (paged) */
export interface PagedProductResponse {
    items: Item[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    variantId?: number;
}

export interface Order {
    id: number;
    orderNo: string;
    email: string;
    total: number;
    status: string;
    createdUtc: string;
    items?: OrderItem[];
}

export interface Variant {
    id: string;
    sku: string;
    color: string;
    size: string;
    price: number;
    inventoryQuantity: number;
    lowStockThreshold: number;
    lastRestockDate: string | null;
    // Metadata fields
    description?: string;
    brand?: string;
    material?: string;
}

export interface ProductGroup {
    id: string;
    name: string;
    slug?: string;
    objectId?: string;
    isDeleted?: boolean;
    category?: Category | null;
    categoryId?: string;
    createdAt?: string;
    updatedAt?: string;
    variants?: any[]; // can be typed more specifically if needed
    colorImages?: any[]; // can be typed more specifically if needed
}

export interface Group {
    id: string | number;
    name: string;
    slug?: string;
    objectId?: string;
    isDeleted?: boolean;
    category?: Category;
    categoryId?: string | number;
    /** True if any variant in this group has a list price (discount). */
    hasDiscount?: boolean;
}

export interface Category {
    id: string | number;
    name: string;
    slug: string;
    parentCategoryId?: string | number | null;
    parentCategoryName?: string | null;
    parentCategorySlug?: string | null;
    subcategoryCount?: number;
    productGroupCount?: number;
}

// ========== Dashboard Types ==========
export interface DashboardSummary {
    orders: {
        total: number;
        totalRevenue: number;
        today: number;
    };
    customers: {
        total: number;
    };
    catalog: {
        productGroups: number;
        variants: number;
        lowStockVariants: number;
        outOfStockVariants: number;
    };
    reviews: {
        total: number;
        averageRating: number;
    };
}

// ========== Helper function to build query strings ==========
const buildQueryString = (params: Record<string, any>): string => {
    const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    return queryParams ? `?${queryParams}` : '';
};

// ========== Admin Service ==========
export const adminService = {
    getAll: (page: number) => apiClient.get<Admin[]>(`/api/Admins?page=${page}`),
    getAllCount: () => apiClient.get<number>('/api/Admins/count'),
    getById: (id: number) => apiClient.get<Admin>(`/api/Admins/${id}`),
    create: (username: string, password: string) =>
        apiClient.post<Admin>(`/api/Admins?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`),
    delete: (id: number | string, confirmPassword?: string) =>
        apiClient.delete(`/api/Admins/${id}${confirmPassword ? `?confirmPassword=${encodeURIComponent(confirmPassword)}` : ''}`),
    updatePassword: (id: number | string, currentPassword: string, newPassword: string) =>
        apiClient.put(`/api/Admins/${id}/password?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`),
};

// ========== User Management Service ==========
export const userService = {
    getAll: (page: number = 1) => apiClient.get<User[]>(`/api/UserManagement?page=${page}`),
    getAllCount: () => apiClient.get<number>('/api/UserManagement/count'),
    getById: (id: number) => apiClient.get<User>(`/api/UserManagement/${id}`),
    update: (id: number, email: string) =>
        apiClient.put<User>(`/api/UserManagement/${id}`, { email }),
    delete: (id: number) => apiClient.delete(`/api/UserManagement/${id}`),
};

// ========== Review Service ==========
export const reviewService = {
    getAll: (page: number = 1) => apiClient.get<Review[]>(`/api/Reviews?page=${page}`),
    getAllCount: () => apiClient.get<number>('/api/Reviews/count'),
    getById: (id: number) => apiClient.get<Review>(`/api/Reviews/${id}`),
    getByProduct: (productId: number) =>
        apiClient.get<Review[]>(`/api/Reviews/product/${productId}`),
    getByGroup: (groupSlug: string) =>
        apiClient.get<Review[]>(`/api/Reviews/product-group/${encodeURIComponent(groupSlug)}`),
    create: (productGroupSlug: string, rating: number, title: string, comment: string) =>
        apiClient.post<Review>(`/api/Reviews`, { productGroupSlug, rating, title, comment }),
    update: (id: number, rating?: number, title?: string, comment?: string) => {
        const body: { rating?: number; title?: string; comment?: string } = {};
        if (rating !== undefined) body.rating = rating;
        if (title !== undefined) body.title = title;
        if (comment !== undefined) body.comment = comment;
        return apiClient.put<Review>(`/api/Reviews/${id}`, body);
    },
    delete: (id: number) => apiClient.delete(`/api/Reviews/${id}`),
};

// ========== Order Service ==========
export const orderService = {
    getAll: (page: number = 1) => apiClient.get<Order[]>(`/api/Orders?page=${page}`),
    getAllCount: () => apiClient.get<number>('/api/Orders/count'),
    getById: (id: number) => apiClient.get<Order>(`/api/Orders/${id}`),
    getByEmail: (email: string) =>
        apiClient.get<Order[]>(`/api/Orders/by-email/${encodeURIComponent(email)}`),
    getByOrderNo: (orderNo: string) =>
        apiClient.get<Order>(`/api/Orders/by-orderNo/${encodeURIComponent(orderNo)}`),
    create: (email: string, items: Array<{ sku: string; quantity: number }>) => {
        return apiClient.post<Order>(`/api/Orders`, { email, items });
    },
    update: (id: number, status?: string, total?: number, email?: string, items?: OrderItem[]) => {
        const body: {
            status?: string;
            total?: number;
            email?: string;
            items?: Array<{ id: number; quantity: number; unitPrice: number }>;
        } = {};

        if (status !== undefined) body.status = status;
        if (total !== undefined) body.total = total;
        if (email !== undefined) body.email = email;
        if (items !== undefined) {
            body.items = items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }));
        }

        return apiClient.put<Order>(`/api/Orders/${id}`, body);
    },
    delete: (id: number) => apiClient.delete(`/api/Orders/${id}`),
};

// ========== Groups Service ==========
export const groupService = {
    getAll: (page: number = 1) => apiClient.get<Group[]>(`/api/admin/Groups?page=${page}`),
    getAllCount: () => apiClient.get<number>('/api/admin/Groups/count'),
    create: (name: string, slug: string, categoryId?: string, objectId?: string) => {
        const body: {
            name: string;
            slug: string;
            categoryId?: string;
            objectId?: string;
        } = { name, slug };

        if (categoryId) body.categoryId = categoryId;
        if (objectId) body.objectId = objectId;

        return apiClient.post<Group>(`/api/admin/Groups`, body);
    },
    update: (id: number | string, name: string, slug: string, categoryId?: string) => {
        const body: {
            name: string;
            slug: string;
            categoryId?: string;
        } = { name, slug };

        if (categoryId) body.categoryId = categoryId;

        return apiClient.put<Group>(`/api/admin/Groups/${id}`, body);
    },
    delete: (id: number | string) => apiClient.delete(`/api/admin/Groups/${id}`),
    /** Apply percentage discount to all variants in the group (1–99). */
    applyDiscount: (groupId: string | number, discountPercent: number) =>
        apiClient.post(`/api/admin/Groups/${groupId}/discount`, { discountPercent }),
    /** Remove discount from all variants in the group (clears ListPrice). */
    removeDiscount: (groupId: string | number) =>
        apiClient.post(`/api/admin/Groups/${groupId}/discount/remove`, {}),
};

// ========== Variants Service ==========
export const variantService = {
    getByGroup: (groupId: number | string, page: number = 1) =>
        apiClient.get<Variant[]>(`/api/admin/variants/by-group/${groupId}?page=${page}`),
    getByGroupCount: (groupId: number | string) =>
        apiClient.get<number>(`/api/admin/variants/by-group/count?groupId=${groupId}`),
    create: (
        productGroupId: number | string,
        sku: string,
        color: string,
        size: string,
        price: number,
        description?: string,
        brand?: string,
        material?: string
    ) => {
        const body: {
            sku: string;
            productGroupId: string;
            color: string;
            size: string;
            price: number;
            description?: string | null;
            brand?: string | null;
            material?: string | null;
        } = {
            sku,
            productGroupId: String(productGroupId),
            color,
            size,
            price,
            description: description || null,
            brand: brand || null,
            material: material || null
        };

        return apiClient.post<Variant>(`/api/admin/variants`, body);
    },
    update: (
        id: string,
        color?: string,
        size?: string,
        price?: number,
        description?: string,
        brand?: string,
        material?: string
    ) => {
        const body: {
            color?: string;
            size?: string;
            price?: number;
            description?: string | null;
            brand?: string | null;
            material?: string | null;
        } = {};

        if (color !== undefined) body.color = color;
        if (size !== undefined) body.size = size;
        if (price !== undefined) body.price = price;
        if (description !== undefined) body.description = description || null;
        if (brand !== undefined) body.brand = brand || null;
        if (material !== undefined) body.material = material || null;

        return apiClient.put<Variant>(`/api/admin/variants/${id}`, body);
    },
    delete: (id: string) => apiClient.delete(`/api/admin/variants/${id}`),
    adjustInventory: (id: string, delta: number, transactionType: number = 0, referenceId?: string) => {
        const body: {
            delta: number;
            transactionType: number;
            referenceId?: string;
        } = { delta, transactionType };

        if (referenceId) body.referenceId = referenceId;

        return apiClient.post(`/api/admin/variants/${id}/inventory/adjust`, body);
    },
};

// =========== Items Service ==========
export const itemService = {
    getAll: (page: number = 1, pageSize: number = 30, search?: string) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search?.trim()) params.set('Search', search.trim());
        return apiClient.get<PagedProductResponse>(`/api/products?${params.toString()}`);
    },
    getDeals: (page: number = 1, pageSize: number = 30, search?: string) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search?.trim()) params.set('Search', search.trim());
        return apiClient.get<PagedProductResponse>(`/api/products/deals?${params.toString()}`);
    },
};

// ========== Categories Service ==========
export const categoryService = {
    getAll: (page: number = 1, options?: { parentsOnly?: boolean; leafOnly?: boolean }) => {
        const params = new URLSearchParams({ page: String(page) });
        if (options?.parentsOnly) params.set('parentsOnly', 'true');
        if (options?.leafOnly) params.set('leafOnly', 'true');
        return apiClient.get<Category[]>(`/api/admin/categories?${params.toString()}`);
    },
    getAllCount: () => apiClient.get<number>('/api/admin/categories/count'),
    create: (name: string, slug?: string, parentCategoryId?: string) =>
        apiClient.post<Category>('/api/admin/categories', {
            name,
            slug: slug || null,
            parentCategoryId: parentCategoryId || null,
        }),
    update: (id: string | number, name: string, slug?: string, parentCategoryId?: string) =>
        apiClient.put(`/api/admin/categories/${id}`, {
            name,
            slug: slug || null,
            parentCategoryId: parentCategoryId || null,
        }),
    delete: (id: string | number) => apiClient.delete(`/api/admin/categories/${id}`),
};

// ========== Dashboard Service ==========
export const dashboardService = {
    getSummary: () => apiClient.get<DashboardSummary>('/api/admin/dashboard/summary'),
};

// ========== OpenAI Service ==========
export const openAIService = {
    summarizeReviews: (slug: string) =>
        apiClient.get<string>(`/api/OpenAi/summarize/${encodeURIComponent(slug)}`),
};
