// ============================================
// File: lib/services/imageServices.ts
// ============================================
import { apiClient } from '@/lib/api-client';

// ========== Types ==========
export interface VariantImage {
    id: string;
    variantId: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface ColorImage {
    id: string;
    productGroupId: string;
    color: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
}

// ========== Variant Image Service ==========
export const variantImageService = {
    getByVariant: async (variantId: string) => {
        return await apiClient.get<VariantImage[]>(`/api/admin/variants/${variantId}/images`);
    },

    create: async (
        variantId: string,
        data: {
            url: string;
            altText?: string;
            isPrimary: boolean;
            sortOrder: number;
        }
    ) => {
        return await apiClient.post<VariantImage>(
            `/api/admin/variants/${variantId}/images`,
            data
        );
    },

    update: async (
        variantId: string,
        imageId: string,
        data: {
            url?: string;
            altText?: string;
            isPrimary?: boolean;
            sortOrder?: number;
        }
    ) => {
        return await apiClient.put<VariantImage>(
            `/api/admin/variants/${variantId}/images/${imageId}`,
            data
        );
    },

    delete: async (variantId: string, imageId: string) => {
        return await apiClient.delete(`/api/admin/variants/${variantId}/images/${imageId}`);
    },
};

// ========== Color Image Service ==========
export const colorImageService = {
    getByGroup: async (groupId: string, color?: string) => {
        const query = color ? `?color=${encodeURIComponent(color)}` : '';
        return await apiClient.get<ColorImage[]>(
            `/api/admin/groups/${groupId}/color-images${query}`
        );
    },

    create: async (
        groupId: string,
        data: {
            color: string;
            url: string;
            altText?: string;
            isPrimary: boolean;
            sortOrder: number;
        }
    ) => {
        return await apiClient.post<ColorImage>(
            `/api/admin/groups/${groupId}/color-images`,
            data
        );
    },

    update: async (
        groupId: string,
        imageId: string,
        data: {
            color?: string;
            url?: string;
            altText?: string;
            isPrimary?: boolean;
            sortOrder?: number;
        }
    ) => {
        return await apiClient.put<ColorImage>(
            `/api/admin/groups/${groupId}/color-images/${imageId}`,
            data
        );
    },

    delete: async (groupId: string, imageId: string) => {
        return await apiClient.delete(`/api/admin/groups/${groupId}/color-images/${imageId}`);
    },
};