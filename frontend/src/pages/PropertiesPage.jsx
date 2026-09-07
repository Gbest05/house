import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  LayoutGrid, 
  Map as MapIcon, 
  Columns, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Home
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import FilterSidebar from '../components/FilterSidebar';
import { PropertyGridSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { propertiesApi } from '../api/properties';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [properties, setProperties] = useState([]);
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [viewMode, setViewMode] = useState('split'); // 'grid' | 'split' | 'map'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current filters from URL search params
  const filters = {
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    property_type: searchParams.get('property_type') || '',
    room_type: searchParams.get('room_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    availability: searchParams.get('availability') || 'all',
    facilities: searchParams.get('facilities') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
  };

  // Load facilities for filter sidebar
  useEffect(() => {
    propertiesApi.getFacilities()
      .then(data => setFacilitiesList(data.facilities || []))
      .catch(() => {});
  }, []);

  // Fetch properties whenever filters or page changes
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const queryParams = {
          ...filters,
          page,
          limit: viewMode === 'split' ? 6 : 9,
        };
        // Clean empty keys
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === '' || queryParams[key] === null) {
            delete queryParams[key];
          }
        });

        const data = await propertiesApi.getProperties(queryParams);
        setProperties(data.properties || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, page, viewMode]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setPage(1);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Accommodation in Saapade
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {total} {total === 1 ? 'property' : 'properties'} available across Saapade, Ode, Iperu, and Isara
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            facilitiesList={facilitiesList}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />
        </div>

        {/* Right Listings / Map Container */}
        <div className="lg:col-span-3 space-y-6">
          
          {loading ? (
            <PropertyGridSkeleton count={viewMode === 'split' ? 6 : 9} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Home}
              title="No accommodation found"
              description="No properties matched your selected filters. Try broadening your location, property type, or price range."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              {/* VIEW MODE 1: GRID VIEW */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}

              {/* VIEW MODE 2: SPLIT MAP & LISTINGS VIEW */}
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Listings Left */}
                  <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>

                  {/* Leaflet Map Right */}
                  <div className="xl:col-span-5 h-[650px] sticky top-24">
                    <PropertyMap properties={properties} height="100%" />
                  </div>
                </div>
              )}

              {/* VIEW MODE 3: FULL MAP VIEW */}
              {viewMode === 'map' && (
                <div className="h-[650px]">
                  <PropertyMap properties={properties} height="100%" />
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Showing page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pNum = i + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                            page === pNum
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
