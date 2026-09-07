import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  ArrowLeft
} from 'lucide-react';
import { propertiesApi } from '../../api/properties';
import { formatNaira, formatDate, getVerificationBadge } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProperties = () => {
    setLoading(true);
    propertiesApi.getMyProperties({ status: statusFilter })
      .then(data => setProperties(data.properties || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const handleToggleAvailability = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'occupied' : 'available';
    try {
      await propertiesApi.toggleAvailability(id, nextStatus);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, availability_status: nextStatus } : p));
    } catch (err) {
      alert('Failed to toggle availability status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing? This action cannot be undone.')) return;
    try {
      await propertiesApi.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete property.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/agent/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Manage Listed Properties
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View, edit, toggle availability, and track admin review statuses.
          </p>
        </div>

        <Link
          to="/agent/properties/add"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'approved', 'pending', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition border ${
              statusFilter === st
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'approved' ? 'Verified' : st}
          </button>
        ))}
      </div>

      {/* Properties Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading your properties...</div>
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="You don't have any properties matching this filter criteria."
          actionText="Add New Accommodation"
          actionLink="/agent/properties/add"
        />
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const verification = getVerificationBadge(prop.verification_status);
            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={prop.primary_image || prop.images?.[0]?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=150&q=80"}
                    alt={prop.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${verification.bg}`}>
                        {verification.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prop.availability_status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {prop.availability_status === 'available' ? 'Available' : 'Occupied'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {prop.property_type}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {prop.area}, {prop.city} • <strong className="text-emerald-600">{formatNaira(prop.price_per_year)}/yr</strong>
                    </p>

                    {/* Rejection Note Display if rejected */}
                    {prop.verification_status === 'rejected' && prop.rejection_reason && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800">
                        <strong>Admin Feedback:</strong> {prop.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(prop.id, prop.availability_status)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
                    title="Toggle available/occupied"
                  >
                    {prop.availability_status === 'available' ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Mark Occupied</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                        <span>Mark Available</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/properties/${prop.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/agent/properties/edit/${prop.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition"
                    title="Edit property"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
