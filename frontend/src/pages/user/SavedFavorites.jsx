import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Home } from 'lucide-react';
import { favoritesApi } from '../../api/favorites';
import PropertyCard from '../../components/PropertyCard';
import EmptyState from '../../components/EmptyState';
import { PropertyGridSkeleton } from '../../components/SkeletonLoader';

export default function SavedFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesApi.getFavorites()
      .then(data => setFavorites(data.favorites || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleFavoriteToggle = (id, isFav) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/user/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Saved Accommodation Favorites
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved for inspection
          </p>
        </div>
      </div>

      {loading ? (
        <PropertyGridSkeleton count={6} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="You haven't saved any properties yet"
          description="Click the heart icon on any accommodation listing to bookmark it here for easy comparison."
          actionText="Discover Properties in Saapade"
          actionLink="/properties"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
