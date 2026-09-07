import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, GraduationCap, Building2, CheckCircle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Case Study & Background
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Accommodation Sourcing Management System
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Case Study: <strong>Saapade, Ogun State, Nigeria</strong>
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-6 shadow-xs leading-relaxed text-sm text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">Project Overview & Problem Statement</h2>
        <p>
          Saapade is a prominent semi-urban town located in Ogun State, Nigeria, famously hosting <strong>Gateway ICT Polytechnic Saapade (GAPOSA)</strong>. Every academic semester, thousands of newly admitted ND1 and HND1 students travel from various parts of Nigeria to secure suitable off-campus accommodation.
        </p>
        <p>
          Historically, students and new residents faced significant challenges:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Prevalence of unregistered middlemen charging exorbitant inspection fees.</li>
          <li>Fraudulent listings of rooms that were already occupied or non-existent.</li>
          <li>Inaccurate rental pricing with sudden hidden charges at payment point.</li>
          <li>Lack of map visualization to understand distance from the polytechnic campus gate.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 pt-4">The Solution: Saapade LodgeHub</h2>
        <p>
          This web application bridges the gap by providing a modern, secure, and transparent digital marketplace. Registered property agents undergo verification by platform administrators before their listings are published with the <strong>✓ Verified Property</strong> checkmark.
        </p>
        <p>
          Key architectural highlights include:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Role-Based Authorization
            </h4>
            <p className="text-xs text-slate-500">Separation of concerns between Students/Tenants, Agents, and Administrators.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              OpenStreetMap Integration
            </h4>
            <p className="text-xs text-slate-500">Interactive Leaflet maps for spatial awareness around Saapade and Remo corridors.</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 pt-4">Academic Context</h2>
        <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
          This system was designed and developed as a complete National Diploma (ND) Computer Science software capstone project, adhering to professional web engineering, clean code, responsive design, and database normalization principles.
        </p>

        <div className="pt-4 flex items-center justify-center">
          <Link
            to="/properties"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <span>Explore Properties Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
