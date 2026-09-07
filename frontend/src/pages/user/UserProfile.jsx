import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Briefcase, 
  RefreshCw, 
  KeyRound, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import api from '../../api/client';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const idDocInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    agency_name: user?.agent_info?.agency_name || '',
    office_address: user?.agent_info?.office_address || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState(null);
  const [uploadingIdDoc, setUploadingIdDoc] = useState(false);
  const [idDocSuccessMsg, setIdDocSuccessMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Handle agent ID document upload
  const handleIdDocChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Document size must be less than 5MB.');
      return;
    }

    setUploadingIdDoc(true);
    setIdDocSuccessMsg(null);

    const formData = new FormData();
    formData.append('images', file);

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newDocUrl = res.data.url || (res.data.urls && res.data.urls[0]);
      if (newDocUrl) {
        const updateRes = await authApi.updateProfile({ id_card_url: newDocUrl });
        updateUser(updateRes.user);
        setIdDocSuccessMsg('ID Document uploaded successfully!');
        setTimeout(() => setIdDocSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setUploadingIdDoc(false);
      if (idDocInputRef.current) idDocInputRef.current.value = '';
    }
  };

  // Handle direct file upload for profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB max
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarSuccessMsg(null);

    const formData = new FormData();
    formData.append('images', file);

    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAvatarUrl = res.data.url || (res.data.urls && res.data.urls[0]);
      if (newAvatarUrl) {
        setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));

        // Automatically save new avatar to user profile
        const updateRes = await authApi.updateProfile({
          ...profileData,
          avatar: newAvatarUrl,
        });

        updateUser(updateRes.user);
        setAvatarSuccessMsg('Profile photo uploaded and saved successfully!');
        setTimeout(() => setAvatarSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove photo helper
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setUploadingAvatar(true);
    try {
      const updateRes = await authApi.updateProfile({
        ...profileData,
        avatar: '',
      });
      setProfileData(prev => ({ ...prev, avatar: '' }));
      updateUser(updateRes.user);
      setAvatarSuccessMsg('Profile photo removed.');
      setTimeout(() => setAvatarSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to remove photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const res = await authApi.updateProfile(profileData);
      updateUser(res.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      setPwdLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setPwdLoading(false);
      return;
    }

    try {
      await authApi.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, profile picture, contact numbers, and security credentials.
        </p>
      </div>

      {/* Avatar Upload Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Picture / Placeholder */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-100 bg-slate-100 shadow-sm flex items-center justify-center">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt={profileData.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-3xl">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : <User className="w-12 h-12 text-emerald-600" />}
                </div>
              )}
            </div>

            {/* Camera Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition cursor-pointer"
              title="Upload new profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Controls & Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profileData.name || 'User Profile'}</h2>
              <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                {user?.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : user?.role === 'agent' ? <Briefcase className="w-3 h-3 text-emerald-600" /> : <User className="w-3 h-3 text-emerald-600" />}
                {user?.role} Account
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Upload a clear photo (JPG, PNG or WEBP, max 5MB). This photo is displayed on your dashboard, listings, and messages.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </>
                )}
              </button>

              {profileData.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline px-2 py-2"
              >
                {showUrlInput ? 'Hide URL input' : 'Enter image URL instead'}
              </button>
            </div>

            {/* Optional URL input toggle */}
            {showUrlInput && (
              <div className="pt-2 max-w-md">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Or paste a direct web link to an image.
                </span>
              </div>
            )}

            {/* Success toast / message */}
            {avatarSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{avatarSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Details Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Personal Information</span>
          </h3>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email address cannot be changed.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="e.g. 08012345678"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {user?.role === 'agent' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Name</label>
                  <input
                    type="text"
                    value={profileData.agency_name}
                    onChange={(e) => setProfileData({ ...profileData, agency_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
                  <input
                    type="text"
                    value={profileData.office_address}
                    onChange={(e) => setProfileData({ ...profileData, office_address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accreditation ID Document (NIN / Driver's License / Agency ID)
                  </label>
                  <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                    {user?.agent_info?.id_card_url ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Document on file
                        </span>
                        <a
                          href={user.agent_info.id_card_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No ID document uploaded yet. Upload an ID to be verified by administrators.
                      </p>
                    )}

                    <input
                      type="file"
                      ref={idDocInputRef}
                      onChange={handleIdDocChange}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => idDocInputRef.current?.click()}
                      disabled={uploadingIdDoc}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{uploadingIdDoc ? 'Uploading ID Document...' : user?.agent_info?.id_card_url ? 'Upload New / Replace Document' : 'Upload ID Document'}</span>
                    </button>

                    {idDocSuccessMsg && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{idDocSuccessMsg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change / Reset Password Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Change Password</span>
            </h3>
            <Link
              to="/reset-password"
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline"
            >
              <KeyRound className="w-3 h-3" />
              <span>Reset via Email</span>
            </Link>
          </div>

          {pwdMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          {/* Quick reset reminder */}
          <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              If you have forgotten your existing password, you can use the{' '}
              <Link to="/reset-password" className="text-emerald-600 font-bold hover:underline">
                Password Reset Page
              </Link>{' '}
              to reset it with your email.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
