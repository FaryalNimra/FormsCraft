'use client';

import { ElementType } from '@/types/database';
import {
  ShortAnswer,
  Paragraph,
  MultipleChoice,
  Checkboxes,
  Dropdown,
  DatePicker,
  TimePicker,
  FileUpload,
  RatingScale,
} from '@/components/form-elements';

interface FormElementRendererProps {
  element: {
    id: string;
    type: ElementType;
    label: string;
    placeholder: string | null;
    required: boolean;
    options: string[] | null;
    max_rating: number | null;
    word_limit?: number | null;
  };
  value: string | string[] | number | File | null;
  onChange: (value: string | string[] | number | File | null) => void;
  error?: string;
}

export default function FormElementRenderer({
  element,
  value,
  onChange,
  error,
}: FormElementRendererProps) {
  switch (element.type) {
    case 'short_answer':
      return (
        <ShortAnswer
          id={element.id}
          label={element.label}
          placeholder={element.placeholder || undefined}
          required={element.required}
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          error={error}
          wordLimit={element.word_limit || undefined}
        />
      );

    case 'paragraph':
      return (
        <Paragraph
          id={element.id}
          label={element.label}
          placeholder={element.placeholder || undefined}
          required={element.required}
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          error={error}
          wordLimit={element.word_limit || undefined}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoice
          id={element.id}
          label={element.label}
          options={element.options || []}
          required={element.required}
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    case 'checkboxes':
      return (
        <Checkboxes
          id={element.id}
          label={element.label}
          options={element.options || []}
          required={element.required}
          value={(value as string[]) || []}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    case 'dropdown':
      return (
        <Dropdown
          id={element.id}
          label={element.label}
          placeholder={element.placeholder || undefined}
          options={element.options || []}
          required={element.required}
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    case 'date':
      return (
        <DatePicker
          id={element.id}
          label={element.label}
          placeholder={element.placeholder || undefined}
          required={element.required}
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    case 'time':
      return (
        <TimePicker
          id={element.id}
          label={element.label}
          placeholder={element.placeholder || undefined}
          required={element.required}
          value={(value as string) || ''}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    case 'file_upload':
      return (
        <FileUpload
          id={element.id}
          label={element.label}
          required={element.required}
          value={(value as File) || null}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    case 'rating_scale':
      return (
        <RatingScale
          id={element.id}
          label={element.label}
          maxRating={element.max_rating || 5}
          required={element.required}
          value={(value as number) || 0}
          onChange={(v) => onChange(v)}
          error={error}
        />
      );

    default:
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Unknown element type: {element.type}</p>
        </div>
      );
  }
}
