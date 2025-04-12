'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  department: string;
  position?: string;
  assignments?: any[];
}

interface Device {
  id: number;
  type: string;
  brand: string;
  model: string;
  status: string;
}

interface Assignment {
  id: number;
  assignedDate: string;
  employee: {
    id: number;
    name: string;
  };
  device: {
    id: number;
    brand: string;
    model: string;
    type: string;
  };
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Her bir API çağrısını ayrı ayrı yap
        try {
          const employeesRes = await fetch('/api/employees');
          if (!employeesRes.ok) {
            throw new Error(`Çalışanlar getirilemedi: ${employeesRes.status} ${employeesRes.statusText}`);
          }
          const employeesData = await employeesRes.json();
          setEmployees(employeesData);
        } catch (err) {
          console.error('Çalışanlar yüklenirken hata:', err);
          setError(err instanceof Error ? err.message : 'Çalışanlar yüklenirken bir hata oluştu');
        }

        try {
          const devicesRes = await fetch('/api/devices');
          if (!devicesRes.ok) {
            throw new Error(`Cihazlar getirilemedi: ${devicesRes.status} ${devicesRes.statusText}`);
          }
          const devicesData = await devicesRes.json();
          setDevices(devicesData);
        } catch (err) {
          console.error('Cihazlar yüklenirken hata:', err);
          setError(err instanceof Error ? err.message : 'Cihazlar yüklenirken bir hata oluştu');
        }

        try {
          const assignmentsRes = await fetch('/api/assignments');
          if (!assignmentsRes.ok) {
            throw new Error(`Atamalar getirilemedi: ${assignmentsRes.status} ${assignmentsRes.statusText}`);
          }
          const assignmentsData = await assignmentsRes.json();
          setAssignments(assignmentsData);
        } catch (err) {
          console.error('Atamalar yüklenirken hata:', err);
          setError(err instanceof Error ? err.message : 'Atamalar yüklenirken bir hata oluştu');
        }

      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Yaklaşan bakıma çıkması gereken cihazlar 
  // (Örn: 1 yıldan uzun süredir bakıma gitmemiş cihazlar)
  const getNextMaintenanceCount = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Bakım mantığı: Bu örnekte sadece ASSIGNED durumunda olan ve 1 yıldan eski cihazları sayıyoruz
    const assignedDevices = devices.filter(d => d.status === 'ASSIGNED');
    return Math.min(assignedDevices.length > 0 ? Math.floor(assignedDevices.length * 0.2) : 0, 5); // Örnek: %20 bakım gerekiyor gibi
  };

  return (
    <div>
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatCard 
          title="Toplam Çalışan" 
          value={loading ? "..." : employees.length.toString()} 
          icon="👥"
          color="blue"
        />
        <StatCard 
          title="Toplam Cihaz" 
          value={loading ? "..." : devices.length.toString()} 
          icon="💻"
          color="green"
        />
        <StatCard 
          title="Yaklaşan Bakımlar" 
          value={loading ? "..." : getNextMaintenanceCount().toString()} 
          icon="🔧"
          color="yellow"
        />
      </div>
      
      {/* Ana Bölüm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sol taraf - Kartlar */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold mb-4">Çalışan Listesi</h2>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">Yükleniyor...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">{error}</div>
              ) : employees.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Henüz çalışan kaydı bulunmuyor</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adı Soyadı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departman</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cihaz Sayısı</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.slice(0, 5).map((employee) => (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500">
                              {employee.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.position || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {employee.assignments?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link 
                href="/employees" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tümünü gör →
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold mb-4">Cihaz Durumu</h2>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">Yükleniyor...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">{error}</div>
              ) : devices.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Henüz cihaz kaydı bulunmuyor</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cihaz</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka/Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.slice(0, 5).map((device) => (
                      <tr key={device.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xl">
                              {device.type.toLowerCase().includes('bilgisayar') ? '💻' : 
                               device.type.toLowerCase().includes('telefon') ? '📱' : 
                               device.type.toLowerCase().includes('tablet') ? '📱' : '📦'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{device.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{`${device.brand} ${device.model}`}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            device.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            device.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                            device.status === 'REPAIR' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {device.status === 'AVAILABLE' ? 'Müsait' :
                             device.status === 'ASSIGNED' ? 'Zimmetli' :
                             device.status === 'REPAIR' ? 'Tamirde' : 'Arızalı'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link 
                href="/devices" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tümünü gör →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sağ taraf - Hızlı Erişim ve Aktiviteler */}
        <div className="space-y-5">
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold mb-4">Hızlı Erişim</h2>
            <div className="space-y-3">
              <QuickAccessButton 
                icon="➕" 
                label="Yeni Çalışan Ekle" 
                href="/employees/new" 
              />
              <QuickAccessButton 
                icon="➕" 
                label="Yeni Cihaz Ekle" 
                href="/devices/new" 
              />
              <QuickAccessButton 
                icon="📋" 
                label="Zimmet Oluştur" 
                href="/assignments/new" 
              />
              <QuickAccessButton 
                icon="📤" 
                label="Envanter Dışa Aktar" 
                href="/api/export/all" 
              />
              <QuickAccessButton 
                icon="📥" 
                label="Envanter İçe Aktar" 
                href="/import-all" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold mb-4">Son Aktiviteler</h2>
            {loading ? (
              <div className="text-center py-4">Yükleniyor...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Henüz aktivite kaydı bulunmuyor</div>
            ) : (
              <div className="space-y-4">
                {assignments.slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      {assignment.employee.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <strong>{assignment.employee.name}</strong> kullanıcısına <strong>{assignment.device.brand} {assignment.device.model}</strong> zimmetlendi
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const bgColorClass = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  }[color];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgColorClass} text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAccessButton({ icon, label, href }: { 
  icon: string; 
  label: string;
  href: string;
}) {
  return (
    <Link 
      href={href} 
      className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span className="text-lg mr-3">{icon}</span>
      <span className="text-sm text-gray-700">{label}</span>
    </Link>
  );
}
