import React from 'react';
import { Home, Search, Heart, Mail, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = Home,
  title = "No items found",
  description = "There are no records to display at this moment.",
  actionText = null,
  actionLink = null,
  onAction = null,
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-md mx-auto my-6 space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-slate-900 text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      
      {(actionText && (actionLink || onAction)) && (
        <div className="pt-2">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
