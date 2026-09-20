"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Check, ShieldCheck, ThumbsUp, Send } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  reviewerName: string;
  comment: string;
  feedbackType?: string;
  createdAt: string;
}

interface ProductReviewsSectionProps {
  slug: string;
  productName: string;
}

export default function ProductReviewsSection({ slug, productName }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${slug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 5.0);
        setReviewsCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      setErrorMsg("Please provide your name and review comments.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          reviewerName,
          comment,
          feedbackType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit review.");
      } else {
        setSubmitSuccess(true);
        setComment("");
        fetchReviews();
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err) {
      setErrorMsg("Network error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-12 border-t border-zinc-800 space-y-8">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
            <span>Customer R&D Feedback</span>
            <span>•</span>
            <span>Verified 3D Prints</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real customer feedback for manufacturing tolerances, quality, and durability.
          </p>
        </div>

        {/* Rating summary pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-white">{averageRating.toFixed(1)}</span>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <span className="text-xs text-zinc-400">
            Based on <strong className="text-zinc-200">{reviewsCount}</strong> {reviewsCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Grid: Form on Left, Reviews List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Review Form (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rate This Product
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Share your feedback to help our R&D and print lab optimize finish quality.
            </p>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            {/* Star Selector */}
            <div>
              <label className="font-semibold text-zinc-300 block mb-1.5">
                Your Rating (1 to 5 Stars) *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-zinc-600 hover:text-amber-400 transition-colors focus:outline-none"
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-700"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">
                  {rating === 5
                    ? "5.0 - Flawless Quality"
                    : rating === 4
                    ? "4.0 - Very Good"
                    : rating === 3
                    ? "3.0 - Decent"
                    : rating === 2
                    ? "2.0 - Needs Improvement"
                    : "1.0 - Poor"}
                </span>
              </div>
            </div>

            {/* Reviewer Name */}
            <div>
              <label className="font-semibold text-zinc-300 block mb-1">
                Your Name / Organization *
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Vikram Sharma (Maker/Engineer)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Quality Focus Tag */}
            <div>
              <label className="font-semibold text-zinc-300 block mb-1">
                Primary Quality Focus (R&D Category)
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="GENERAL">General Aesthetics & Experience</option>
                <option value="DIMENSIONAL_ACCURACY">Dimensional Accuracy & Fit</option>
                <option value="SURFACE_FINISH">Surface Finish & Layer Quality</option>
                <option value="MECHANICAL_STRENGTH">Mechanical Strength & Infill</option>
              </select>
            </div>

            {/* Review Comment */}
            <div>
              <label className="font-semibold text-zinc-300 block mb-1">
                Review & Engineering Feedback *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the print finish, wall rigidity, layer adhesion, and packaging..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
            )}

            {submitSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you! Your rating has been recorded and synced to R&D.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-950/40"
            >
              {submitting ? (
                <span>Submitting Feedback...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Rating & Review</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reviews List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              Loading verified reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/20 border border-zinc-800/60 space-y-3">
              <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Customer Reviews Yet</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Be the first to rate "{productName}" and help our additive lab perfect its production!
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300">
                      {rev.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">
                          {rev.reviewerName}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified Buyer
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.feedbackType && rev.feedbackType !== "GENERAL" && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800/30">
                    R&D Focus: {rev.feedbackType.replace(/_/g, " ")}
                  </span>
                )}

                <p className="text-xs text-zinc-300 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
