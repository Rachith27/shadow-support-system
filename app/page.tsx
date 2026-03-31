'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-10 animate-float-slow">🌊</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-float-slow animation-delay-2000">✨</div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 animate-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-premium text-4xl mb-2">
          💙
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-brand-navy">
            You don&apos;t have to face this <span className="text-brand-teal">alone</span>.
          </h1>
          <p className="text-xl text-text-muted max-w-lg mx-auto leading-relaxed">
            A safe, anonymous space where your voice matters. No accounts, no judgment, just support.
          </p>
        </div>

        <div className="pt-4">
          <button
            id="start-anonymously"
            onClick={() => router.push('/chat')}
            type="button"
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-brand-navy rounded-2xl hover:bg-slate-800 shadow-xl shadow-brand-navy/20 hover:shadow-2xl hover:shadow-brand-navy/30 hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 w-full h-full shimmer-bg opacity-20 group-hover:opacity-40 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Start Anonymously
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm font-medium text-text-muted">
            <span className="flex items-center gap-2">🛡️ End-to-End Private</span>
            <span className="flex items-center gap-2">🔒 No PII Stored</span>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-text-muted/40 transition-all">
          <Link href="/volunteer/login" className="hover:text-emerald-600">Volunteer Hub</Link>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <Link href="/admin" className="hover:text-amber-600">Admin Console</Link>
        </div>
        <p className="text-sm text-text-muted/60 font-medium tracking-wide">
          No account. No name. No judgment.
        </p>
      </footer>
    </main>
  );
}
