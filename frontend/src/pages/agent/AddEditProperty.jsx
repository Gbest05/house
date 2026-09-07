import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  Layers, 
  Image as ImageIcon, 
  UserCheck, 
  Eye, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Upload
} from 'lucide-react';
import { propertiesApi } from '../../api/properties';
import api from '../../api/client';
import { LOCATIONS, PROPERTY_TYPES, ROOM_TYPES } from '../../utils/constants';
import { formatNaira } from '../../utils/formatters';
import PropertyCard from '../../components/PropertyCard';

export default function AddEditProperty() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Active form section/tab
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'pricing' | 'location' | 'facilities' | 'images' | 'landlord' | 'preview'
  const [facilitiesList, setFacilitiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'Self-contained',
    room_type: 'Self-contained',
    price_per_year: '',
    service_charge: '',
    caution_deposit: '',
    city: 'Saapade',
    area: '',
    address: '',
    latitude: 6.9635,
    longitude: 3.6120,
    bedrooms: 1,
    bathrooms: 1,
    landlord_name: '',
    landlord_phone: '',
    availability_status: 'available',
    images: [],
    facility_ids: [],
  });

  // Image upload input state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load facilities & initial data if editing
  useEffect(() => {
    propertiesApi.getFacilities()
      .then(data => setFacilitiesList(data.facilities || []))
      .catch(() => {});

    if (isEdit) {
      setLoading(true);
      propertiesApi.getProperty(id)
        .then(data => {
          const p = data.property;
          setFormData({
            title: p.title || '',
            description: p.description || '',
            property_type: p.property_type || 'Self-contained',
            room_type: p.room_type || 'Self-contained',
            price_per_year: p.price_per_year || '',
            service_charge: p.service_charge || '',
            caution_deposit: p.caution_deposit || '',
            city: p.city || 'Saapade',
            area: p.area || '',
            address: p.address || '',
            latitude: p.latitude || 6.9635,
            longitude: p.longitude || 3.6120,
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            landlord_name: p.landlord_name || '',
            landlord_phone: p.landlord_phone || '',
            availability_status: p.availability_status || 'available',
            images: p.images ? p.images.map(img => img.image_url) : [],
            facility_ids: p.facilities ? p.facilities.map(f => f.id) : [],
          });
        })
        .catch(err => setError('Failed to load property for editing.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Facilities toggle handler
  const handleFacilityToggle = (facId) => {
    setFormData(prev => {
      const exists = prev.facility_ids.includes(facId);
      return {
        ...prev,
        facility_ids: exists
          ? prev.facility_ids.filter(i => i !== facId)
          : [...prev.facility_ids, facId]
      };
    });
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  // Remove Image
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  // Set Primary Image
  const handleSetPrimaryImage = (index) => {
    setFormData(prev => {
      const target = prev.images[index];
      const rest = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: [target, ...rest]
      };
    });
  };

  // Handle local file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      const res = await api.post('/uploads', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.urls && res.data.urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...res.data.urls]
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formData.title || !formData.price_per_year || !formData.area || !formData.address) {
      setError('Please fill in all required fields (Title, Rent Price, Area, Address).');
      setSubmitting(false);
      return;
    }

    try {
      if (isEdit) {
        await propertiesApi.updateProperty(id, formData);
      } else {
        await propertiesApi.createProperty(formData);
      }
      navigate('/agent/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save property listing.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dummy property object for live preview
  const previewProperty = {
    id: 9999,
    title: formData.title || 'Untitled Accommodation Listing',
    property_type: formData.property_type,
    room_type: formData.room_type,
    price_per_year: Number(formData.price_per_year) || 200000,
    area: formData.area || 'Saapade Environs',
    city: formData.city,
    bedrooms: Number(formData.bedrooms) || 1,
    bathrooms: Number(formData.bathrooms) || 1,
    verification_status: 'pending',
    availability_status: formData.availability_status,
    primary_image: formData.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    images: formData.images.map(url => ({ image_url: url })),
    facilities: facilitiesList.filter(f => formData.facility_ids.includes(f.id)),
  };

  const tabs = [
    { id: 'basic', label: '1. Basic Info' },
    { id: 'pricing', label: '2. Pricing' },
    { id: 'location', label: '3. Location' },
    { id: 'facilities', label: '4. Facilities' },
    { id: 'images', label: '5. Images' },
    { id: 'landlord', label: '6. Landlord Details' },
    { id: 'preview', label: '7. Review & Preview' },
  ];

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-500">Loading property editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link to="/agent/properties" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEdit ? 'Edit Property Listing' : 'Add New Accommodation'}
            </h1>
            <p className="text-xs text-slate-500">
              Listing will be reviewed by admin before verified public display.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl transition border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Basic Accommodation Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Palms Executive Self-Contained"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type *</label>
                <select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                >
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Setup *</label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                >
                  {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={1}
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={1}
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Describe distance to Gateway Poly campus, water schedule, security arrangements, rules..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Continue to Pricing →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Pricing & Applicable Fees (in ₦)</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Rent (₦) *</label>
              <input
                type="number"
                required
                min={10000}
                placeholder="e.g. 220000"
                value={formData.price_per_year}
                onChange={(e) => setFormData({ ...formData, price_per_year: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Formatted preview: <strong>{formatNaira(formData.price_per_year)}</strong> / year
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Charge (₦)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 20000 (Security/Water/Sanitation)"
                  value={formData.service_charge}
                  onChange={(e) => setFormData({ ...formData, service_charge: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Caution / Refundable Deposit (₦)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 15000"
                  value={formData.caution_deposit}
                  onChange={(e) => setFormData({ ...formData, caution_deposit: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('location')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Continue to Location →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LOCATION */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Location & Coordinates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Town / City *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium"
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gateway Poly Gate, Orile Saapade"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. 14 Poly Gate Avenue, Behind GAPOSA, Saapade"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 6.9635 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 3.6120 })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('facilities')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Continue to Facilities →
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Select Available Facilities</h3>
            <p className="text-xs text-slate-500">Check all amenities available in or around this accommodation unit.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {facilitiesList.map((fac) => {
                const checked = formData.facility_ids.includes(fac.id);
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => handleFacilityToggle(fac.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition ${
                      checked
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{fac.name}</span>
                    {checked && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('location')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Continue to Images →
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: IMAGES */}
        {activeTab === 'images' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Property Images</h3>
            <p className="text-xs text-slate-500">Upload photos or paste direct image URLs. First image will be used as primary.</p>

            {/* Local file upload input */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <Upload className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Upload photos from device</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
              {uploadingImage && <p className="text-xs text-emerald-600 font-semibold animate-pulse">Uploading photos...</p>}
            </div>

            {/* Image URL input fallback */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste image URL (e.g. Unsplash URL)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                Add URL
              </button>
            </div>

            {/* Uploaded Images List */}
            {formData.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-4/3 border border-slate-200 bg-slate-100">
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="p-1.5 bg-white text-slate-900 rounded-lg text-[10px] font-bold hover:bg-slate-100"
                          title="Make primary image"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No images added yet. A placeholder will be assigned if empty.</p>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('facilities')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('landlord')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Continue to Landlord Details →
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: LANDLORD DETAILS & AVAILABILITY */}
        {activeTab === 'landlord' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Landlord Contact & Availability Status</h3>
            <p className="text-xs text-slate-500">
              Landlord contact is used by administrators during listing verification to confirm authority.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Landlord / Caretaker Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chief Adeleke"
                  value={formData.landlord_name}
                  onChange={(e) => setFormData({ ...formData, landlord_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Landlord Phone Number</label>
                <input
                  type="tel"
                  placeholder="0803 200 4000"
                  value={formData.landlord_phone}
                  onChange={(e) => setFormData({ ...formData, landlord_phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Availability</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="available"
                    checked={formData.availability_status === 'available'}
                    onChange={() => setFormData({ ...formData, availability_status: 'available' })}
                  />
                  <span>Available for Rent</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="occupied"
                    checked={formData.availability_status === 'occupied'}
                    onChange={() => setFormData({ ...formData, availability_status: 'occupied' })}
                  />
                  <span>Currently Occupied</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Proceed to Review & Preview →
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: PREVIEW & SUBMIT */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Listing Card Preview</h3>
              <p className="text-xs text-slate-500">
                This is how your accommodation will appear on the discovery page once approved.
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              <PropertyCard property={previewProperty} />
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Ready to Submit?</p>
              <p>
                Once submitted, this listing will be queued for review by the administrator. Verified listings receive the green verified badge.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('landlord')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                ← Back to Edit
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : isEdit ? 'Update Listing' : 'Submit Property for Verification'}</span>
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
}
