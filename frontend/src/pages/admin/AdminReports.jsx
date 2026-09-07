import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, XCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { reportsApi } from '../../api/reports';
import { formatDate } from '../../utils/formatters';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    reportsApi.getReports({ status: statusFilter !== 'all' ? statusFilter : undefined })
      .then(data => {
        setReports(data.reports || []);
        setStats(data.stats || {});
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolveReport = async (reportId, newStatus, suspend = false) => {
    try {
      await reportsApi.updateReport(reportId, newStatus, null, suspend);
      fetchReports();
    } catch (err) {
      alert('Failed to update report');
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
              Reported Accommodation Listings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Investigate suspicious listings, fraud allegations, or already-occupied rooms.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-bold">
        {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl capitalize transition border ${
              statusFilter === st
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st} {stats[st] !== undefined ? `(${stats[st]})` : ''}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No reports found under this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {rep.reason}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      rep.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    Reported Listing: <Link to={`/properties/${rep.property_id}`} className="hover:text-emerald-600 underline">{rep.property_title}</Link> ({rep.property_city})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Filed on {formatDate(rep.created_at)} • Property Status: <strong>{rep.property_verification_status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveReport(rep.id, 'resolved', true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    Suspend Listing & Resolve
                  </button>

                  <button
                    onClick={() => handleResolveReport(rep.id, 'dismissed', false)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition"
                  >
                    Dismiss Report
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <p><strong>Reporter's Description:</strong> {rep.description}</p>
                <p className="text-[11px] text-slate-400">
                  Reporter: {rep.reporter_name || 'Anonymous Student'} ({rep.reporter_email || 'No email'}) • Listing Agent: {rep.agent_name} ({rep.agent_email})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
