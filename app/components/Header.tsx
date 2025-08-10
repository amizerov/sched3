'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Функция для определения активности ссылки
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Стили для активной ссылки
  const getActiveLinkStyle = (path: string) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#d97706' : '#333',
    fontWeight: isActive(path) ? 600 : 500,
    backgroundColor: isActive(path) ? '#e5e5e5' : 'transparent',
    padding: '8px 12px',
    borderRadius: '6px',
    border: isActive(path) ? '1px solid #cccccc' : '1px solid transparent',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer'
  });

  // Стили для домика (главная страница)
  const getHomeIconStyle = () => ({
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
    borderRadius: '6px',
    backgroundColor: isActive('/') ? '#e5e5e5' : 'transparent',
    border: isActive('/') ? '1px solid #cccccc' : '1px solid transparent',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer'
  });

  return (
    <header style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd', padding: '12px 0' }}>
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={getHomeIconStyle()}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
              <path d="M3 11L12 4L21 11" stroke={isActive('/') ? '#d97706' : '#333'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 11V20H19V11" stroke={isActive('/') ? '#d97706' : '#333'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <nav style={{ display: 'flex', gap: 8 }}>
            <Link href="/loads" style={getActiveLinkStyle('/loads')}>Учебный план</Link>
            <Link href="/sched" style={getActiveLinkStyle('/sched')}>Расписание</Link>
            {pathname.startsWith('/series') && (
              <Link href="/series" style={getActiveLinkStyle('/series')}>Серии</Link>
            )}
          </nav>
        </div>
        <div>
          <Link href="/login" style={getActiveLinkStyle('/login')}>Логин</Link>
        </div>
      </div>
    </header>
  );
}