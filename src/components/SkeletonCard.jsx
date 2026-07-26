import React from 'react';

/**
 * SkeletonCard component rendering shimmer placeholder state during data fetching.
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-box skeleton-flag" />
      <div className="skeleton-body">
        <div className="skeleton-box skeleton-title" />
        <div className="skeleton-box skeleton-line" />
        <div className="skeleton-box skeleton-line" />
        <div className="skeleton-box skeleton-line" />
      </div>
    </div>
  );
}

/**
 * SkeletonGrid component rendering multiple skeleton cards during initial loading.
 */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export default SkeletonCard;
