"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ShieldCheck,
  ArrowLeft,
  User,
  LogOut
} from "lucide-react";

interface VolunteerData {
  id?: string;
  fullName?: string;
  email?: string;
  status?: string;
}

export default function VolunteerDashboard() {
  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("volunteerToken");
    localStorage.removeItem("volunteerUser");
    window.location.href = "/";
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("volunteerUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setTimeout(() => setVolunteer(parsed), 0);
      } catch {
        console.error("Failed to parse volunteer data");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <LayoutDashboard size={26} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Volunteer Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Welcome{volunteer?.fullName ? `, ${volunteer.fullName}` : ""}.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Name:</span> {volunteer?.fullName || "Volunteer"}</p>
                <p><span className="font-medium text-gray-800">Email:</span> {volunteer?.email || "Not available"}</p>
                <p><span className="font-medium text-gray-800">Status:</span> {volunteer?.status || "Approved"}</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-emerald-800">Safe and guided support</p>
              <p className="text-xs text-emerald-700 mt-1 leading-5">
                Volunteers should provide empathetic support, follow guidance, and escalate high-risk cases when necessary.
              </p>
            </div>
          </div>

          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assigned Cases</h3>
                  <p className="text-sm text-gray-500">
                    Review behavior reports and flagged students.
                  </p>
                </div>
              </div>
              <Link href="/volunteer/cases" className="mt-5 w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-white py-3 font-semibold transition flex items-center justify-center">
                View Cases
              </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Guidance Module</h3>
                  <p className="text-sm text-gray-500">
                    Get recommended responses and intervention steps.
                  </p>
                </div>
              </div>
              <Link href="/volunteer/cases" className="mt-5 w-full rounded-2xl bg-violet-600 hover:bg-violet-700 text-white py-3 font-semibold transition flex items-center justify-center">
                Open Guidance
              </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Offline Programs</h3>
                  <p className="text-sm text-gray-500">
                    Check upcoming NGO sessions and support events.
                  </p>
                </div>
              </div>

              <Link href="/events" className="mt-5 w-full md:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 font-semibold transition block text-center">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
