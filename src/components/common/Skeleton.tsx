import React from 'react';

export function Skeleton({
  className = '',
  variant = 'rect',
}: {
  className?: string;
  variant?: 'text' | 'circle' | 'rect' | 'header';
}) {
  return (
    <div className={`skeleton skeleton-${variant} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card panel skeleton-card" style={{ borderRadius: '24px' }}>
      <div className="skeleton skeleton-rect" style={{ borderRadius: '16px' }} />
    </div>
  );
}

export function TodayViewSkeleton() {
  return (
    <div className="page-container workspace-today">
      <div className="skeleton skeleton-header hero" style={{ height: '220px', marginBottom: '24px', borderRadius: '32px' }} />
            <section className="today-two-column-layout">
                <div className="today-main-col">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="today-sidebar-col">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </section>
        </div>
    );
}
