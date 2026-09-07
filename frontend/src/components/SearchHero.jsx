import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, DollarSign, Layers } from 'lucide-react';
import { LOCATIONS, PROPERTY_TYPES, ROOM_TYPES } from '../utils/constants';

export default function SearchHero() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [roomType, setRoomType] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (city && city !== 'all') params.append('city', city);
    if (propertyType && propertyType !== 'all') params.append('property_type', propertyType);
    if (roomType && roomType !== 'all') params.append('room_type', roomType);

    if (priceRange) {
      if (priceRange === 'under_150k') {
        params.append('max_price', '150000');
      } else if (priceRange === '150k_250k') {
        params.append('min_price', '150000');
        params.append('max_price', '250000');
      } else if (priceRange === '250k_400k') {
        params.append('min_price', '250000');
        params.append('max_price', '400000');
      } else if (priceRange === 'above_400k') {
        params.append('min_price', '400000');
      }
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 sm:p-5 backdrop-blur-md">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Location Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Where to stay?
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">All Locations (Saapade & surrounds)</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Type Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              Property Type
            </label>
            <div className="relative">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">All Property Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Price Range
            </label>
            <div className="relative">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">Any Annual Price</option>
                <option value="under_150k">Under ₦150,000</option>
                <option value="150k_250k">₦150,000 - ₦250,000</option>
                <option value="250k_400k">₦250,000 - ₦400,000</option>
                <option value="above_400k">Above ₦400,000</option>
              </select>
            </div>
          </div>

          {/* Room Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Room Type
            </label>
            <div className="relative">
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">Any Room Setup</option>
                {ROOM_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Submit Button Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Verified student hostels near Gateway ICT Polytechnic & Remo area</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            <span>Search Accommodation</span>
          </button>
        </div>
      </form>
    </div>
  );
}
