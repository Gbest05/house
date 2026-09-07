import React from 'react';
import { Filter, X, RotateCcw, Search, Check } from 'lucide-react';
import { LOCATIONS, PROPERTY_TYPES, ROOM_TYPES, SORT_OPTIONS, POPULAR_FACILITIES } from '../utils/constants';

export default function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  facilitiesList = [],
  isOpenMobile,
  onCloseMobile
}) {
  const handleCheckboxChange = (category, value) => {
    const current = filters[category] ? filters[category].split(',') : [];
    let updated;
    if (current.includes(value.toString())) {
      updated = current.filter(item => item !== value.toString());
    } else {
      updated = [...current, value.toString()];
    }
    onFilterChange(category, updated.join(','));
  };

  const selectedFacilities = filters.facilities ? filters.facilities.split(',') : [];

  return (
    <aside className={`
      bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs
      ${isOpenMobile ? 'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto shadow-2xl block' : 'hidden lg:block'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Search Keyword
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Poly Gate, Grace Villa..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Town / Location
        </label>
        <select
          value={filters.city || ''}
          onChange={(e) => onFilterChange('city', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium text-slate-800"
        >
          <option value="">All Towns (Saapade & Environs)</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Property Type
        </label>
        <select
          value={filters.property_type || ''}
          onChange={(e) => onFilterChange('property_type', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium text-slate-800"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Room Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Room Type
        </label>
        <select
          value={filters.room_type || ''}
          onChange={(e) => onFilterChange('room_type', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium text-slate-800"
        >
          <option value="">All Room Types</option>
          {ROOM_TYPES.map((rt) => (
            <option key={rt} value={rt}>{rt}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Annual Price (₦)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min (₦)"
            value={filters.min_price || ''}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
          <input
            type="number"
            placeholder="Max (₦)"
            value={filters.max_price || ''}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Availability
        </label>
        <div className="flex gap-2">
          {['all', 'available', 'occupied'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onFilterChange('availability', status)}
              className={`flex-1 py-1.5 text-xs rounded-lg font-medium capitalize border transition ${
                (filters.availability || 'all') === status
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Checkboxes */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Facilities & Amenities
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {facilitiesList.map((fac) => {
            const isChecked = selectedFacilities.includes(fac.id.toString());
            return (
              <label
                key={fac.id}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-emerald-700"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                  isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange('facilities', fac.id)}
                  className="hidden"
                />
                <span>{fac.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium text-slate-800"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

    </aside>
  );
}
