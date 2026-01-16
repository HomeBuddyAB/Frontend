"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginButton from "@/components/MenuButton";
import { reviewService } from "@/lib/services/adminServices";

interface CreateReviewSectionProps {
  groupSlug: string;
}

export default function CreateReviewSection({
  groupSlug,
}: CreateReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // For hover effect
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const ratingLabels: { [key: number]: string } = {
    1: "Poor",
    2: "Fair",
    3: "Average",
    4: "Good",
    5: "Excellent",
  };

  // --- Star Component with Hover Logic ---
  const StarRating = () => (
    <div className="flex flex-col gap-2">
      <div
        className="flex space-x-1 cursor-pointer"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            className="focus:outline-none transition-transform hover:scale-110 duration-200"
          >
            <svg
              className={`w-8 h-8 transition-colors duration-200 ${
                star <= (hoverRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-[#4a3b3b] fill-transparent"
              }`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.721c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </button>
        ))}
      </div>
      <span
        className={`text-sm font-medium h-5 transition-opacity duration-300 ${
          rating || hoverRating ? "opacity-100 text-yellow-400" : "opacity-0"
        }`}
      >
        {ratingLabels[hoverRating || rating]}
      </span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await reviewService.create(groupSlug, rating, title, comment);
      setSubmitStatus("success");
      setRating(0);
      setTitle("");
      setComment("");

      // Wait a moment before reload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.location.reload();
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  // --- Wrapper Styles ---
  const cardStyles =
    "bg-[#281c1c] border border-white/5 rounded-xl p-8 shadow-2xl relative overflow-hidden";

  // --- Non-Authenticated View ---
  if (!isAuthenticated) {
    return (
      <div className={`${cardStyles} text-center`}>
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-900/20 blur-[100px] pointer-events-none" />

        <h3 className="text-2xl font-semibold text-white mb-2 relative z-10">
          Have this item?
        </h3>
        <p className="text-white/60 mb-6 relative z-10 max-w-md mx-auto">
          Share your experience with the community. Log in to leave a review.
        </p>
        <div className="relative z-10 flex justify-center">
          <LoginButton />
        </div>
      </div>
    );
  }

  // --- Authenticated View ---
  return (
    <div className={cardStyles}>
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-2xl font-bold text-white">Write a Review</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div className="p-4 bg-[#1f1515] rounded-lg border border-white/5">
          <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
            Rating
          </label>
          <StarRating />
          {submitStatus === "error" && rating === 0 && (
            <p className="text-red-400 text-sm mt-2 font-medium animate-pulse">
              Please select a star rating.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label
              htmlFor="review-title"
              className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2"
            >
              Headline
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's most important to know?"
              required
              className="w-full p-4 bg-[#120c0c] border border-white/10 rounded-lg text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all outline-none"
            />
          </div>

          {/* Comment Input */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2"
            >
              Your Review
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="How was the fit? The material? Would you recommend it?"
              required
              className="w-full p-4 bg-[#120c0c] border border-white/10 rounded-lg text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Status Messages */}
          <div className="order-2 sm:order-1 h-6">
            {submitStatus === "success" && (
              <span className="text-green-400 font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                Review posted successfully
              </span>
            )}
            {submitStatus === "error" && rating > 0 && (
              <span className="text-red-400 font-medium text-sm">
                Something went wrong. Please try again.
              </span>
            )}
          </div>

          {/* The "Premium" White Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
                            order-1 sm:order-2 w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300
                            shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                            ${
                              isSubmitting
                                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                : "bg-white text-black hover:bg-gray-200 transform hover:-translate-y-0.5 active:translate-y-0"
                            }
                        `}
          >
            {isSubmitting ? "PUBLISHING..." : "SUBMIT REVIEW"}
          </button>
        </div>
      </form>
    </div>
  );
}
