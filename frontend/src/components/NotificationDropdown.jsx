import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  Home, 
  AlertCircle, 
  Info,
  Loader2
} from 'lucide-react';
import { notificationsApi } from '../api/notifications';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z');
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
    
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

function getNotifIcon(type) {
  switch (type) {
    case 'inquiry':
    case 'inquiry_received':
    case 'inquiry_status':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'verification':
    case 'agent_approved':
    case 'agent_rejected':
      return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    case 'property':
    case 'property_approved':
    case 'property_rejected':
      return <Home className="w-4 h-4 text-indigo-500" />;
    case 'alert':
    case 'warning':
    case 'report':
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    default:
      return <Info className="w-4 h-4 text-emerald-500" />;
  }
}

export default function NotificationDropdown({ 
  unreadCount, 
  setUnreadCount,
  isOpen, 
  onToggle, 
  onClose,
  isMobile = false 
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications when opened
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationsApi.getNotifications()
        .then((res) => {
          setNotifications(res.notifications || []);
          if (typeof setUnreadCount === 'function') {
            setUnreadCount(res.unread_count || 0);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch notifications:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, setUnreadCount]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      if (typeof setUnreadCount === 'function') {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationsApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        if (typeof setUnreadCount === 'function') {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }

    onClose();

    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleDelete = async (e, id, wasUnread) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread && typeof setUnreadCount === 'function') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`relative p-2 rounded-xl transition cursor-pointer ${
          isOpen
            ? 'bg-emerald-50 text-emerald-600'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`
            bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150
            ${
              isMobile
                ? 'fixed left-4 right-4 top-[72px] max-w-sm mx-auto'
                : 'absolute right-0 mt-2 w-80 sm:w-96'
            }
          `}
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  We'll notify you when there's an update on your inquiries, listings, or account.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.is_read;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative flex items-start gap-3 p-3.5 transition cursor-pointer ${
                      isUnread
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/80'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 group-hover:bg-white transition shrink-0">
                      {getNotifIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, notif.id, isUnread)}
                      className="absolute top-3.5 right-3 p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
