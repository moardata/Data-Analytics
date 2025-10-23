/**
 * Form Helper Utilities
 * Ensures form fields have unique IDs to prevent state collision
 */

export function ensureUniqueFieldIds(fields: any[]): any[] {
  const seenIds = new Set<string>();
  
  return fields.map((field, index) => {
    // If ID is duplicate or missing, regenerate it
    if (!field.id || seenIds.has(field.id)) {
      field = {
        ...field,
        id: `field_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}`
      };
    }
    seenIds.add(field.id);
    return field;
  });
}

export function fixFormFieldIds(form: any): any {
  if (!form || !form.fields) return form;
  
  return {
    ...form,
    fields: ensureUniqueFieldIds(form.fields)
  };
}

