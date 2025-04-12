import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';

// Cihaz tipine göre icon belirle
function getDeviceIcon(type: string) {
  switch (type) {
    case 'COMPUTER':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'PHONE':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'TABLET':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
  }
}

// Durum badge'i
function StatusBadge({ status }: { status: string }) {
  let bgColor = '';
  let textColor = '';
  let statusText = '';

  switch (status) {
    case 'AVAILABLE':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Müsait';
      break;
    case 'ASSIGNED':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      statusText = 'Zimmetli';
      break;
    case 'MAINTENANCE':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      statusText = 'Bakımda';
      break;
    case 'RETIRED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Emekli';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      statusText = status;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  );
}

export default async function DeviceDetailPage({ params }: { params: { id: string } }) {
  const deviceId = parseInt(params.id, 10);
  
  if (isNaN(deviceId)) {
    notFound();
  }
  
  // Cihaz detaylarını ve mevcut zimmet bilgilerini çek
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      assignments: {
        include: {
          employee: true
        },
        orderBy: {
          assignedDate: 'desc'
        }
      }
    }
  });
  
  if (!device) {
    notFound();
  }
  
  // Aktif zimmeti bul (eğer varsa)
  const activeAssignment = device.assignments.find(a => a.status === 'ACTIVE');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Cihaz Detayı</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link 
            href="/devices"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cihazlara Dön
          </Link>
          <Link 
            href={`/devices/edit/${deviceId}`}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Cihazı Düzenle
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getDeviceIcon(device.type)}
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {device.brand} {device.model}
              </h3>
              <p className="text-sm text-gray-500">
                {device.type} &middot; <span className="font-mono">{device.serialNumber}</span>
              </p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={device.status} />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Seri Numarası</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{device.serialNumber}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Durum</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <StatusBadge status={device.status} />
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Alım Tarihi</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Aktif Zimmet Bilgisi */}
        {activeAssignment && (
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Aktif Zimmet</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div>
                  <h4 className="text-md font-medium text-blue-900">
                    {activeAssignment.employee.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {activeAssignment.employee.department || 'Departman belirtilmemiş'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    <span className="font-medium">Zimmet Tarihi:</span> {new Date(activeAssignment.assignedDate).toLocaleDateString('tr-TR')}
                  </p>
                  {activeAssignment.notes && (
                    <p className="text-sm text-blue-600 mt-1 whitespace-pre-line">
                      <span className="font-medium">Notlar:</span> {activeAssignment.notes}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <Link
                    href={`/assignments/${activeAssignment.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Zimmet Detayı
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Zimmet Geçmişi */}
        {device.assignments.length > 0 && (
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Zimmet Geçmişi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zimmet Tarihi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İade Tarihi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {device.assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.employee.department || 'Departman belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.returnDate 
                          ? new Date(assignment.returnDate).toLocaleDateString('tr-TR')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={assignment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/assignments/${assignment.id}`} className="text-blue-600 hover:text-blue-900">
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 