import { useState, ChangeEvent } from 'react';

interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>
  ) => (e: React.FormEvent) => Promise<void>;
  setValues: (values: T) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  reset: () => void;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error for this field
    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit =
    (onSubmit: (values: T) => void | Promise<void>) =>
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      await onSubmit(values);
    };

  const setFieldValue = (field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    setValues,
    setFieldValue,
    setErrors,
    reset,
  };
}