import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  X,
  ArrowLeft
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { formatNaira, formatDate, getVerificationBadge } from '../../utils/formatters';
import { LOCATIONS } from '../../utils/constants';

export default function AdminProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [properties, setProperties] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [cityFilter, setCityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Rejection Modal State
  const [rejectingProp, setRejectingProp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchProperties = () => {
    setLoading(true);
    adminApi.getProperties({
      status: statusFilter,
      city: cityFilter,
      search: search.trim() || undefined,
    })
      .then(data => setProperties(data.properties || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, cityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveProperty(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, verification_status: 'approved', rejection_reason: null } : p));
    } catch (err) {
      alert('Failed to approve property');
    }
  };

  const handleSuspend = async (id) => {
    try {
      await adminApi.suspendProperty(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, verification_status: 'suspended' } : p));
    } catch (err) {
      alert('Failed to suspend property');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    setRejectLoading(true);
    try {
      await adminApi.rejectProperty(rejectingProp.id, rejectionReason.trim());
      setProperties(prev => prev.map(p => p.id === rejectingProp.id ? { ...p, verification_status: 'rejected', rejection_reason: rejectionReason.trim() } : p));
      setRejectingProp(null);
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject property');
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Property Verification & Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review, approve, reject with reason, or suspend accommodation listings.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto text-xs font-bold">
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition border whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'approved' ? 'Verified' : st}
            </button>
          ))}
        </div>

        {/* City & Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none font-medium text-slate-700"
          >
            <option value="all">All Towns</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search title, agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Properties Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading listings...</div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No properties match the selected status or query.
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const verification = getVerificationBadge(prop.verification_status);
            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
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
                      <span className="text-[10px] text-slate-400">
                        {prop.property_type} • {prop.room_type}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {prop.area}, {prop.city} • <strong className="text-emerald-600">{formatNaira(prop.price_per_year)}/yr</strong>
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Agent: <strong className="text-slate-800">{prop.agent_name}</strong> ({prop.agency_name || 'Individual'}) • Tel: {prop.agent_phone}
                    </p>

                    {prop.rejection_reason && (
                      <p className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-200 inline-block">
                        <strong>Rejection Reason:</strong> {prop.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                  <Link
                    to={`/properties/${prop.id}`}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                    title="View public page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {prop.verification_status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(prop.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {prop.verification_status !== 'rejected' && (
                    <button
                      onClick={() => {
                        setRejectingProp(prop);
                        setRejectionReason('');
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {prop.verification_status !== 'suspended' && (
                    <button
                      onClick={() => handleSuspend(prop.id)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal with Reason */}
      {rejectingProp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setRejectingProp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">
              Reject Listing: {rejectingProp.title}
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a clear reason for rejecting this property. The reason will be sent to the agent ({rejectingProp.agent_name}) so they can correct and resubmit the listing.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Incomplete landlord contact information or unverified street address..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none resize-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingProp(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
