import { Settings, Target, Clock, ArrowLeft } from 'lucide-react';
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-4">
        <div className="mb-8 flex items-center gap-2 text-blue-900">
          <Settings size={24} />
          <h2 className="text-xl font-bold">Cài đặt hệ thống</h2>
        </div>

        <nav className="space-y-2 flex-1">
          <Link
            to="/settings/target"
            className={cn(
              'flex items-center gap-3 p-3 rounded-md transition-colors',
              location.pathname === '/settings/target'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <Target size={18} />
            Chỉ tiêu Kinh doanh
          </Link>

          <Link
            to="/settings/time"
            className={cn(
              'flex items-center gap-3 p-3 rounded-md transition-colors',
              location.pathname === '/settings/time'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <Clock size={18} />
            Tiến độ Thời gian
          </Link>
        </nav>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            <ArrowLeft size={18} />
            Về Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
