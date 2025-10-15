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
    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
      {title && (
        <h2 className="text-3xl font-black text-gray-950 mb-3">{title}</h2>
      )}
      {description && (
        <p className="text-lg font-semibold text-gray-800 mb-6">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => (
          <div key={field.id}>
            <label className="block text-lg font-bold text-gray-950 mb-2">
              {field.label}
              {field.required && <span className="text-red-600 ml-1 text-xl">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={field.required}
              />
            )}

            {field.type === 'email' && (
              <input
                type="email"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={field.required}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={field.required}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={responses[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required={field.required}
              />
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
                        ? 'bg-indigo-600 text-white border-indigo-600 font-black'
                        : 'bg-white text-black font-black border-gray-300 hover:border-indigo-400'
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
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      required={field.required}
                    />
                    <span className="text-black font-bold dark:text-white">{option}</span>
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
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
          }`}
        >
          {submitting ? '⏳ Submitting...' : '✅ Submit'}
        </button>
      </form>
    </div>
  );
}

