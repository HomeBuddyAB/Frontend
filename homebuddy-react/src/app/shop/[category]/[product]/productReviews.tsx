"use client";
import { Review, reviewService } from "@/lib/services/adminServices";
import React, { useEffect, useState } from "react";

export default function ProductReviews({ groupSlug }: { groupSlug: string | null | undefined }) {
    const [reviews, setReviews] = useState<Array<Review>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupSlug) {
            setLoading(false);
            return;
        }

        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await reviewService.getByGroup(groupSlug);
                setReviews(response.data || []);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                setError('Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [groupSlug]);

    if (loading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide">
                    Product Reviews
                </h2>
                <p className="text-gray-300">Loading reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide">
                    Product Reviews
                </h2>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide">
                Product Reviews
            </h2>
            {reviews.length === 0 ? (
                <p className="text-gray-300">No reviews yet. Be the first to review this product!</p>
            ) : (
                <ul className="space-y-6">
                    {reviews.map((review) => (
                        <li key={review.id} className="border-b border-gray-700 pb-4">
                            <h3 className="text-lg font-semibold text-white">{review.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-yellow-400">Rating: {review.rating} / 5</p>
                                <span className="text-yellow-400">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </span>
                            </div>
                            <p className="text-gray-300 mt-2">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Reviewed on: {new Date(review.createdUtc).toLocaleDateString()}
                            </p>
                            {review.updatedUtc && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Updated: {new Date(review.updatedUtc).toLocaleDateString()}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}