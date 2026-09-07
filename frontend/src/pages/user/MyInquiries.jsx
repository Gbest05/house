import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Phone, Calendar, ArrowUpRight } from 'lucide-react';
import { inquiriesApi } from '../../api/inquiries';
import { formatDate, formatNaira } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';

export default function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inquiriesApi.getMyInquiries()
      .then(data => setInquiries(data.inquiries || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/user/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Sent Inquiries
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries and direct communication with verified agents.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading your inquiries...</div>
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No inquiries sent yet"
          description="When you find an accommodation you like, click 'Contact Agent' to request an inspection."
          actionText="Find Accommodation"
          actionLink="/properties"
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={inq.property_image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80"}
                    alt={inq.property_title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      <Link to={`/properties/${inq.property_id}`} className="hover:text-emerald-600 flex items-center gap-1">
                        <span>{inq.property_title}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {inq.property_area}, {inq.property_city} • <strong className="text-emerald-600">{formatNaira(inq.price_per_year)}/yr</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    inq.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : inq.status === 'contacted'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {inq.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(inq.created_at)}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p><strong className="text-slate-800">Your Message:</strong> {inq.message}</p>
                {inq.move_in_date && (
                  <p><strong className="text-slate-800">Preferred Date:</strong> {formatDate(inq.move_in_date)}</p>
                )}
                {inq.agent_notes && (
                  <p className="pt-1 text-emerald-700 font-semibold border-t border-slate-200/60 mt-1">
                    Agent Note: {inq.agent_notes}
                  </p>
                )}
              </div>

              {/* Agent contact trigger */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Agent: <strong className="text-slate-800">{inq.agent_name}</strong></span>
                {inq.agent_phone && (
                  <a
                    href={`tel:${inq.agent_phone}`}
                    className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{inq.agent_phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
