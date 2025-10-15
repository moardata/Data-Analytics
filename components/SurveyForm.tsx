'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const ratingScale = [1, 2, 3, 4, 5];

export default function SurveyForm() {
  const [rating, setRating] = React.useState<number | null>(null);
  const [recommend, setRecommend] = React.useState<string>('');
  const [liked, setLiked] = React.useState<string>('');

  const handleSubmit = async () => {
    const formData = {
      rating,
      recommend,
      liked,
      submittedAt: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: '550e8400-e29b-41d4-a716-446655440000',
          formData 
        }),
      });
      
      if (response.ok) {
        alert('Thank you for your feedback!');
        // Reset form
        setRating(null);
        setRecommend('');
        setLiked('');
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl border border-[#2A2F36] bg-[#16191F]',
          'shadow-[0_0_0_1px_rgba(42,47,54,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]'
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-b from-white/2 via-transparent to-transparent" />
          <div className="absolute -top-1/2 left-1/2 h-[120%] w-[140%] -translate-x-1/2 rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
        </div>

        <CardContent className="relative p-6 sm:p-8">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-white">Course Feedback Form</h1>
            <p className="mt-1 text-sm text-zinc-400">Collect student feedback on courses</p>
          </header>

          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-zinc-200">
              How would you rate the course? <span className="text-emerald-400">*</span>
            </legend>

            <div className="flex gap-3">
              {ratingScale.map((n) => {
                const active = rating === n;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Rate ${n}`}
                    onClick={() => setRating(n)}
                    className={cn(
                      'h-11 w-11 rounded-full border text-sm font-medium transition-all',
                      'bg-[#0F1319] border-[#2A2F36] text-zinc-200',
                      'hover:border-emerald-600/60 hover:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]',
                      active &&
                        'bg-emerald-900/20 border-emerald-600 text-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.12),inset_0_0_0_1px_rgba(16,185,129,0.25)]'
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium text-zinc-200">
              What did you like most? <span className="text-emerald-400">*</span>
            </legend>
            <textarea
              value={liked}
              onChange={(e) => setLiked(e.target.value)}
              placeholder="Share your thoughts..."
              rows={5}
              className={cn(
                'w-full resize-y rounded-xl bg-[#0F1319] p-3 text-sm text-zinc-200 placeholder:text-zinc-500',
                'border border-[#2A2F36] outline-none',
                'focus:border-emerald-600 focus:ring-0',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
              )}
            />
          </fieldset>

          <fieldset className="mb-8">
            <legend className="mb-3 text-sm font-medium text-zinc-200">
              Would you recommend this course? <span className="text-emerald-400">*</span>
            </legend>

            <div className="grid gap-2 sm:grid-cols-2">
              {['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'].map((opt) => {
                const active = recommend === opt;
                return (
                  <label
                    key={opt}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border bg-[#0F1319] px-3 py-2 text-sm',
                      'border-[#2A2F36] text-zinc-300 hover:border-emerald-600/50',
                      active && 'border-emerald-600/80 bg-emerald-900/10 text-emerald-200'
                    )}
                  >
                    <input
                      type="radio"
                      name="recommend"
                      value={opt}
                      checked={active}
                      onChange={() => setRecommend(opt)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!rating || !recommend || !liked}
              className={cn(
                'w-full rounded-xl',
                'bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700/60',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
