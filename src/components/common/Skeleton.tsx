import React from 'react';

export function Skeleton({
    className = '',
    variant = 'rect'
}: {
    className?: string;
    variant?: 'text' | 'circle' | 'rect';
}) {
    return (
        <div className={`skeleton skeleton-${variant} ${className}`} />
    );
}

export function SkeletonCard() {
    return (
        <div className="card panel skeleton-card">
            <div className="skeleton skeleton-rect" />
        </div>
    );
}

export function TodayViewSkeleton() {
    return (
        <div className="page-container workspace-today">
            <header className="hero card skeleton-card" style={{ height: '220px', marginBottom: '24px' }} />
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
