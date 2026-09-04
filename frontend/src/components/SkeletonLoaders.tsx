import React from 'react';

export const QueueTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="w-full bg-surface border border-rule rounded-xs overflow-hidden animate-pulse">
      <div className="h-10 bg-canvas border-b border-rule flex items-center px-4 gap-4">
        <div className="h-3 bg-rule rounded-xs w-20" />
        <div className="h-3 bg-rule rounded-xs w-48" />
        <div className="h-3 bg-rule rounded-xs w-24 ml-auto" />
      </div>
      <div className="divide-y divide-rule/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3 px-4 flex items-center justify-between gap-4 h-[42px]">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-1 h-5 bg-rule rounded-xs" />
              <div className="h-3 bg-rule rounded-xs w-1/3" />
            </div>
            <div className="h-3 bg-rule rounded-xs w-24" />
            <div className="h-3 bg-rule rounded-xs w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CaseWorkspaceSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-20 bg-surface border border-rule rounded-xs" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-surface border border-rule rounded-xs" />
          <div className="h-44 bg-surface border border-rule rounded-xs" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-36 bg-surface border border-rule rounded-xs" />
          <div className="h-36 bg-surface border border-rule rounded-xs" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-40 bg-surface border border-rule rounded-xs" />
        <div className="h-64 bg-surface border border-rule rounded-xs" />
      </div>
    </div>
  );
};
