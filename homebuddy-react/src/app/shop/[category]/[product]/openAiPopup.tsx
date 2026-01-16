"use client";
import FullScreenPopup from '@/components/Popups/FullScreenPopup';
import { openAIService } from '@/lib/services/adminServices';
import React from 'react';
import Image from 'next/image';

interface RatingDistributionItem {
    stars: number;
    count: number;
    percentage: number;
}

interface ReviewSummaryData {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistributionItem[];
}

/*
interface OpenAIResponse {
    chatMessages: Array<{
        content: Array<{
            kind: number;
            text: string;
        }>;
    }>;
    reply: string;
}
*/

export default function OpenAiPopup({ groupSlug }: { groupSlug: string | null | undefined }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const [stats, setStats] = React.useState<ReviewSummaryData | null>(null);
    const [fakeAiMessage, setFakeAiMessage] = React.useState<string | null>(null);

    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // --- FAKE AI GENERATOR ---
    const getFakeAiSummary = (avgRating: number, totalReviews: number): string => {
        if (totalReviews === 0) return "No reviews available yet to analyze.";

        if (avgRating >= 4.8) {
            return "Exceptional reception! Customers are overwhelmingly positive, praising the outstanding quality and performance. This is a top-tier choice with virtually no reported downsides.";
        } else if (avgRating >= 4.0) {
            return "Highly rated. The majority of users are very satisfied with their purchase, citing good value and reliability. A few minor critiques exist but don't detract from the overall solid experience.";
        } else if (avgRating >= 3.0) {
            return "Mixed to positive feedback. While many users appreciate the core functionality, some have noted specific limitations or room for improvement. It's a decent option but check the specific needs.";
        } else if (avgRating >= 2.0) {
            return "Below average satisfaction. Several users have reported issues with quality or performance that may be concerning. It might be worth comparing with other options before purchasing.";
        } else {
            return "Critical feedback detected. A significant portion of reviews highlight major issues or dissatisfaction. Recommended to proceed with caution.";
        }
    };

    const handleLoadSummary = async () => {
        if (!groupSlug) {
            setError('No group slug provided');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStats(null);
        setFakeAiMessage(null);

        const minDelay = new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const [result, _] = await Promise.all([
                openAIService.summarizeReviews(groupSlug),
                minDelay
            ]);

            const summaryData: any = (result as any)?.data || result;

            if (summaryData && typeof summaryData.averageRating === 'number') {
                const typedStats = summaryData as ReviewSummaryData;
                setStats(typedStats);

                const msg = getFakeAiSummary(typedStats.averageRating, typedStats.totalReviews);
                setFakeAiMessage(msg);
            }

            else {
                throw new Error('Invalid response format: Expected statistical data');
            }

        } catch (err) {
            console.error('Error loading summary:', err);
            setError(err instanceof Error ? err.message : 'Failed to load summary');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleReset = () => {
        setStats(null);
        setFakeAiMessage(null);
        setError(null);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-6 h-6 transition-colors ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <button
                    className="flex items-center gap-2 px-3 py-3 rounded-lg border font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl 
                    bg-[#362222] border-[#423F3E] hover:bg-[#423F3E]"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Review Summary"
                >
                    <Image
                        src="/openai-svgrepo-com.svg"
                        alt="Summary Logo"
                        className='invert'
                        width={24}
                        height={24}
                    />
                </button>
            </div>
        );
    }

    return (
        <FullScreenPopup onClose={handleClose} open={isOpen}>
            <div
                className="relative rounded-lg p-8 w-full border shadow-2xl max-w-4xl mx-auto"
                style={{ backgroundColor: '#2B2B2B', borderColor: '#423F3E' }}
            >
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition-colors leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white uppercase tracking-wide">
                        Review Overview
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                        Statistical breakdown of customer feedback
                    </p>
                </div>

                {!stats && !isLoading && !error && (
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <svg
                                className="w-16 h-16 mx-auto text-gray-600 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                            Generate a statistical breakdown and rating distribution for this product.
                        </p>
                        <button
                            className="px-10 py-4 rounded-lg border text-white text-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#362222', borderColor: '#423F3E' }}
                            onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                    e.currentTarget.style.backgroundColor = '#423F3E';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#362222';
                            }}
                            onClick={handleLoadSummary}
                            disabled={!groupSlug}
                        >
                            View Stats
                        </button>
                        {!groupSlug && (
                            <p className="text-red-400 text-sm mt-4">No product selected</p>
                        )}
                    </div>
                )}

                {isLoading && (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-white mb-6"></div>
                        <p className="text-gray-300 text-lg">Analyzing reviews...</p>
                        <p className="text-gray-500 text-sm mt-2">Compiling statistics...</p>
                    </div>
                )}

                {error && (
                    <div className="py-8">
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                                    <p className="text-red-300">{error}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-6 py-3 rounded-lg border text-white font-medium transition-all duration-200"
                                style={{ backgroundColor: '#362222', borderColor: '#423F3E' }}
                                onClick={handleLoadSummary}
                            >
                                Try Again
                            </button>
                            <button
                                className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 font-medium transition-all duration-200 hover:bg-gray-800"
                                onClick={handleReset}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                )}

                {stats && (
                    <div className="py-4">
                        <div className="flex flex-col md:flex-row gap-8 mb-8">

                            <div className="shrink-0 md:w-1/3 flex flex-col items-center justify-center p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                                <div className="text-6xl font-bold text-white mb-2">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <div className="mb-4">
                                    {renderStars(stats.averageRating)}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="grow">
                                <h3 className="text-sm uppercase text-gray-400 font-semibold mb-4 tracking-wide">
                                    Rating Distribution
                                </h3>
                                <div className="space-y-3">
                                    {stats.ratingDistribution.map((item) => (
                                        <div key={item.stars} className="flex items-center gap-4">
                                            <div className="w-12 text-sm text-gray-300 font-medium flex items-center gap-1">
                                                {item.stars} <span className="text-yellow-400 text-xs">★</span>
                                            </div>

                                            <div className="grow h-3 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${item.percentage * 100}%` }}
                                                />
                                            </div>

                                            <div className="w-8 text-right text-sm text-gray-400">
                                                {item.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {fakeAiMessage && (
                            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <h3 className="text-sm uppercase text-gray-400 font-semibold mb-3 tracking-wide flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Automated Analysis
                                </h3>
                                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 rounded-lg p-6 border border-gray-700/50 shadow-inner">
                                    <p className="text-gray-200 text-lg leading-relaxed italic">
                                        &quot;{fakeAiMessage}&quot;
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                className="px-6 py-3 rounded-lg border text-white font-medium transition-all duration-200"
                                style={{ backgroundColor: '#362222', borderColor: '#423F3E' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#423F3E';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#362222';
                                }}
                                onClick={handleReset}
                            >
                                Refresh Stats
                            </button>
                        </div>
                    </div>
                )}

                {!isLoading && (
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <button
                            className="px-8 py-3 rounded-lg border text-gray-300 font-medium transition-all duration-200 hover:bg-gray-800"
                            style={{ borderColor: '#423F3E' }}
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </FullScreenPopup>
    );
}