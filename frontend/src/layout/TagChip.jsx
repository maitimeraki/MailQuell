import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TagChip({ text, onRemove }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm text-primary select-none',
        'border border-primary/20'
      )}
    >
      {text}
      <button
        type="button"
        aria-label={`Remove ${text}`}
        onClick={() => onRemove()}
        className="rounded hover:bg-primary/20 p-0.5 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}