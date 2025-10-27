/**
 * Dynamic Data Form Component
 * Allows creators to build and display customizable forms for collecting student data
 */

'use client';

import { useState } from 'react';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'short_text' | 'long_text' | 'textarea' | 'rating' | 'multiple_choice' | 'number' | 'email' | 'radio' | 'checkbox' | 'select' | 'multiselect' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
  placeholder?: string;
  max?: number; // for rating controls
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
    
    // Validate required fields - properly handle boolean false values
    const missingFields = fields
      .filter(field => field.required && !(field.id in responses))
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
    <div className="relative overflow-hidden rounded-xl shadow-lg p-8 border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f]">
      {/* Metallic sheen overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10">
      {title && (
        <h2 className="text-3xl font-black text-[#F8FAFC] mb-3">{title}</h2>
      )}
      {description && (
        <p className="text-lg font-semibold text-[#A1A1AA] mb-6">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => (
          <div key={field.id}>
            <label className="block text-lg font-bold text-[#F8FAFC] mb-2">
              {field.label}
              {field.required && <span className="text-[#10B981] ml-1 text-xl">*</span>}
            </label>

            {(field.type === 'text' || field.type === 'short_text') && (
              <input
                type="text"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#1a1a1a] rounded-lg text-[#F8FAFC] placeholder-[#A1A1AA] focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all"
                required={field.required}
              />
            )}

            {field.type === 'long_text' && (
              <textarea
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#1a1a1a] rounded-lg text-[#F8FAFC] placeholder-[#A1A1AA] focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all resize-none"
                required={field.required}
              />
            )}

            {field.type === 'email' && (
              <input
                type="email"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#1a1a1a] rounded-lg text-[#F8FAFC] placeholder-[#A1A1AA] focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all"
                required={field.required}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#1a1a1a] rounded-lg text-[#F8FAFC] placeholder-[#A1A1AA] focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all"
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
                        const current = (responses[field.id] || []) as string[];
                        const updated = e.target.checked 
                          ? [...current, option]
                          : current.filter((item: string) => item !== option);
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
                        const current = (responses[field.id] || []) as string[];
                        const updated = e.target.checked 
                          ? [...current, option]
                          : current.filter((item: string) => item !== option);
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

            {field.type === 'boolean' && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value="true"
                    checked={responses[field.id] === true || responses[field.id] === 'true'}
                    onChange={() => handleFieldChange(field.id, true)}
                    className="w-4 h-4 text-[#10B981] focus:ring-[#10B981]"
                    required={field.required}
                  />
                  <span className="text-[#E1E4EA] font-bold">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value="false"
                    checked={responses[field.id] === false || responses[field.id] === 'false'}
                    onChange={() => handleFieldChange(field.id, false)}
                    className="w-4 h-4 text-[#10B981] focus:ring-[#10B981]"
                    required={field.required}
                  />
                  <span className="text-[#E1E4EA] font-bold">No</span>
                </label>
              </div>
            )}

            {/* Fallback for unknown field types */}
            {!['text', 'short_text', 'long_text', 'email', 'number', 'rating', 'radio', 'checkbox', 'select', 'multiselect', 'date', 'textarea', 'multiple_choice', 'boolean'].includes(field.type) && (
              <div className="p-4 bg-[#0B2C24] border border-[#17493A] rounded-lg">
                <p className="text-[#E1E4EA]">
                  <strong>Unknown field type:</strong> {field.type}
                </p>
                <p className="text-sm text-[#9AA4B2] mt-1">
                  This field type is not supported yet. Please contact support.
                </p>
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
              ? 'bg-[#3F3F46] cursor-not-allowed text-[#A1A1AA] border border-[#3F3F46]'
              : 'bg-gradient-to-r from-[#10B981] to-[#0E9F71] hover:from-[#0E9F71] hover:to-[#10B981] text-white shadow-[#10B981]/20'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      </div>
    </div>
  );
}

