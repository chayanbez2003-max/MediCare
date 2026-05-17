import React from 'react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  canceled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  rescheduled: {
    label: 'Rescheduled',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
};

const DEFAULT_CONFIG = {
  label: 'Unknown',
  bg: 'bg-gray-50',
  text: 'text-gray-600',
  border: 'border-gray-200',
  dot: 'bg-gray-400',
};

/**
 * Reusable appointment status badge component.
 * @param {{ status: string, size?: 'sm' | 'md' }} props
 */
const StatusBadge = ({ status, size = 'sm' }) => {
  const key = (status || '').toLowerCase();
  const config = STATUS_CONFIG[key] || DEFAULT_CONFIG;

  const sizeClasses = size === 'md'
    ? 'text-sm px-3 py-1.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.text} ${config.border} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
