import React from 'react';

/**
 * SearchInput component providing live text search by country name.
 */
export function SearchInput({ value, onChange }) {
  return (
    <div className="search-input-wrapper">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        type="text"
        id="search-input"
        className="search-input"
        placeholder="Search for a country..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search for a country..."
      />
    </div>
  );
}

export default SearchInput;
