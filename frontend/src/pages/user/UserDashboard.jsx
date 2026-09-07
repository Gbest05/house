import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, User, ShieldCheck, ArrowRight, Search, Clock } from 'lucide-react';
import { favoritesApi } from '../../api/favorites';
import { inquiriesApi } from '../../api/inquiries';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';
import { formatDate, formatNaira } from '../../utils/formatters';

export default function UserDashboard() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      favoritesApi.getFavorites(),
      inquiriesApi.getMyInquiries()
    ])
      .then(([favData, inqData]) => {
        setFavorites(favData.favorites || []);
        setInquiries(inqData.inquiries || []);
      })
      .catch(err => console.error('Failed to load user dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Student Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.email} • {user?.phone || 'No phone set'}
            </p>
          </div>
        </div>

        <Link
          to="/properties"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse Accommodation</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Saved Favorites</span>
            <span className="text-2xl font-extrabold text-slate-900">{favorites.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Sent Inquiries</span>
            <span className="text-2xl font-extrabold text-slate-900">{inquiries.length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Target Location</span>
            <span className="text-base font-bold text-slate-900">Saapade & Environs</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Saved Properties Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Saved Properties</h2>
            <p className="text-xs text-slate-500">Quickly inspect or review your bookmarked lodgings.</p>
          </div>
          <Link to="/user/favorites" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View all ({favorites.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavoriteToggle={(id, isFav) => {
                  if (!isFav) setFavorites(prev => prev.filter(p => p.id !== id));
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
            You haven't saved any accommodation listings yet.{' '}
            <Link to="/properties" className="text-emerald-600 font-bold underline">
              Browse available rooms in Saapade
            </Link>
          </div>
        )}
      </div>

      {/* Inquiries History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Property Inquiries</h2>
            <p className="text-xs text-slate-500">Track agent replies and scheduled room inspections.</p>
          </div>
          <Link to="/user/inquiries" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Full Inquiries History
          </Link>
        </div>

        {inquiries.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {inquiries.slice(0, 4).map((inq) => (
              <div key={inq.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={inq.property_image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80"}
                    alt={inq.property_title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      <Link to={`/properties/${inq.property_id}`} className="hover:text-emerald-600">
                        {inq.property_title}
                      </Link>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Agent: {inq.agent_name} ({inq.agent_phone}) • {formatNaira(inq.price_per_year)}/yr
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${
                    inq.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : inq.status === 'contacted'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {inq.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(inq.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No inquiries submitted yet. When you find an accommodation you like, click "Contact Agent".
          </div>
        )}
      </div>

    </div>
  );
}
