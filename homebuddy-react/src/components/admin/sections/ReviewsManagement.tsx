// ============================================
// File: components/admin/sections/ReviewsManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { FormWrapper, FormField } from '../FormWrapper';
import { reviewService, Review } from '@/lib/services/adminServices';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReviewsManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState<Partial<Review>>({});

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                reviewService.getAll(pageNum),
                reviewService.getAllCount()
            ]);
            if (reset) {
                setReviews(response.data || []);
            } else {
                setReviews(prev => [...prev, ...(response.data || [])]);
            }
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading reviews:', error);
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
        await loadReviews(false, nextPage);
    };

    const handleDelete = async (id: number | string) => {
        try {
            const response = await reviewService.delete(Number(id));
            if (response.error) {
                toast.error(`Failed to delete review: ${response.error}`);
                return;
            }
            setReviews(reviews.filter(r => r.id !== id));
            setTotalCount(prev => prev - 1);
            toast.success('Review deleted successfully');
        } catch (error: any) {
            console.error('Error deleting review:', error);
            toast.error(error?.message || 'Failed to delete review');
        }
    };

    const handleEdit = (item: Review) => {
        setFormData(item);
    };

    const handleSave = async (item: Review | null, onClose: () => void) => {
        try {
            const { productGroupSlug, rating, title, comment } = formData;

            if (!rating || !title || !comment || (!item?.id && !productGroupSlug)) {
                toast.error('Product Group Slug (for new), Rating, Title, and Comment are required.');
                return;
            }

            if (item?.id) {
                const response = await reviewService.update(item.id, rating as number, title as string, comment as string);
                if (response.error) {
                    toast.error(`Failed to update review: ${response.error}`);
                    return;
                }
                toast.success('Review updated successfully');
            } else {
                const response = await reviewService.create(
                    String(productGroupSlug),
                    Number(rating),
                    String(title),
                    String(comment)
                );
                if (response.error) {
                    toast.error(`Failed to create review: ${response.error}`);
                    return;
                }
                toast.success('Review created successfully');
            }
            await loadReviews();
            onClose();
            setFormData({});
        } catch (error: any) {
            console.error('Error saving review:', error);
            toast.error(error?.message || 'Failed to save review');
        }
    };

    const columns: Column<Review>[] = [
        { key: 'id', label: 'ID' },
        {
            key: 'productGroupSlug',
            label: 'Product Group Id',
            render: (item) => `ID: #${item.productGroupSlug}`
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (item) => (
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                }`}
                        />
                    ))}
                    <span className="ml-1 text-xs text-gray-400">({item.rating})</span>
                </div>
            )
        },
        {
            key: 'title',
            label: 'Title'
        },
        {
            key: 'comment',
            label: 'Comment',
            render: (item) => (
                <span className="line-clamp-2">{item.comment}</span>
            )
        },
        {
            key: 'createdUtc',
            label: 'Created At',
            render: (item) => (
                <span>{item.createdUtc.slice(0, 16).replace("T", " ")}</span>
            )
        },
        {
            key: 'updatedUtc',
            label: 'Updated At',
            render: (item) => (
                <span>{item.updatedUtc?.slice(0, 16).replace("T", " ") || 'N/A'}</span>
            )
        }
    ];

    return (
        <BaseCRUDComponent
            data={{ items: reviews, totalCount }}
            columns={columns}
            onDelete={handleDelete}
            customFormClose={() => setFormData({})}
            onEdit={handleEdit}
            isLoading={isLoading}
            title="Reviews"
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            renderForm={(item, onClose) => (
                <FormWrapper
                    title="Review"
                    onClose={onClose}
                    onSave={() => handleSave(item, onClose)}
                    isEdit={!!item}
                >
                    <FormField
                        label="Product ID"
                        name="productGroupSlug"
                        type="number"
                        value={formData.productGroupSlug}
                        onChange={(val) => setFormData({ ...formData, productGroupSlug: val })}
                        required
                    />
                    <FormField
                        label="Rating"
                        name="rating"
                        type="number"
                        value={formData.rating}
                        onChange={(val) => setFormData({ ...formData, rating: Math.min(5, Math.max(1, val)) })}
                        placeholder="1-5"
                        required
                    />
                    <FormField
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={(val) => setFormData({ ...formData, title: val })}
                        required
                    />
                    <FormField
                        label="Comment"
                        name="comment"
                        type="textarea"
                        value={formData.comment}
                        onChange={(val) => setFormData({ ...formData, comment: val })}
                        rows={4}
                        required
                    />
                </FormWrapper>
            )}
        />
    );
}