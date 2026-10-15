import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Inbox,
  Layers,
  ArrowRight,
  ExternalLink,
  Clock3,
  Phone,
} from "lucide-react";
import WebService from "../../services/web.service";

export default function WebOverviewPage() {
  const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await WebService.getWebRequests();
        setRequests(reqRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const recentRequests = requests.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading Web Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-6 md:p-8 mb-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <Globe className="w-3.5 h-3.5" /> Website Control Center
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Web Management Hub
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
              Manage website leads, customer service requests, web categories, and digital customer touchpoints for Repair Saathi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition"
            >
              <Globe className="w-4 h-4" />
              Visit Website
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Section Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Requests from Web */}
        <Link
          to="/web/requests"
          className="group relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-6 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Inbox className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pendingRequests.length} Pending
              </span>
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
              Requests from Web
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              View all customer service requests, inquiries, and booking leads submitted directly through the website forms. Follow up via WhatsApp and phone call.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-semibold text-blue-400 group-hover:text-blue-300">
            <span>Open Web Requests ({requests.length} total)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        
      </div>

      {/* Recent Web Requests Preview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Latest Web Requests</h3>
          </div>
          <Link
            to="/web/requests"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            View All Requests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No requests yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {req.customerName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      #{req.id}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-300 mt-1">
                    {req.serviceName}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {req.phone}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{req.city || "Patna"}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      req.status === "pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : req.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
