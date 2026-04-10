"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function FeedbackPage() {
  useAuthGuard();

  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("Feature");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert([
      {
        user_id: user?.id,
        category,
        rating,
        message,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error submitting feedback");
      return;
    }

    setSubmitted(true);
    setMessage("");
    setRating(0);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      <PageHeader
        title="Feedback"
        subtitle="Help us improve your experience"
      />

      <GlassCard className="p-6">

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-lg font-semibold text-green-400 mb-2">
              ✅ Thank you for your feedback!
            </p>
            <p className="text-gray-400 text-sm">
              Your input helps us improve 
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* CATEGORY */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl 
                bg-white/5 border border-white/10 text-white"
              >
                <option value="Bug">🐛 Bug</option>
                <option value="Feature">💡 Feature</option>
                <option value="UI/UX">🎨 UI/UX</option>
                <option value="Other">💬 Other</option>
              </select>
            </div>

            {/* RATING */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Rating</label>
              <div className="flex gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition ${
                      star <= rating
                        ? "text-yellow-400 scale-110"
                        : "text-gray-500 hover:text-yellow-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* MESSAGE */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
              className="p-4 w-full rounded-xl 
              bg-white/5 border border-white/10 text-white
              min-h-[120px]"
            />

            {/* BUTTON */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "▶ Send Feedback"}
            </Button>

          </div>
        )}

      </GlassCard>

    </div>
  );
}