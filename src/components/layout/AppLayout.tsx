import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, ClipboardList, LayoutDashboard, Menu, Plus, Settings, Target, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/format';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trades', href: '/trades', icon: ClipboardList },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Strategies', href: '/strategies', icon: Target },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('Trader');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const authUser = data.user;
      setUserName(authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Trader');
      setUserEmail(authUser?.email || '');
    };
    getUser();
  }, []);

  const currentTitle = navItems.find((item) => item.href === location.pathname)?.name ?? 'Dashboard';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] border-r border-slate-800 bg-navy-800/80 p-5 lg:flex lg:flex-col">
          <div className="mb-10">
            <div className="text-xl font-semibold tracking-tight">TradeJournal</div>
            <div className="mt-1 text-xs text-slate-400">Learn • Analyze • Improve</div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ name, href, icon: Icon }) => {
              const active = location.pathname === href;
              return (
                <button
                  key={href}
                  type="button"
                  onClick={() => navigate(href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    active ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/30' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
            Better trades.
            <div className="mt-1 text-slate-400">Bigger goals.</div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-navy-800/80 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-lg border border-slate-700 p-2 text-slate-300 lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-white">{currentTitle}</h1>
                  <p className="text-xs text-slate-400">{formatDate(new Date())}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/trades')}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 shadow-soft hover:bg-sky-400"
                >
                  <Plus size={16} />
                  Add Trade
                </button>
                <div className="hidden items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{userName}</div>
                    <div className="text-[11px] text-slate-400">{userEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-40 bg-slate-950/80 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-72 border-l border-slate-800 bg-navy-800 p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">TradeJournal</div>
                    <div className="text-xs text-slate-400">Learn • Analyze • Improve</div>
                  </div>
                  <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map(({ name, href, icon: Icon }) => (
                    <button
                      key={href}
                      type="button"
                      onClick={() => {
                        navigate(href);
                        setMobileOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
                        location.pathname === href ? 'bg-sky-500/10 text-sky-300' : 'text-slate-300'
                      }`}
                    >
                      <Icon size={18} />
                      {name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
