import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const menuItems = [
    { name: 'Ana Sayfa', href: '/', icon: '🏠' },
    { name: 'Çalışanlar', href: '/employees', icon: '👥' },
    { name: 'Cihazlar', href: '/devices', icon: '💻' },
    { name: 'Zimmetler', href: '/assignments', icon: '📋' },
    { name: 'Raporlar', href: '/reports', icon: '📊' },
    { name: 'Ayarlar', href: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white h-full shadow-md hidden lg:block">
      <div className="p-6">
        <div className="flex justify-center items-center h-16">
          <img
            src="/logo.png"
            alt="Şirket Logo"
            className="max-h-full w-auto"
          />
        </div>
        <div className="text-sm text-gray-600 mt-2 text-center">Zimmet Takip Sistemi</div>
      </div>

      <nav className="mt-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                  isActive(item.href) ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 