import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Mail, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Megaphone
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { formatNaira, formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [locationDist, setLocationDist] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    Promise.all([
      adminApi.getStats(),
      adminApi.getProperties({ status: 'pending' }),
      adminApi.getAgents({ status: 'pending' }),
    ])
      .then(([statsRes, propsRes, agentsRes]) => {
        setStats(statsRes.stats || {});
        setLocationDist(statsRes.location_distribution || []);
        setPendingProperties(propsRes.properties || []);
        setPendingAgents(agentsRes.agents || []);
      })
      .catch(err => console.error('Failed to load admin dashboard:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApproveProperty = async (id) => {
    try {
      await adminApi.approveProperty(id);
      setPendingProperties(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({
        ...prev,
        pending_properties: Math.max(0, (prev.pending_properties || 1) - 1),
        approved_properties: (prev.approved_properties || 0) + 1
      }));
    } catch (err) {
      alert('Failed to approve property');
    }
  };

  const handleApproveAgent = async (id) => {
    try {
      await adminApi.verifyAgent(id, 'approve');
      setPendingAgents(prev => prev.filter(a => a.id !== id));
      setStats(prev => ({
        ...prev,
        pending_agents: Math.max(0, (prev.pending_agents || 1) - 1),
      }));
    } catch (err) {
      alert('Failed to verify agent');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Super Administrator Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saapade Accommodation Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, property verification, fraud moderation, and agent accreditation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/announcements"
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </Link>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Users</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.total_users || 0}</span>
          <Link to="/admin/users" className="text-[11px] font-bold text-emerald-600 hover:underline mt-2 block">
            Manage Users →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Registered Agents</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.total_agents || 0}</span>
          <span className="text-[11px] text-amber-600 font-semibold block mt-2">
            {stats.pending_agents || 0} pending review
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Listings</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.total_properties || 0}</span>
          <Link to="/admin/properties" className="text-[11px] font-bold text-emerald-600 hover:underline mt-2 block">
            All Listings →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Verified Listings</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.approved_properties || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-2">Publicly active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-xs text-amber-800 font-bold block">Pending Verification</span>
          <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{stats.pending_properties || 0}</span>
          <Link to="/admin/properties?status=pending" className="text-[11px] font-bold text-amber-800 hover:underline mt-2 block">
            Review Queue →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs">
          <span className="text-xs text-rose-800 font-bold block">Reports Filed</span>
          <span className="text-2xl font-extrabold text-rose-700 mt-1 block">{stats.total_reports || 0}</span>
          <Link to="/admin/reports" className="text-[11px] font-bold text-rose-800 hover:underline mt-2 block">
            {stats.pending_reports || 0} open reports →
          </Link>
        </div>
      </div>

      {/* Verification Queues Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Properties Awaiting Review */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">Properties Pending Review</h2>
              </div>
              <p className="text-xs text-slate-500">Require administrator approval before public display.</p>
            </div>
            <Link to="/admin/properties?status=pending" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All ({pendingProperties.length})
            </Link>
          </div>

          {pendingProperties.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingProperties.map((prop) => (
                <div key={prop.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prop.primary_image || prop.images?.[0]?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80"}
                      alt={prop.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{prop.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {prop.city} • Agent: {prop.agent_name} • <strong className="text-emerald-600">{formatNaira(prop.price_per_year)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApproveProperty(prop.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      Approve
                    </button>
                    <Link
                      to={`/admin/properties`}
                      className="px-3 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No properties currently awaiting verification.
            </div>
          )}
        </div>

        {/* Pending Agents Awaiting Approval */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">Agents Pending Verification</h2>
              </div>
              <p className="text-xs text-slate-500">Verify agency business address and contact validity.</p>
            </div>
            <Link to="/admin/agents?status=pending" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All ({pendingAgents.length})
            </Link>
          </div>

          {pendingAgents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingAgents.map((agent) => (
                <div key={agent.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{agent.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Agency: <strong className="text-slate-700">{agent.agency_name}</strong> • Tel: {agent.phone}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Office: {agent.office_address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApproveAgent(agent.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      Approve Agent
                    </button>
                    <Link
                      to="/admin/agents"
                      className="px-3 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No agents currently awaiting verification.
            </div>
          )}
        </div>

      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Accommodations by Geographic Location</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {locationDist.map((loc) => (
            <div key={loc.city} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">{loc.city}, Ogun State</span>
              <span className="text-xl font-extrabold text-slate-900 block">{loc.count} listings</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
