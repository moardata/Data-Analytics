/**
 * Form Builder Component
 * Allows creators to build custom forms for collecting student data
 */

'use client';

import { useState } from 'react';
import { FormField } from './DataForm';

interface FormBuilderProps {
  onSave: (form: { name: string; description: string; fields: FormField[] }) => void;
}

export function FormBuilder({ onSave }: FormBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<Partial<FormField> | null>(null);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'rating', label: 'Rating (1-5)' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
  ];

  const addField = () => {
    if (!editingField?.label || !editingField?.type) {
      alert('Please fill in field label and type');
      return;
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: editingField.label,
      type: editingField.type as any,
      required: editingField.required || false,
      placeholder: editingField.placeholder,
      options: editingField.options,
    };

    setFields([...fields, newField]);
    setEditingField(null);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleSave = () => {
    if (!name) {
      alert('Please enter a form name');
      return;
    }
    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    onSave({ name, description, fields });
    
    // Reset form
    setName('');
    setDescription('');
    setFields([]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-3xl font-black text-black dark:text-white mb-6">Form Builder</h2>

      {/* Form Details */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Course Feedback Survey"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the form..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="mb-6">
        <h3 className="text-xl font-black text-black dark:text-white mb-3">Form Fields</h3>
        
        {fields.length === 0 ? (
          <p className="text-black font-bold text-base dark:text-white">No fields added yet. Add your first field below.</p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-base font-black text-black dark:text-white">{index + 1}.</span>
                <div className="flex-1">
                  <div className="font-black text-black dark:text-white">{field.label}</div>
                  <div className="text-sm font-bold text-black dark:text-white">
                    Type: {field.type}
                    {field.required && ' • Required'}
                  </div>
                </div>
                <button
                  onClick={() => removeField(field.id)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Field Form */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-black text-black dark:text-white mb-3">Add New Field</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-black text-black dark:text-white mb-2">
                Field Label
              </label>
              <input
                type="text"
                value={editingField?.label || ''}
                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                placeholder="e.g., How would you rate this course?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-base font-black text-black dark:text-white mb-2">
                Field Type
              </label>
              <select
                value={editingField?.type || ''}
                onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select type...</option>
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-base font-black text-black dark:text-white mb-2">
              Placeholder (optional)
            </label>
            <input
              type="text"
              value={editingField?.placeholder || ''}
              onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
              placeholder="Placeholder text..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {editingField?.type === 'multiple_choice' && (
            <div>
              <label className="block text-base font-black text-black dark:text-white mb-2">
                Options (comma-separated)
              </label>
              <input
                type="text"
                value={editingField?.options?.join(', ') || ''}
                onChange={(e) => setEditingField({ 
                  ...editingField, 
                  options: e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                })}
                placeholder="Option 1, Option 2, Option 3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editingField?.required || false}
              onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
              className="w-4 h-4 text-indigo-600"
            />
            <label className="text-base font-bold text-black dark:text-white">Required field</label>
          </div>

          <button
            onClick={addField}
            className="w-full py-2 px-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
          >
            Add Field
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t">
        <button
          onClick={handleSave}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Save Form
        </button>
      </div>
    </div>
  );
}

