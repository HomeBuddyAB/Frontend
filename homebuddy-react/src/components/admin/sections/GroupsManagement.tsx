// ============================================
// File: components/admin/sections/GroupsManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { FormWrapper, FormField } from '../FormWrapper';
import { groupService, Group, categoryService, Category } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';

export default function GroupsManagement() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    const [categoriesPage, setCategoriesPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<Partial<Group> & { slug?: string }>({
        id: '',
        name: '',
        slug: '',
        objectId: '',
        categoryId: '',
    });

    useEffect(() => {
        loadGroups();
        fetchCategories().then((cats) => {
            setCategories(cats);
            setIsLoadingCategories(false);
        });
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            if (response.error) {
                console.error('Error fetching categories:', response.error);
                return [];
            }
            return response.data || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    };

    const loadGroups = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                groupService.getAll(pageNum),
                groupService.getAllCount()
            ]);
            if (response.error) {
                console.error('Error loading groups:', response.error);
                toast.error('Failed to load groups');
                return;
            }
            if (reset) {
                setGroups(response.data || []);
            } else {
                setGroups(prev => [...prev, ...(response.data || [])]);
            }
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading groups:', error);
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
        await loadGroups(false, nextPage);
    };

    const handleLoadMoreCategories = async () => {
        alert('Loading more categories is experimental.');
        await fetchCategories();
    };

    const handleDelete = async (id: number | string) => {
        try {
            const response = await groupService.delete(id);
            if (response.error) {
                toast.error(`Failed to delete product group: ${response.error}`);
                return;
            }
            toast.success('Product group marked as deleted successfully');
            // Reload the list to show updated isDeleted status
            await loadGroups();
        } catch (error: any) {
            console.error('Error deleting group:', error);
            toast.error(error?.message || 'Failed to delete product group');
        }
    };

    const handleEdit = (item: Group) => {
        setFormData({
            id: item.id ?? '',
            name: item.name ?? '',
            slug: item.slug ?? '',
            objectId: item.objectId ?? '',
            categoryId: item.category?.id ?? item.categoryId ?? '',
        });
    };

    const toSlug = (val: string) =>
        (val || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    const handleSave = async (item: Group | null, onClose: () => void) => {
        try {
            const name = (formData.name || '').trim();
            if (!name) {
                toast.error('Name is required.');
                return;
            }
            if (!formData.objectId && !item) {
                toast.error('Object ID is required for new groups.');
                return;
            }
            // Use provided slug or auto-generate from name
            const slug = formData.slug?.trim() || toSlug(name);
            const categoryId = formData.categoryId ? String(formData.categoryId).trim() : undefined;
            const objectId = formData.objectId ? String(formData.objectId).trim() : undefined;

            if (item?.id) {
                const response = await groupService.update(
                    item.id,
                    name,
                    slug,
                    categoryId
                );
                if (response.error) {
                    toast.error(`Failed to update product group: ${response.error}`);
                    return;
                }
                toast.success('Product group updated successfully');
            } else {
                const response = await groupService.create(
                    name,
                    slug,
                    categoryId,
                    objectId
                );
                if (response.error) {
                    toast.error(`Failed to create product group: ${response.error}`);
                    return;
                }
                toast.success('Product group created successfully');
            }
            await loadGroups();
            onClose();
            setFormData({ name: '', slug: '', objectId: '', categoryId: '' });
        } catch (error: any) {
            console.error('Error saving group:', error);
            toast.error(error?.message || 'Failed to save product group');
        }
    };

    const columns: Column<Group>[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug', render: (g) => g.slug ?? '-' },
        { key: 'objectId', label: 'Object ID', render: (g) => g.objectId ?? '-' },
        { key: 'isDeleted', label: 'Deleted', render: (g) => g.isDeleted ? 'Yes' : 'No' },
        { key: 'category', label: 'Category' }
    ];

    return (
        <BaseCRUDComponent
            data={{ items: groups, totalCount }}
            columns={columns}
            onDelete={handleDelete}
            onEdit={handleEdit}
            customFormClose={() => setFormData({ name: '', slug: '', objectId: '', categoryId: '' })}
            isLoading={isLoading}
            title="Product Groups"
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            renderForm={(item: Group | null, onClose: () => void) => (
                <FormWrapper
                    title="Product Group"
                    onClose={onClose}
                    onSave={() => handleSave(item, onClose)}
                    isEdit={!!item}
                >
                    <FormField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                        required
                    />
                    <FormField
                        label="Slug"
                        name="slug"
                        value={formData.slug}
                        onChange={(val) => setFormData(prev => ({ ...prev, slug: val }))}
                        placeholder="Leave empty to auto-generate from name"
                    />
                    <FormField
                        label="Object ID"
                        name="objectId"
                        value={formData.objectId}
                        onChange={(val) => setFormData(prev => ({ ...prev, objectId: val }))}
                        placeholder="Optional identifier"
                        disabled={!!item}
                        required
                    />
                    {
                        categoriesCount > 20 && (
                            <button
                                onClick={handleLoadMoreCategories}
                            >
                                Load More Categories
                            </button>
                        )
                    }
                    <FormField
                        label="Category ID"
                        type='select'
                        options={categories.map(cat => ({ value: cat.id || '', label: cat.name || '' }))}
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
                        placeholder="Optional category UUID"
                    />
                </FormWrapper>
            )}
        />
    );
}