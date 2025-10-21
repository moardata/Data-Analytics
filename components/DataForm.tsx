/**
 * Dynamic Data Form Component
 * Allows creators to build and display customizable forms for collecting student data
 */

'use client';

import { useState } from 'react';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rating' | 'multiple_choice' | 'number' | 'email';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface DataFormProps {
  formId?: string;
  fields: FormField[];
  onSubmit: (responses: Record<string, any>) => void;
  title?: string;
  description?: string;
}

export function DataForm({ formId, fields, onSubmit, title, description }: DataFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && !responses[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(responses);
      setResponses({});
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#171A1F] rounded-xl shadow-lg p-8 border border-[#2A2F36]">
      {title && (
        <h2 className="text-3xl font-black text-[#E1E4EA] mb-3">{title}</h2>
      )}
      {description && (
        <p className="text-lg font-semibold text-[#9AA4B2] mb-6">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => (
          <div key={field.id}>
            <label className="block text-lg font-bold text-[#E1E4EA] mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1 text-xl">*</span>}
            </label>

            {(field.type === 'text' || field.type === 'short_text') && (
              <input
                type="text"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              />
            )}

            {field.type === 'long_text' && (
              <textarea
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              />
            )}

            {field.type === 'email' && (
              <input
                type="email"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              />
            )}

            {field.type === 'rating' && (
              <div className="flex gap-2">
                {Array.from({ length: field.max || 5 }, (_, i) => i + 1).map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFieldChange(field.id, star)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      responses[field.id] >= star 
                        ? 'bg-[#10B981] border-[#10B981] text-white' 
                        : 'bg-[#0d0f12] border-[#2A2F36] text-[#9AA4B2] hover:border-[#10B981]'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            )}

            {field.type === 'radio' && field.options && (
              <div className="space-y-2">
                {field.options.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={responses[field.id] === option}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="mr-2"
                      required={field.required}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && field.options && (
              <div className="space-y-2">
                {field.options.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={responses[field.id]?.includes(option) || false}
                      onChange={(e) => {
                        const current = responses[field.id] || [];
                        const updated = e.target.checked 
                          ? [...current, option]
                          : current.filter(item => item !== option);
                        handleFieldChange(field.id, updated);
                      }}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'select' && field.options && (
              <select
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}

            {field.type === 'multiselect' && field.options && (
              <div className="space-y-2">
                {field.options.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={responses[field.id]?.includes(option) || false}
                      onChange={(e) => {
                        const current = responses[field.id] || [];
                        const updated = e.target.checked 
                          ? [...current, option]
                          : current.filter(item => item !== option);
                        handleFieldChange(field.id, updated);
                      }}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'date' && (
              <input
                type="date"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-4 py-2 bg-[#0d0f12] border border-[#2A2F36] rounded-lg text-[#E1E4EA] placeholder-[#9AA4B2] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                required={field.required}
              />
            )}

            {/* Fallback for unknown field types */}
            {!['text', 'short_text', 'long_text', 'email', 'number', 'rating', 'radio', 'checkbox', 'select', 'multiselect', 'date', 'textarea'].includes(field.type) && (
              <div className="p-4 bg-[#0B2C24] border border-[#17493A] rounded-lg">
                <p className="text-[#E1E4EA]">
                  <strong>Unknown field type:</strong> {field.type}
                </p>
                <p className="text-sm text-[#9AA4B2] mt-1">
                  This field type is not supported yet. Please contact support.
                </p>
              </div>
            )}

            {field.type === 'rating' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleFieldChange(field.id, rating)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      responses[field.id] === rating
                        ? 'bg-[#10B981] text-white border-[#10B981] font-black'
                        : 'bg-[#0d0f12] text-[#E1E4EA] font-black border-[#2A2F36] hover:border-[#10B981]'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}

            {field.type === 'multiple_choice' && field.options && (
              <div className="space-y-2">
                {field.options.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={responses[field.id] === option}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-4 h-4 text-[#10B981] focus:ring-[#10B981]"
                      required={field.required}
                    />
                    <span className="text-[#E1E4EA] font-bold">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
            submitting
              ? 'bg-[#2A2F36] cursor-not-allowed text-[#9AA4B2]'
              : 'bg-[#10B981] hover:bg-[#0E9F71] text-white hover:scale-105'
          }`}
        >
          {submitting ? '⏳ Submitting...' : '✅ Submit'}
        </button>
      </form>
    </div>
  );
}

