// ============================================
// File: components/admin/sections/CategoriesManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { categoryService, Category } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                categoryService.getAll(pageNum),
                categoryService.getAllCount()
            ]);
            if (reset) {
                setCategories(response.data || []);
            } else {
                setCategories(prev => [...prev, ...(response.data || [])]);
            }
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Failed to load categories');
        } finally {
            if (reset) {
                setIsLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        await loadCategories(false, nextPage);
    };

    const handleDelete = async (id: number | string) => {
        alert('Category deletion not available in API');
    };

    const columns: Column<Category>[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
    ];

    return (
        <BaseCRUDComponent
            data={{ items: categories, totalCount }}
            columns={columns}
            onDelete={handleDelete}
            isLoading={isLoading}
            title="Categories"
            allowAdd={false}
            allowEdit={false}
            allowDelete={false}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
        />
    );
}