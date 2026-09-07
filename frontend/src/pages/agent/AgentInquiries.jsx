import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageSquare, ArrowLeft, Check, Edit2, ArrowUpRight } from 'lucide-react';
import { inquiriesApi } from '../../api/inquiries';
import { formatDate, formatNaira } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';

export default function AgentInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, resolved: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Edit notes state
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const fetchInquiries = () => {
    setLoading(true);
    inquiriesApi.getAgentInquiries({ status: statusFilter })
      .then(data => {
        setInquiries(data.inquiries || []);
        setStats(data.stats || {});
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await inquiriesApi.updateInquiryStatus(id, newStatus);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      alert('Failed to update inquiry status');
    }
  };

  const handleSaveNote = async (id) => {
    try {
      const current = inquiries.find(i => i.id === id);
      await inquiriesApi.updateInquiryStatus(id, current.status, noteText);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, agent_notes: noteText } : i));
      setEditingId(null);
    } catch (err) {
      alert('Failed to save note');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/agent/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Tenant & Student Inquiries
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage inquiries, update contact progress, and record inspection notes.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'new', 'contacted', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition border ${
              statusFilter === st
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st} {stats[st] !== undefined ? `(${stats[st]})` : ''}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading received inquiries...</div>
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No inquiries found"
          description="You don't have any inquiries under this status category."
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{inq.name}</h3>
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
                  <p className="text-xs text-slate-500">
                    Property: <Link to={`/properties/${inq.property_id}`} className="font-semibold text-slate-800 hover:text-emerald-600 underline">{inq.property_title}</Link> ({formatNaira(inq.price_per_year)}/yr)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Received {formatDate(inq.created_at)}
                  </p>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status:</span>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusUpdate(inq.id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <p><strong>Message:</strong> {inq.message}</p>
                {inq.move_in_date && (
                  <p className="text-slate-500"><strong>Preferred Move-In:</strong> {formatDate(inq.move_in_date)}</p>
                )}
              </div>

              {/* Agent Notes */}
              <div className="text-xs">
                {editingId === inq.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add inspection note (e.g. tenant inspecting on Saturday)..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                    />
                    <button
                      onClick={() => handleSaveNote(inq.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-slate-500 bg-white p-1">
                    <span>
                      {inq.agent_notes ? (
                        <span><strong className="text-slate-700">Internal Note:</strong> {inq.agent_notes}</span>
                      ) : (
                        <span className="italic text-slate-400">No agent note added yet</span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(inq.id);
                        setNoteText(inq.agent_notes || '');
                      }}
                      className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{inq.agent_notes ? 'Edit Note' : 'Add Note'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Phone & WhatsApp */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <span>Email: <strong className="text-slate-800">{inq.email}</strong></span>
                  <span>Phone: <strong className="text-slate-800">{inq.phone}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${inq.phone}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${inq.name}, I am following up on your inquiry for ${inq.property_title}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
