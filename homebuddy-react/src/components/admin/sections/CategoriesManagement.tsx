// ============================================
// File: components/admin/sections/CategoriesManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { categoryService, Category } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';
import { FormWrapper, FormField } from '../FormWrapper';

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formMode, setFormMode] = useState<'parent' | 'subcategory'>('parent');
    const [formData, setFormData] = useState<{
        name: string;
        slug: string;
        parentCategoryId: string;
    }>({
        name: '',
        slug: '',
        parentCategoryId: '',
    });

    useEffect(() => {
        loadCategories();
        loadParentCategories();
    }, []);

    const loadParentCategories = async () => {
        const response = await categoryService.getAll(1, { parentsOnly: true });
        if (!response.error) {
            setParentCategories(response.data || []);
        }
    };

    const loadCategories = async (reset = true, pageNum = 1) => {
        if (reset) setIsLoading(true);
        try {
            const [response] = await Promise.all([
                categoryService.getAll(pageNum),
            ]);
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: Category) => {
        setFormMode(item.parentCategoryId ? 'subcategory' : 'parent');
        setFormData({
            name: item.name || '',
            slug: item.slug || '',
            parentCategoryId: item.parentCategoryId ? String(item.parentCategoryId) : '',
        });
    };

    const toSlug = (val: string) =>
        (val || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    const handleSave = async (item: Category | null, onClose: () => void) => {
        const name = (formData.name || '').trim();
        if (!name) {
            toast.error('Name is required.');
            return;
        }

        const slug = formData.slug?.trim() || toSlug(name);
        const parentCategoryId = formData.parentCategoryId || undefined;

        try {
            if (item?.id) {
                const response = await categoryService.update(item.id, name, slug, parentCategoryId);
                if (response.error) {
                    toast.error(`Failed to update category: ${response.error}`);
                    return;
                }
                toast.success('Category updated successfully');
            } else {
                const response = await categoryService.create(name, slug, parentCategoryId);
                if (response.error) {
                    toast.error(`Failed to create category: ${response.error}`);
                    return;
                }
                toast.success('Category created successfully');
            }

            setFormData({ name: '', slug: '', parentCategoryId: '' });
            await Promise.all([loadCategories(), loadParentCategories()]);
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            const response = await categoryService.delete(id);
            if (response.error) {
                toast.error(`Failed to delete category: ${response.error}`);
                return;
            }
            toast.success('Category deleted successfully');
            await Promise.all([loadCategories(), loadParentCategories()]);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete category');
        }
    };

    const columns: Column<Category>[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
    ];

    const parentColumns: Column<Category>[] = [
        ...columns,
        {
            key: 'subcategoryCount',
            label: 'Subcategories',
            render: (c) => String(c.subcategoryCount ?? 0),
        },
        {
            key: 'productGroupCount',
            label: 'Objects',
            render: (c) => String(c.productGroupCount ?? 0),
        },
    ];

    const subcategoryColumns: Column<Category>[] = [
        ...columns,
        {
            key: 'parentCategoryName',
            label: 'Parent Category',
            render: (c) => c.parentCategoryName || '-',
        },
        {
            key: 'productGroupCount',
            label: 'Objects',
            render: (c) => String(c.productGroupCount ?? 0),
        },
    ];

    const parentItems = categories.filter((c) => !c.parentCategoryId);
    const subcategoryItems = categories.filter((c) => !!c.parentCategoryId);

    const renderCategoryForm = (item: Category | null, onClose: () => void) => (
        <FormWrapper
            title={formMode === 'parent' ? 'Parent Category' : 'Subcategory'}
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
                label="Parent Category"
                type="select"
                options={[
                    { value: '', label: 'Top-level category' },
                    ...parentCategories
                        .filter((c) => !item?.id || String(c.id) !== String(item.id))
                        .map((c) => ({ value: c.id, label: c.name })),
                ]}
                hideEmptyOption
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={(val) => setFormData(prev => ({ ...prev, parentCategoryId: val }))}
            />
        </FormWrapper>
    );

    return (
        <div className="space-y-8">
            <BaseCRUDComponent
                data={{ items: parentItems, totalCount: parentItems.length }}
                columns={parentColumns}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={() => {
                    setFormMode('parent');
                    setFormData({ name: '', slug: '', parentCategoryId: '' });
                }}
                isLoading={isLoading}
                title="Parent Categories"
                customFormClose={() => setFormData({ name: '', slug: '', parentCategoryId: '' })}
                renderForm={renderCategoryForm}
            />

            <BaseCRUDComponent
                data={{ items: subcategoryItems, totalCount: subcategoryItems.length }}
                columns={subcategoryColumns}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={() => {
                    setFormMode('subcategory');
                    setFormData((prev) => ({
                        name: '',
                        slug: '',
                        parentCategoryId: prev.parentCategoryId || (parentCategories[0]?.id ? String(parentCategories[0].id) : ''),
                    }));
                }}
                isLoading={isLoading}
                title="Subcategories"
                customFormClose={() => setFormData({ name: '', slug: '', parentCategoryId: '' })}
                renderForm={renderCategoryForm}
            />
        </div>
    );
}