import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Users, 
  PhoneCall, 
  Sparkles 
} from 'lucide-react';
import SearchHero from '../components/SearchHero';
import PropertyCard from '../components/PropertyCard';
import { PropertyGridSkeleton } from '../components/SkeletonLoader';
import { propertiesApi } from '../api/properties';
import { LOCATIONS } from '../utils/constants';

export default function LandingPage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesApi.getProperties({ limit: 6, featured: 1 })
      .then(data => {
        setFeaturedProperties(data.properties || []);
      })
      .catch(err => {
        console.error('Failed to load featured properties:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const popularLocations = [
    {
      name: 'Saapade',
      desc: 'Gateway ICT Polytechnic campus gates & Orile',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
      count: 'Gateway Poly Area',
    },
    {
      name: 'Ode',
      desc: 'Ode Remo town center and peaceful student residential streets',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
      count: 'Ode Remo',
    },
    {
      name: 'Iperu',
      desc: 'Modern flats along the Sagamu-Iperu corridor',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
      count: 'Iperu Remo',
    },
    {
      name: 'Isara',
      desc: 'Affordable self-contained apartments with easy transit',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      count: 'Isara Remo',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-14 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-white">
        {/* Rich Background Gradients & Ambient Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          
          {/* Tagline Badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saapade & Remo Housing Portal • Case Study: Ogun State</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Find a Place You'll <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Love to Call Home
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover verified student hostels, self-contained rooms, and shared apartments around 
              <strong className="text-white font-bold"> Gateway ICT Polytechnic, Saapade</strong> and neighboring towns in Ogun State.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/properties"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <span>Find Accommodation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/agent-register"
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-sm transition backdrop-blur-sm"
            >
              <span>List Your Property</span>
            </Link>
          </div>

          {/* Hero Search Box */}
          <div className="pt-4 sm:pt-6">
            <SearchHero />
          </div>

          {/* Trust Highlights Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-base sm:text-lg font-black text-emerald-400 block">✓ 100% Verified</span>
              <span className="text-[11px] text-slate-400">Inspected by Admin</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-base sm:text-lg font-black text-white block">3 Mins Walk</span>
              <span className="text-[11px] text-slate-400">To GAPOSA Campus</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-base sm:text-lg font-black text-white block">₦0 Scam Fee</span>
              <span className="text-[11px] text-slate-400">Zero Middleman Fraud</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-base sm:text-lg font-black text-emerald-400 block">OpenStreetMap</span>
              <span className="text-[11px] text-slate-400">Accurate Spatial Pins</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. POPULAR LOCATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Neighborhood Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Locations in Remo
            </h2>
          </div>
          <Link
            to="/properties"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View all areas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularLocations.map((loc) => (
            <Link
              key={loc.name}
              to={`/properties?city=${encodeURIComponent(loc.name)}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 shadow-xs hover:shadow-lg transition duration-200 border border-slate-200"
            >
              <img
                src={loc.image}
                alt={loc.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[11px] font-semibold text-emerald-400">
                  {loc.count}
                </span>
                <h3 className="text-lg font-bold group-hover:text-emerald-300 transition">
                  {loc.name}, Ogun State
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  {loc.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Curated Accommodations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Verified Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Properties physically inspected and verified for student and resident tenancy.
            </p>
          </div>
          <Link
            to="/properties"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Explore All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <PropertyGridSkeleton count={6} />
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No featured listings currently available.</p>
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Transparent Sourcing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How the Platform Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              A hassle-free accommodation experience designed for polytechnic students and registered agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Search & Filter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by distance to Gateway Poly campus, property type (self-contained, flat, hostel), annual price in Naira, and facilities like prepaid light and borehole water.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Inspect with OpenStreetMap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check property photos in our gallery, approximate location pins on Leaflet maps, and clear fee breakdowns without surprise charges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Connect with Verified Agents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit direct inquiries to vetted real estate agents. Track responses from your dashboard and schedule physical inspections safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE SAAPADE LODGEHUB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Safety & Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Eliminating Rental Scams for Students in Ogun State
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every academic session, students arriving at Saapade struggle with fake listings and unregistered middlemen. Our system provides administrative verification for every agent and property before publication.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Admin-Vetted Listings</h4>
                  <p className="text-xs text-slate-500">Only verified listings with valid landlord details receive the green checkmark.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Accurate Naira Pricing</h4>
                  <p className="text-xs text-slate-500">Rent, caution fees, and service charges are clearly itemized in Nigerian Naira.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Community Reporting System</h4>
                  <p className="text-xs text-slate-500">Users can report fake or occupied rooms; administrators investigate and suspend instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"
              alt="Accommodation Interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Trusted Solution</span>
                <p className="text-xs font-extrabold text-slate-900">Gateway ICT Poly Student Lodgings</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                ✓ 100% Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white text-center space-y-5 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Are You a Landlord or Agent in Saapade?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Reach thousands of students and residents looking for quality accommodation. Register your agency, submit your properties, and connect directly with tenants.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/agent-register"
                className="px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition shadow-md"
              >
                Register as Property Agent
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm border border-emerald-600 transition"
              >
                Contact Support Desk
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
