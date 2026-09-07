import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  ShieldCheck, 
  Heart, 
  ArrowUpRight, 
  Zap, 
  Droplet 
} from 'lucide-react';
import { formatNaira, getVerificationBadge, getAvailabilityBadge } from '../utils/formatters';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../context/AuthContext';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(property.is_favorited || false);
  const [savingFav, setSavingFav] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (savingFav) return;
    setSavingFav(true);

    try {
      if (isFavorited) {
        await favoritesApi.removeFavorite(property.id);
        setIsFavorited(false);
        if (onFavoriteToggle) onFavoriteToggle(property.id, false);
      } else {
        await favoritesApi.addFavorite(property.id);
        setIsFavorited(true);
        if (onFavoriteToggle) onFavoriteToggle(property.id, true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setSavingFav(false);
    }
  };

  const verification = getVerificationBadge(property.verification_status);
  const availability = getAvailabilityBadge(property.availability_status);
  const imageUrl = property.primary_image || property.images?.[0]?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition duration-200 flex flex-col group">
      
      {/* Top Image Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Verification Badge */}
          {property.verification_status === 'approved' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white shadow-sm pointer-events-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>✓ Verified</span>
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm pointer-events-auto ${verification.bg}`}>
              <span>{verification.label}</span>
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={savingFav}
            aria-label="Save to favorites"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm pointer-events-auto ${
              isFavorited
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Floating Availability and Property Type */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border backdrop-blur-md shadow-xs pointer-events-auto ${availability.bg}`}>
            {availability.label}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-md pointer-events-auto">
            {property.property_type}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatNaira(property.price_per_year)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / year
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition">
            <Link to={`/properties/${property.id}`}>
              {property.title}
            </Link>
          </h3>

          {/* Location */}
          <p className="flex items-center gap-1 text-xs text-slate-500 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{property.area}, {property.city}, Ogun State</span>
          </p>
        </div>

        {/* Facilities Specs */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Bedrooms">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bedrooms} {property.bedrooms > 1 ? 'Rooms' : 'Room'}</span>
            </span>
            <span className="flex items-center gap-1" title="Bathrooms">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bathrooms} {property.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            {property.room_type}
          </span>
        </div>

        {/* View Property CTA */}
        <Link
          to={`/properties/${property.id}`}
          className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-emerald-600 flex items-center justify-center gap-1.5 transition duration-150"
        >
          <span>View Property</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
