/**
 * Feedback Modal Component
 * Modal form for submitting user feedback
 */

'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
}

export function FeedbackModal({ isOpen, onClose, companyId }: FeedbackModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          type: 'feedback',
          subject,
          message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setSubject('');
          setMessage('');
        }, 2000);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-[#F8FAFC]">Submit Feedback</CardTitle>
              <CardDescription className="text-[#A1A1AA] mt-1">
                Help us improve CreatorIQ with your suggestions
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              className="text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                Thank You!
              </h3>
              <p className="text-[#A1A1AA]">
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F8FAFC] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Brief description of your feedback"
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-[#F8FAFC] placeholder-[#A1A1AA] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F8FAFC] mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Tell us what you love, what could be better, or what features you'd like to see..."
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-[#F8FAFC] placeholder-[#A1A1AA] focus:outline-none focus:border-[#10B981] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#10B981] hover:bg-[#0E9F71] text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

