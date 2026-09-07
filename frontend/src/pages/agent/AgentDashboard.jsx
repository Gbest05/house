import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Home
} from 'lucide-react';
import { propertiesApi } from '../../api/properties';
import { inquiriesApi } from '../../api/inquiries';
import { useAuth } from '../../context/AuthContext';
import { formatNaira, formatDate } from '../../utils/formatters';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, pending: 0, rejected: 0 });
  const [inquiries, setInquiries] = useState([]);
  const [inqStats, setInqStats] = useState({ total: 0, new: 0, contacted: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const agentInfo = user?.agent_info || {};
  const isApproved = agentInfo.verification_status === 'approved' || agentInfo.is_verified === 1;
  const isPending = agentInfo.verification_status === 'pending';
  const isRejected = agentInfo.verification_status === 'rejected';

  useEffect(() => {
    Promise.all([
      propertiesApi.getMyProperties(),
      inquiriesApi.getAgentInquiries()
    ])
      .then(([propData, inqData]) => {
        setProperties(propData.properties || []);
        setStats(propData.stats || {});
        setInquiries(inqData.inquiries || []);
        setInqStats(inqData.stats || {});
      })
      .catch(err => console.error('Failed to load agent dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Agent Header & Verification Status Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name}
                </h1>
                {isApproved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Agent</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {agentInfo.agency_name || 'Independent Agent'} • {agentInfo.office_address || 'Saapade, Ogun State'}
              </p>
            </div>
          </div>

          <Link
            to="/agent/properties/add"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Property</span>
          </Link>
        </div>

        {/* Verification Status Banner */}
        {isPending && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your agent verification is currently <strong>Pending Review</strong> by the platform administrator. You can prepare property listings; they will become verified upon approval.
            </span>
          </div>
        )}

        {isRejected && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Agent verification not approved: {agentInfo.rejection_reason || 'Incomplete credentials'}. Please update your profile.
            </span>
          </div>
        )}
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Properties</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.total || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Live & Available</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.available || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Occupied</span>
          <span className="text-2xl font-extrabold text-slate-600 mt-1 block">{stats.occupied || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{stats.pending || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-medium block">Total Inquiries</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{inqStats.total || 0}</span>
        </div>
      </div>

      {/* Recent Properties & Recent Inquiries Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: My Recent Properties */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Properties</h2>
              <p className="text-xs text-slate-500">Recently listed accommodation units.</p>
            </div>
            <Link to="/agent/properties" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {properties.slice(0, 4).map((prop) => (
                <div key={prop.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prop.primary_image || prop.images?.[0]?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80"}
                      alt={prop.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{prop.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {prop.city} • <strong className="text-emerald-600">{formatNaira(prop.price_per_year)}/yr</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      prop.verification_status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : prop.verification_status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {prop.verification_status}
                    </span>
                    <Link
                      to={`/properties/${prop.id}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                      title="View public page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              You have not listed any properties yet.{' '}
              <Link to="/agent/properties/add" className="text-emerald-600 font-bold underline">
                Add your first property
              </Link>
            </div>
          )}
        </div>

        {/* Right: Recent Inquiries */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Inquiries</h2>
              <p className="text-xs text-slate-500">Students and tenants seeking room inspection.</p>
            </div>
            <Link to="/agent/inquiries" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>Manage ({inqStats.total || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {inquiries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {inquiries.slice(0, 4).map((inq) => (
                <div key={inq.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{inq.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Inquired for: <span className="font-semibold text-slate-700">{inq.property_title}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tel: {inq.phone} • {formatDate(inq.created_at)}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    inq.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : inq.status === 'contacted'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No inquiries received yet. When users submit interest in your properties, they will appear here.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
