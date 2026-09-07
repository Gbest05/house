import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Phone, Mail, Building2, MapPin } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { formatDate } from '../../utils/formatters';

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAgents = () => {
    setLoading(true);
    adminApi.getAgents({ status: statusFilter !== 'all' ? statusFilter : undefined })
      .then(data => setAgents(data.agents || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, [statusFilter]);

  const handleVerify = async (agentId, action) => {
    try {
      await adminApi.verifyAgent(agentId, action);
      fetchAgents();
    } catch (err) {
      alert(`Failed to ${action} agent`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Agent Accreditation & Verification
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review agent agency registrations and grant verified agent badges.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-bold">
        {['all', 'pending', 'approved', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl capitalize transition border ${
              statusFilter === st
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'approved' ? 'Verified' : st}
          </button>
        ))}
      </div>

      {/* Agents List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading registered agents...</div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No agent records found for this category.
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={agent.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                  alt={agent.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{agent.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      agent.verification_status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : agent.verification_status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {agent.verification_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{agent.agency_name}</span>
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{agent.office_address}</span>
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Tel: {agent.phone} • Email: {agent.email} • {agent.properties_count || 0} listings registered
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {agent.verification_status !== 'approved' && (
                  <button
                    onClick={() => handleVerify(agent.id, 'approve')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Agent</span>
                  </button>
                )}

                {agent.verification_status !== 'rejected' && (
                  <button
                    onClick={() => handleVerify(agent.id, 'reject')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
