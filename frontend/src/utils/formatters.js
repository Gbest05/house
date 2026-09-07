/**
 * Formats a number as Nigerian Naira currency string.
 * Example: 250000 -> ₦250,000
 */
export function formatNaira(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

/**
 * Formats an ISO date string into a readable format.
 * Example: "2026-09-07T12:00:00" -> "Sep 7, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Returns badge styling based on verification status.
 */
export function getVerificationBadge(status) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return { label: '✓ Verified Property', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'pending':
      return { label: 'Pending Review', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'rejected':
      return { label: 'Rejected', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'suspended':
      return { label: 'Suspended', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    default:
      return { label: status || 'Draft', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
}

/**
 * Returns badge styling based on availability status.
 */
export function getAvailabilityBadge(status) {
  if (status?.toLowerCase() === 'available') {
    return { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: 'Occupied', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
}
