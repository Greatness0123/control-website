'use client';

import { useState, ReactNode } from 'react';
import { useToast } from './Toast';

// Field validation types
type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

type FieldConfig = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  validations?: ValidationRule[];
  options?: { value: string; label: string }[];
};

interface FormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitText: string;
  cancelText?: string;
  onCancel?: () => void;
  initialValues?: Record<string, string>;
}

export default function Form({
  fields,
  onSubmit,
  submitText,
  cancelText,
  onCancel,
  initialValues = {}
}: FormProps) {
  // Initialize form values from initialValues or empty strings
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    fields.forEach(field => {
      initialState[field.name] = initialValues[field.name] || '';
    });
    return initialState;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (field: FieldConfig, value: string): string | null => {
    // Check required
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }
    
    // Check validations
    if (field.validations && value) {
      for (const rule of field.validations) {
        if (!rule.test(value)) {
          return rule.message;
        }
      }
    }
    
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      toast.success('Form submitted successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const { name, label, type, placeholder, required, options } = field;
    
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={values[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
            rows={4}
          />
        );
        
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={values[name]}
            onChange={handleChange}
            required={required}
            className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
          >
            <option value="">Select {label}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={values[name] === 'true'}
              onChange={e => handleChange({
                ...e,
                target: {
                  ...e.target,
                  name,
                  value: e.target.checked ? 'true' : 'false'
                }
              })}
              className="mr-2"
            />
            <span>{label}</span>
          </label>
        );
        
      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={values[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => (
        <div key={field.name} className="mb-6">
          <label htmlFor={field.name} className="block text-sm font-medium mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-400">{errors[field.name]}</p>
          )}
        </div>
      ))}
      
      <div className="flex justify-end space-x-3 mt-8">
        {onCancel && cancelText && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition"
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
      </div>
    </form>
  );
}

// Common validation rules
export const validations = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  password: {
    test: (value: string) => value.length >= 8,
    message: 'Password must be at least 8 characters long'
  },
  phone: {
    test: (value: string) => /^\+?[0-9]{10,15}$/.test(value),
    message: 'Please enter a valid phone number'
  },
  url: {
    test: (value: string) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
    message: 'Please enter a valid URL'
  }
};