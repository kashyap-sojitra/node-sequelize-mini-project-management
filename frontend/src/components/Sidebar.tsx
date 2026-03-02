'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { href: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { href: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
];

function NavContent({ onNavClick }: { onNavClick: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-surface-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/25">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-surface-900 text-lg font-bold tracking-tight">ProjectFlow</span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100'
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-surface-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900 truncate">{user?.name}</p>
            <p className="text-xs text-surface-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full cursor-pointer"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-surface-200 cursor-pointer"
      >
        <HiOutlineMenu className="w-5 h-5 text-surface-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="w-64 h-full bg-white flex flex-col animate-slide-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-4 p-1 text-surface-400 hover:text-surface-600 cursor-pointer"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
            <NavContent onNavClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-surface-200 flex-col fixed inset-y-0 left-0 z-30">
        <NavContent onNavClick={() => {}} />
      </aside>
    </>
  );
}
