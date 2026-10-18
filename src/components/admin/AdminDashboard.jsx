import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, CalendarDays, ChevronRight, Clock3, DollarSign, LayoutDashboard, LogOut, Menu, Scissors, Star, UserRound, Users, X } from 'lucide-react';
import { adminApi, api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { AdminGoogleSignIn } from './AdminGoogleSignIn';
import { BarbersManagement } from './BarbersManagement';
import { ServicesManagement } from './ServicesManagement';
import { AppointmentsManagement } from './AppointmentsManagement';
import { ScheduleConfig } from './ScheduleConfig';

const nav = [
  ['overview', 'overview', LayoutDashboard], ['barbers', 'barbers', Users], ['services', 'services', Scissors], ['appointments', 'appointments', CalendarDays], ['schedules', 'schedules', Clock3],
];

export function AdminDashboard({ onExit }) {
  const { t } = useTranslation();
  const [section, setSection] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState('checking');
  const [user, setUser] = useState(null);
  const authenticated = useCallback((profile) => { setUser(profile); setAuth('ready'); }, []);

  useEffect(() => {
    const token = localStorage.getItem('atelier_admin_token');
    if (!token) { setAuth('signed-out'); return; }
    api.get('/admin/auth/me').then(({ data }) => { setUser(data); setAuth('ready'); }).catch(() => {
      localStorage.removeItem('atelier_admin_token'); setAuth('signed-out');
    });
  }, []);

  useEffect(() => {
    if (auth !== 'ready') return;
    adminApi.overview().then(({ data }) => { setOverview(data); setError(''); }).catch(() => setError(t('client.error')));
  }, [auth]);

  const logout = async () => {
    try { await api.post('/admin/auth/logout'); } catch { /* remove the local credential even if the server is offline */ }
    localStorage.removeItem('atelier_admin_token'); setUser(null); setAuth('signed-out');
  };

  if (auth === 'checking') return <main className="grid min-h-screen place-items-center bg-[#0b0b0b] text-sm text-[#aaa]">{t('admin.loading')}</main>;
  if (auth !== 'ready') return <><div className="fixed right-5 top-5 z-10"><LanguageSwitcher /></div><AdminGoogleSignIn onAuthenticated={authenticated} /></>;

  const content = { barbers: <BarbersManagement />, services: <ServicesManagement />, appointments: <AppointmentsManagement />, schedules: <ScheduleConfig />, overview: <Overview data={overview} /> }[section];
  return <div className="min-h-screen bg-[#0b0b0b] text-[#f3eee5] lg:flex">
    <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-72 border-r border-[#292929] bg-[#111] p-6 transition-transform lg:static lg:translate-x-0`}>
      <div className="mb-12 flex items-center justify-between"><div className="font-mono text-sm tracking-[.25em]"><span className="block text-[#999]">ATELIER</span><b className="font-normal text-[#d7ad58]">NOIR / ADMIN</b></div><button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
      <p className="mb-4 font-mono text-[10px] tracking-[.2em] text-[#766e62]">{t('admin.workspace')}</p>
      <div className="space-y-1">{nav.map(([id, key, Icon]) => <button key={id} onClick={() => { setSection(id); setMobileOpen(false); }} className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition ${section === id ? 'bg-[#2a2419] text-[#e0b867]' : 'text-[#999] hover:bg-[#191919] hover:text-white'}`}><Icon size={17}/>{t(`admin.${key}`)}{section === id && <ChevronRight className="ml-auto" size={15}/>}</button>)}</div>
      <div className="absolute bottom-6 left-6 right-6 space-y-4 border-t border-[#292929] pt-5"><button onClick={onExit} className="flex items-center gap-3 text-sm text-[#aaa] hover:text-white">{t('admin.backToSite')}</button><button onClick={logout} className="flex items-center gap-3 text-sm text-[#888] hover:text-white"><LogOut size={16}/>{t('admin.signOut')}</button></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-20 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <main className="min-w-0 flex-1"><header className="flex min-h-20 items-center justify-between gap-4 border-b border-[#292929] px-5 py-3 sm:px-8"><button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu/></button><div><p className="font-mono text-[10px] tracking-[.2em] text-[#d7ad58]">{t('admin.controlCenter')}</p><h1 className="mt-1 font-display text-xl sm:text-2xl">{t(`admin.${section}`)}</h1></div><div className="flex items-center gap-3"><LanguageSwitcher/><div className="hidden text-right sm:block"><p className="text-sm">{user?.name || 'Atelier Admin'}</p><p className="text-xs text-[#777]">{t('admin.administrator')}</p></div><div className="grid h-9 w-9 place-items-center rounded-full bg-[#d7ad58] text-xs font-bold text-[#19140b]">{user?.name?.slice(0,1)?.toUpperCase() || 'A'}</div></div></header><div className="p-5 sm:p-8">{error && <div className="mb-5 border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}{content}</div></main>
  </div>;
}

function Overview({ data }) {
  const { t, language } = useTranslation();
  const stats = data?.stats || { revenue: { daily: 0, monthly: 0, yearly: 0 }, appointments: { total: 0, pending: 0, confirmed: 0, cancelled: 0 } };
  const cards = [[t('admin.revenueToday'), stats.revenue.daily, DollarSign], [t('admin.revenueMonth'), stats.revenue.monthly, BarChart3], [t('admin.revenueYear'), stats.revenue.yearly, Star]];
  const statuses = [[t('admin.total'), stats.appointments.total, 'text-white'], [t('admin.confirmed'), stats.appointments.confirmed, 'text-emerald-400'], [t('admin.pending'), stats.appointments.pending, 'text-[#d7ad58]']];
  return <div className="space-y-8"><div className="grid gap-4 md:grid-cols-3">{cards.map(([label, value, Icon]) => <div className="border border-[#292929] bg-[#141414] p-5" key={label}><div className="flex justify-between text-[#888]"><span className="text-sm">{label}</span><Icon size={18} className="text-[#d7ad58]"/></div><p className="mt-7 font-display text-3xl">{Number(value).toLocaleString(language)} €</p><p className="mt-2 text-xs text-emerald-400">+12,4% {t('admin.periodChange')}</p></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><section className="border border-[#292929] bg-[#141414] p-5"><div className="mb-6 flex items-center justify-between"><div><p className="font-mono text-[10px] tracking-[.18em] text-[#d7ad58]">{t('admin.performance')}</p><h2 className="mt-2 text-lg">{t('admin.appointmentStatus')}</h2></div><span className="text-xs text-[#777]">{t('admin.last30Days')}</span></div><div className="grid grid-cols-3 gap-3">{statuses.map(([label, value, tone]) => <div className="bg-[#1b1b1b] p-4" key={label}><p className="text-xs text-[#777]">{label}</p><p className={`mt-3 text-2xl ${tone}`}>{value}</p></div>)}</div><div className="mt-7 flex h-36 items-end gap-2 border-b border-[#333] px-3">{[35,55,45,80,62,72,92,58,73,66,88,96,78,84].map((height, i) => <div key={i} className="flex-1 rounded-t bg-[#d7ad58] opacity-70" style={{ height: `${height}%` }}/>)}</div></section>
    <section className="border border-[#292929] bg-[#141414] p-5"><p className="font-mono text-[10px] tracking-[.18em] text-[#d7ad58]">{t('admin.topServices')}</p><div className="mt-6 space-y-5">{(data?.top_services || []).map((service, i) => <div key={service.name}><div className="mb-2 flex justify-between text-sm"><span>{i + 1}. {service.name}</span><span className="text-[#aaa]">{service.bookings} {t('admin.bookings')}</span></div><div className="h-1.5 bg-[#292929]"><div className="h-full bg-[#d7ad58]" style={{ width: `${Math.min(100, service.bookings * 8)}%` }}/></div></div>)}</div></section></div>
    <section className="border border-[#292929] bg-[#141414] p-5"><p className="font-mono text-[10px] tracking-[.18em] text-[#d7ad58]">{t('admin.topBarbers')}</p><div className="mt-5 grid gap-3 sm:grid-cols-3">{(data?.top_barbers || []).map((barber) => <div className="flex items-center gap-3 bg-[#1b1b1b] p-3" key={barber.id}><div className="grid h-10 w-10 place-items-center rounded-full bg-[#312b22] text-[#d7ad58]"><UserRound size={18}/></div><div><p className="text-sm">{barber.name}</p><p className="flex items-center gap-1 text-xs text-[#999]"><Star size={12} className="fill-[#d7ad58] text-[#d7ad58]"/> {barber.rating} · {barber.bookings} {t('admin.appointments')}</p></div></div>)}</div></section></div>;
}
