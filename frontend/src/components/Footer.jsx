import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Saapade<span className="text-emerald-500">Lodge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier accommodation sourcing and housing management platform for students of Gateway ICT Polytechnic and residents across Saapade, Ode, Iperu, and Isara Remo, Ogun State.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Listings Only
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties?city=Saapade" className="hover:text-emerald-400 transition">
                  Saapade Hostels
                </Link>
              </li>
              <li>
                <Link to="/properties?property_type=Self-contained" className="hover:text-emerald-400 transition">
                  Self-Contained Flats
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Ode" className="hover:text-emerald-400 transition">
                  Ode Remo Lodgings
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Iperu" className="hover:text-emerald-400 transition">
                  Iperu Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Isara" className="hover:text-emerald-400 transition">
                  Isara Accommodations
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Students & Agents
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/agent-register" className="hover:text-emerald-400 transition">
                  Register as Agent
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">
                  Agent / Tenant Login
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  Saapade Case Study
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition">
                  Report a Scam Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Support & Contact
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Gateway ICT Poly Environs, Saapade, Ogun State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+234 803 111 2233</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>help@saapadeaccommodation.ng</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Accommodation Sourcing Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for ND Computer Science Academic Project</span>
            <span>Case Study: Saapade, Ogun State</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
