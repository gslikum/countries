import React from 'react';

/**
 * EmptyState component displaying "No results found" message when filters return no countries.
 */
export function EmptyState({ searchQuery, selectedRegion, onResetFilters }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">🔍</div>
      <h2>No results found</h2>
      <p className="empty-state-description">
        No countries match your search
        {searchQuery ? ` "${searchQuery}"` : ''}
        {selectedRegion ? ` in region "${selectedRegion}"` : ''}.
      </p>
      {onResetFilters && (
        <button className="reset-filters-btn" onClick={onResetFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default EmptyState;
