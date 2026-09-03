import React from 'react';

export const QueueTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="w-full bg-[#0B101D] border border-border-strong rounded-md overflow-hidden animate-pulse">
      <div className="h-10 bg-[#0E1524] border-b border-border-strong flex items-center px-4 gap-4">
        <div className="h-3.5 bg-surface rounded w-20" />
        <div className="h-3.5 bg-surface rounded w-48" />
        <div className="h-3.5 bg-surface rounded w-24 ml-auto" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3 px-4 flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-surface rounded w-3/4" />
              <div className="h-2.5 bg-surface/60 rounded w-1/3" />
            </div>
            <div className="h-3.5 bg-surface rounded w-16" />
            <div className="h-6 bg-surface rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CaseWorkspaceSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-pulse">
      {/* Col 1: Context Skeleton */}
      <div className="lg:col-span-3 bg-[#0B101D] border border-border-strong rounded-md p-4 space-y-4">
        <div className="h-4 bg-surface rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-surface rounded w-3/4" />
          <div className="h-3 bg-surface rounded w-2/3" />
          <div className="h-3 bg-surface rounded w-5/6" />
        </div>
        <div className="h-28 bg-[var(--color-surface-raised)] rounded" />
      </div>

      {/* Col 2: Evidence Skeleton */}
      <div className="lg:col-span-5 space-y-4">
        <div className="h-14 bg-[var(--color-surface-raised)] border border-border-strong rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="h-36 bg-[#0B101D] border border-border-strong rounded-md p-3" />
          <div className="h-36 bg-[#0B101D] border border-border-strong rounded-md p-3" />
        </div>
        <div className="h-32 bg-[#0B101D] border border-border-strong rounded-md p-3" />
        <div className="h-20 bg-[var(--color-surface-raised)] border border-border-subtle rounded-md" />
      </div>

      {/* Col 3: Decision Skeleton */}
      <div className="lg:col-span-4 bg-[#0B101D] border border-border-strong rounded-md p-4 space-y-4">
        <div className="h-4 bg-surface rounded w-2/3" />
        <div className="h-8 bg-[var(--color-surface-raised)] rounded" />
        <div className="h-20 bg-[var(--color-surface-raised)] rounded" />
        <div className="h-9 bg-blue-900/50 rounded" />
      </div>
    </div>
  );
};
