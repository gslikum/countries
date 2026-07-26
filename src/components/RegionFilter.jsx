import React from 'react';

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

/**
 * RegionFilter component providing dropdown selection for country region filtering.
 */
export function RegionFilter({ value, onChange }) {
  return (
    <div className="region-filter-wrapper">
      <select
        id="region-filter"
        className="region-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by Region"
      >
        <option value="">Filter by Region</option>
        {REGIONS.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RegionFilter;
