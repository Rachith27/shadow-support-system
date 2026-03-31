"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  ShieldAlert, 
  Calendar, 
  Baby, 
  LayoutDashboard, 
  UserCircle,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  LifeBuoy
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => {
    // Check auth state on client
    const checkAuth = () => {
      setIsAdmin(!!localStorage.getItem('adminToken'));
      setIsVolunteer(!!localStorage.getItem('volunteerToken'));
    };
    
    checkAuth();
    // Listen for storage changes (in case of login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Safe Chat', href: '/chat', icon: MessageSquare },
    { name: 'Observatory', href: '/behavior/report', icon: ShieldAlert },
    { name: 'Events', href: '/events', icon: Calendar },
  ];

  const authLinks = [];
  if (isAdmin) {
    authLinks.push({ name: 'Admin Console', href: '/admin', icon: ShieldCheck });
  }
  if (isVolunteer) {
    authLinks.push({ name: 'Volunteer Panel', href: '/volunteer/dashboard', icon: LayoutDashboard });
  }
  if (!isAdmin && !isVolunteer) {
    authLinks.push({ name: 'Volunteer Hub', href: '/volunteer/login', icon: UserCircle });
    authLinks.push({ name: 'Admin Portal', href: '/admin', icon: ShieldCheck });
  }

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('volunteerToken');
    localStorage.removeItem('volunteerUser');
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 h-16 md:h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
             <ShieldCheck size={24} />
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900 hidden sm:block">
            SSS <span className="text-emerald-600">SafeSpace</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${isActive(link.href) 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-2" />
          {authLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2
                ${isActive(link.href) 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          ))}
          {(isAdmin || isVolunteer) && (
            <button 
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-full text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all duration-200 flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}

          {/* New Global Emergency/Volunteer Button */}
          {!isAdmin && !isVolunteer && (
             <Link 
               href="/chat?directVolunteer=true"
               className="ml-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:scale-105 transition-all flex items-center gap-2 animate-pulse"
             >
               <LifeBuoy size={16} />
               Need Help?
             </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-2xl z-40 transition-all duration-300 border-t border-gray-100 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
         <div className="p-6 flex flex-col gap-2">
            {[...navLinks, ...authLinks].map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 text-lg font-extrabold transition
                  ${isActive(link.href) 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className={`p-2 rounded-xl ${isActive(link.href) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <link.icon size={22} />
                </div>
                {link.name}
              </Link>
            ))}
            {(isAdmin || isVolunteer) && (
              <button 
                onClick={handleLogout}
                className="w-full mt-4 p-5 rounded-[1.5rem] flex items-center gap-4 text-lg font-extrabold text-rose-600 hover:bg-rose-50 transition"
              >
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <LogOut size={22} />
                </div>
                Logout
              </button>
            )}
         </div>
      </div>
    </nav>
  );
}
