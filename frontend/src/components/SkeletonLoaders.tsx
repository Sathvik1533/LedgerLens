import React from 'react';

export const QueueTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="w-full bg-surface border border-border-strong rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-surface-alt border-b border-border-subtle flex items-center px-6 gap-4">
        <div className="h-4 bg-slate-700 rounded w-24" />
        <div className="h-4 bg-slate-700 rounded w-48" />
        <div className="h-4 bg-slate-700 rounded w-28 ml-auto" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 px-6 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/3" />
            </div>
            <div className="h-4 bg-slate-800 rounded w-20" />
            <div className="h-8 bg-slate-800 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CaseWorkspaceSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      {/* Col 1: Context Skeleton */}
      <div className="lg:col-span-3 bg-surface border border-border-strong rounded-xl p-6 space-y-6">
        <div className="h-6 bg-slate-800 rounded w-1/2" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-800 rounded w-2/3" />
          <div className="h-4 bg-slate-800 rounded w-5/6" />
        </div>
        <div className="h-32 bg-surface-alt rounded-lg" />
      </div>

      {/* Col 2: Evidence Skeleton */}
      <div className="lg:col-span-6 space-y-6">
        <div className="h-16 bg-surface-alt border border-border-strong rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-surface border border-border-strong rounded-xl p-4" />
          <div className="h-44 bg-surface border border-border-strong rounded-xl p-4" />
        </div>
        <div className="h-40 bg-surface border border-border-strong rounded-xl p-4" />
        <div className="h-28 bg-surface-alt border border-border-subtle rounded-xl" />
      </div>

      {/* Col 3: Decision Skeleton */}
      <div className="lg:col-span-3 bg-surface border border-border-strong rounded-xl p-6 space-y-6">
        <div className="h-6 bg-slate-800 rounded w-2/3" />
        <div className="h-10 bg-surface-alt rounded" />
        <div className="h-24 bg-surface-alt rounded" />
        <div className="h-11 bg-blue-900/50 rounded" />
      </div>
    </div>
  );
};
