"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";

export default function VolunteerLogin() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_BASE = 'http://localhost:4000/api';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/volunteer/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("volunteerToken", data.token);
            localStorage.setItem("volunteerUser", JSON.stringify(data.volunteer || {}));

            router.push("/volunteer/dashboard");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 px-4 py-6">
            <div className="max-w-md mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                            <LogIn size={26} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Volunteer Login</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Access your dashboard, assigned cases, and support tools.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                Email
                            </label>
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 bg-gray-50">
                                <Mail size={18} className="text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="bg-transparent outline-none w-full text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                Password
                            </label>
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 bg-gray-50">
                                <Lock size={18} className="text-gray-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="bg-transparent outline-none w-full text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 transition disabled:opacity-60"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-500 mt-5">
                        New volunteer?{" "}
                        <Link
                            href="/volunteer/register"
                            className="text-emerald-700 font-semibold"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
