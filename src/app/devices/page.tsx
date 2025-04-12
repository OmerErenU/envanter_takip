'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Device {
  id: number;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei?: string;
  hostname?: string;
  uuid?: string;
  status: string;
  notes?: string;
  assignments: {
    employee: {
      name: string;
      department: string;
    };
  }[];
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/devices');
        if (!response.ok) {
          throw new Error('Cihazlar getirilemedi');
        }
        const data = await response.json();
        setDevices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cihazlar</h1>
        <Link href="/devices/new" className="bg-blue-500 text-white px-4 py-2 rounded">
          Yeni Cihaz Ekle
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka/Model</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seri No</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostname</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UUID</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zimmetli Kişi</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölüm</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{device.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{`${device.brand} ${device.model}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{device.serialNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{device.imei || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{device.hostname || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{device.uuid || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    device.status === 'ASSIGNED' ? 'bg-green-100 text-green-800' :
                    device.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {device.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {device.assignments[0]?.employee.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {device.assignments[0]?.employee.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/devices/${device.id}`} className="text-blue-600 hover:text-blue-900">
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 