import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { formatDate } from '../../utils/formatters';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchAnnouncements = () => {
    setLoading(true);
    adminApi.getAnnouncements()
      .then(data => setAnnouncements(data.announcements || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createAnnouncement({ title, content, target_role: targetRole });
      setTitle('');
      setContent('');
      setSuccess(true);
      fetchAnnouncements();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Announcements
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast official notices to students, residents, and registered agents.
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-emerald-600" />
          <span>Create Announcement</span>
        </h3>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Announcement published successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Matriculation Accommodation Notice..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              >
                <option value="all">Everyone (All Users & Agents)</option>
                <option value="user">Students / Tenants Only</option>
                <option value="agent">Registered Agents Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Content *</label>
            <textarea
              required
              rows={3}
              placeholder="Announcement text..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish Announcement'}</span>
          </button>
        </form>
      </div>

      {/* Announcements History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Active Announcements</h3>
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading notices...</div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{a.title}</h4>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Target: {a.target_role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{a.content}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{formatDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
