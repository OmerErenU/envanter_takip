import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const assignmentId = parseInt(params.id, 10);
  
  if (isNaN(assignmentId)) {
    notFound();
  }
  
  // Zimmet detaylarını ve ilişkili tüm verileri çek
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      employee: true,
      device: true
    }
  });
  
  if (!assignment) {
    notFound();
  }
  
  // Zimmet durumuna göre renk ve metin belirleme
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'RETURNED':
        return 'bg-blue-100 text-blue-800';
      case 'LOST':
        return 'bg-red-100 text-red-800';
      case 'DAMAGED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'RETURNED':
        return 'İade Edildi';
      case 'LOST':
        return 'Kayıp';
      case 'DAMAGED':
        return 'Hasarlı';
      default:
        return status;
    }
  };
  
  // Cihaz tipine göre icon seçme
  const getDeviceIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('bilgisayar') || lowerType.includes('laptop')) {
      return '💻';
    } else if (lowerType.includes('telefon')) {
      return '📱';
    } else if (lowerType.includes('tablet')) {
      return '📱';
    } else if (lowerType.includes('monitör')) {
      return '🖥️';
    } else if (lowerType.includes('yazıcı')) {
      return '🖨️';
    } else {
      return '📦';
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Zimmet Detayı</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link 
            href="/assignments"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Listeye Dön
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ana Detaylar */}
        <div className="col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-3xl">
                {getDeviceIcon(assignment.device.type)}
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {assignment.device.brand} {assignment.device.model}
                </h3>
                <p className="text-sm text-gray-500">{assignment.device.type}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              </div>
            </div>
            
            <div className="border-b border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Zimmet Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}
                  </dd>
                </div>
                {assignment.returnDate && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">İade Tarihi</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(assignment.returnDate).toLocaleDateString('tr-TR')}
                    </dd>
                  </div>
                )}
                <div className={`${assignment.returnDate ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                  <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {assignment.notes || "-"}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cihaz Detayları</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Marka / Model</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.device.brand} {assignment.device.model}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tür</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.device.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Seri Numarası</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {assignment.device.serialNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Satın Alma Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(assignment.device.purchaseDate).toLocaleDateString('tr-TR')}
                  </dd>
                </div>
                {/* IMEI bilgisi genellikle notes alanında saklanır */}
                {assignment.notes && assignment.notes.match(/IMEI|imei|İmei|imei no/i) && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">IMEI / Ek Bilgiler</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {assignment.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
        
        {/* Çalışan Bilgisi */}
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Zimmet Sahibi</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Çalışan Bilgileri</p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-2xl font-medium">
                  {assignment.employee.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{assignment.employee.name}</h4>
                  <p className="text-sm text-gray-500">{assignment.employee.department}</p>
                </div>
              </div>
              
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.employee.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Departman</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.employee.department}</dd>
                </div>
                <div className="pt-4">
                  <Link
                    href={`/employees/${assignment.employee.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Çalışan Detayı
                  </Link>
                </div>
              </dl>
            </div>
          </div>
          
          {/* İşlemler Kartı */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">İşlemler</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="space-y-3">
                {assignment.status === 'ACTIVE' && (
                  <div className="mt-4 flex gap-2">
                    <Link 
                      href={`/assignments/edit/${assignmentId}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Zimmeti Düzenle
                    </Link>
                    <Link 
                      href={`/assignments/return/${assignmentId}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      İade Al
                    </Link>
                  </div>
                )}
                
                <Link
                  href={`/devices/${assignment.device.id}`}
                  className="inline-flex w-full justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cihaz Detayı
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 