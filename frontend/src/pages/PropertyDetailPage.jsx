import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  ShieldCheck, 
  Heart, 
  Eye, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  Share2, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import PropertyMap from '../components/PropertyMap';
import InquiryModal from '../components/InquiryModal';
import ReportModal from '../components/ReportModal';
import { propertiesApi } from '../api/properties';
import { favoritesApi } from '../api/favorites';
import { formatNaira, formatDate, getVerificationBadge, getAvailabilityBadge } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    propertiesApi.getProperty(id)
      .then(data => {
        setProperty(data.property);
        setIsFavorited(data.property.is_favorited || false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Unable to load property details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      if (isFavorited) {
        await favoritesApi.removeFavorite(property.id);
        setIsFavorited(false);
      } else {
        await favoritesApi.addFavorite(property.id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading accommodation details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
          {error || 'Property not found.'}
        </div>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Listings</span>
        </Link>
      </div>
    );
  }

  const verification = getVerificationBadge(property.verification_status);
  const availability = getAvailabilityBadge(property.availability_status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accommodation Listings</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handleFavoriteToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
              isFavorited
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
            <span>{isFavorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Gallery & Details, Right Sticky Agent Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Gallery, Overview, Facilities, Location */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery */}
          <ImageGallery images={property.images} title={property.title} />

          {/* Title, Badges & Price Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {property.verification_status === 'approved' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>✓ Verified Listing</span>
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${verification.bg}`}>
                    {verification.label}
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${availability.bg}`}>
                  {availability.label}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {property.property_type}
                </span>
              </div>

              {/* View counter & listed date */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1" title="Total Views">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{property.views_count} views</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Listed {formatDate(property.created_at)}</span>
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {property.title}
              </h1>
              <p className="flex items-center gap-1 text-sm text-slate-500 mt-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{property.address}, {property.area}, {property.city}, Ogun State</span>
              </p>
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-emerald-800 block">Annual Rent Price</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  {formatNaira(property.price_per_year)}
                  <span className="text-xs font-medium text-emerald-700 ml-1">/ year</span>
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-emerald-200 sm:pl-6 pt-2 sm:pt-0">
                {property.service_charge > 0 && (
                  <div>
                    <span className="text-slate-400 block">Service Charge</span>
                    <span className="font-bold text-slate-800">{formatNaira(property.service_charge)}</span>
                  </div>
                )}
                {property.caution_deposit > 0 && (
                  <div>
                    <span className="text-slate-400 block">Caution Deposit</span>
                    <span className="font-bold text-slate-800">{formatNaira(property.caution_deposit)}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block">Room Setup</span>
                  <span className="font-bold text-slate-800">{property.room_type}</span>
                </div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Bed className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-500 block">Bedrooms</span>
                <span className="text-sm font-bold text-slate-800">{property.bedrooms}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Bath className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-500 block">Bathrooms</span>
                <span className="text-sm font-bold text-slate-800">{property.bathrooms}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">City / Town</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{property.city}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Availability</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block capitalize">{property.availability_status}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Property Description</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description || "No description provided for this listing."}
            </p>
          </div>

          {/* Facilities & Amenities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Facilities & Amenities</h2>
            {property.facilities && property.facilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{fac.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No specific facilities specified.</p>
            )}
          </div>

          {/* Approximate Location Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Neighborhood Location</h2>
                <p className="text-xs text-slate-500">
                  Approximate vicinity in {property.area}, {property.city} (respects residential privacy).
                </p>
              </div>
            </div>

            <div className="h-72 rounded-xl overflow-hidden">
              <PropertyMap
                properties={[property]}
                selectedProperty={property}
                height="100%"
                zoom={14}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Agent Card & Inquiries */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          
          {/* Agent Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Listing Agent
            </span>

            <div className="flex items-center gap-3.5">
              <img
                src={property.agent_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
                alt={property.agent_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-100"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{property.agent_name}</h3>
                <p className="text-xs text-slate-500">{property.agency_name || "Independent Real Estate Agent"}</p>
                {property.agent_is_verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Agent</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Registered Agent</span>
                )}
              </div>
            </div>

            {/* Direct Contact Links */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              {property.agent_phone && (
                <a
                  href={`tel:${property.agent_phone}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-700 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{property.agent_phone}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Call</span>
                </a>
              )}

              {property.agent_phone && (
                <a
                  href={`https://wa.me/${property.agent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I saw your listing '${property.title}' on Saapade LodgeHub and would like to schedule an inspection.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Agent / Inquire</span>
            </button>

            {/* Landlord Contact (Visible if provided) */}
            {property.landlord_name && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                <span className="font-semibold text-slate-700 block">Caretaker / Landlord Rep:</span>
                <span>{property.landlord_name} ({property.landlord_phone || "Contact via Agent"})</span>
              </div>
            )}

            {/* Report Suspicious Listing Trigger */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Report this listing as fake or occupied</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      <InquiryModal
        property={property}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />

      <ReportModal
        property={property}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

    </div>
  );
}
