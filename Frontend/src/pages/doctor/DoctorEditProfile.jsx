import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useDoctorAuth } from '../../context/DoctorContext';

const AVAILABILITY_OPTIONS = ['Available', 'Unavailable'];

const StatChip = ({ icon, label, value, color }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm border border-white/60 backdrop-blur-sm`}>
    <span className={`text-lg ${color}`}>{icon}</span>
    <div className="flex flex-col leading-tight">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value || '—'}</span>
    </div>
  </div>
);

const InputField = ({ label, id, type = 'text', value, onChange, readOnly = false, prefix }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 font-medium text-sm">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full py-2.5 ${prefix ? 'pl-7' : 'pl-3'} pr-3 border rounded-xl text-sm transition-all outline-none
          ${readOnly
            ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-200 text-gray-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
          }`}
      />
    </div>
  </div>
);

const DoctorEditProfile = () => {
  const { doctorInfo, doctorToken, updateDoctorInfo } = useDoctorAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: doctorInfo?.name || '',
    specialization: doctorInfo?.specialization || '',
    experience: doctorInfo?.experience || '',
    qualifications: doctorInfo?.qualifications || '',
    location: doctorInfo?.location || '',
    about: doctorInfo?.about || '',
    fee: doctorInfo?.fee ?? '',
    availability: doctorInfo?.availability || 'Available',
    patients: doctorInfo?.patients || '',
    success: doctorInfo?.success || '',
    rating: doctorInfo?.rating ?? '',
  });

  const [previewImage, setPreviewImage] = useState(doctorInfo?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) payload.append(k, v);
      });
      if (imageFile) payload.append('image', imageFile);

      const res = await axios.put('http://localhost:4000/api/doctor/me', payload, {
        headers: {
          Authorization: `Bearer ${doctorToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        updateDoctorInfo(res.data.data);
        showToast('success', 'Profile updated successfully!');
      } else {
        showToast('error', res.data.message || 'Update failed.');
      }
    } catch (err) {
      console.error('Update error:', err);
      showToast('error', err.response?.data?.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name?.charAt(0).toUpperCase() || 'D';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      {/* Card Wrapper */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

        {/* ── Banner ── */}
        <div className="relative h-36 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Availability Toggle top-right */}
          <div className="absolute top-4 right-5 flex items-center gap-2">
            <span className="text-white/80 text-xs font-medium">Availability</span>
            <select
              value={form.availability}
              onChange={handleChange('availability')}
              className="text-xs font-semibold rounded-full px-3 py-1 border-0 outline-none cursor-pointer
                bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="text-gray-800 bg-white">{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Profile image overlapping banner ── */}
        <div className="px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-emerald-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-emerald-700">
                {previewImage
                  ? <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Change photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Name + specialization */}
            <div className="sm:pb-2">
              <h2 className="text-xl font-bold text-gray-900">{form.name || 'Doctor Name'}</h2>
              <p className="text-sm text-emerald-600 font-medium">{form.specialization || 'Specialization'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{doctorInfo?.email || ''}</p>
            </div>

            {/* Edit button push to right on desktop */}
            <div className="sm:ml-auto sm:pb-2">
              <button
                type="submit"
                form="edit-profile-form"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-full shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  : <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Save Changes
                    </>
                }
              </button>
            </div>
          </div>

          {/* ── Stat chips ── */}
          <div className="flex flex-wrap gap-2 mb-6">
            <StatChip icon="👥" label="Patients" value={form.patients} color="text-blue-500" />
            <StatChip icon="⭐" label="Rating" value={form.rating} color="text-yellow-500" />
            <StatChip icon="✅" label="Success" value={form.success} color="text-emerald-600" />
            <StatChip icon="💼" label="Experience" value={form.experience} color="text-indigo-500" />
            <StatChip
              icon={form.availability === 'Available' ? '🟢' : '🔴'}
              label="Status"
              value={form.availability}
              color="text-gray-600"
            />
          </div>
        </div>

        {/* ── Form ── */}
        <form id="edit-profile-form" onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8">
          <div className="border-t border-gray-100 pt-6">

            {/* Section: Basic Info */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <InputField label="Full Name" id="name" value={form.name} onChange={handleChange('name')} />
              <InputField label="Email" id="email" value={doctorInfo?.email || ''} readOnly />
              <InputField label="Specialization" id="specialization" value={form.specialization} onChange={handleChange('specialization')} />
              <InputField label="Location / Hospital" id="location" value={form.location} onChange={handleChange('location')} />
              <InputField label="Qualification" id="qualifications" value={form.qualifications} onChange={handleChange('qualifications')} />
              <InputField label="Years of Experience" id="experience" value={form.experience} onChange={handleChange('experience')} />
            </div>

            {/* Section: Stats (editable) */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Stats & Metrics</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <InputField label="Consultation Fee (₹)" id="fee" type="number" value={form.fee} onChange={handleChange('fee')} prefix="₹" />
              <InputField label="Patients Served" id="patients" value={form.patients} onChange={handleChange('patients')} />
              <InputField label="Success / Completed" id="success" value={form.success} onChange={handleChange('success')} />
              <InputField label="Rating (0–5)" id="rating" type="number" value={form.rating} onChange={handleChange('rating')} />
            </div>

            {/* Section: About */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About / Bio</p>
            <div className="mb-6">
              <label htmlFor="about" className="sr-only">About</label>
              <textarea
                id="about"
                rows={4}
                value={form.about}
                onChange={handleChange('about')}
                placeholder="Write a brief bio about yourself..."
                className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none transition-all"
              />
            </div>

            {/* Mobile Save Button */}
            <div className="sm:hidden">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorEditProfile;
