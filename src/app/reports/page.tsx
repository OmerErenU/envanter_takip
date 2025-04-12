import { prisma } from '@/lib/db';
import { DeviceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  // Get device statistics
  const deviceStats = await prisma.device.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });
  
  // Get device type statistics 
  const deviceTypeStats = await prisma.device.groupBy({
    by: ['type'],
    _count: {
      id: true,
    },
  });
  
  // Get active assignments count
  const activeAssignmentsCount = await prisma.assignment.count({
    where: {
      status: 'ACTIVE',
    },
  });
  
  // Get employee count
  const employeeCount = await prisma.employee.count();
  
  // Get recent assignments
  const recentAssignments = await prisma.assignment.findMany({
    take: 5,
    orderBy: {
      assignedDate: 'desc',
    },
    include: {
      employee: true,
      device: true,
    },
  });
  
  // Format device status counts for the chart
  const deviceStatusCounts = {
    available: 0,
    assigned: 0,
    maintenance: 0,
    retired: 0,
  };
  
  deviceStats.forEach((stat) => {
    if (stat.status === 'AVAILABLE') {
      deviceStatusCounts.available = stat._count.id;
    } else if (stat.status === 'ASSIGNED') {
      deviceStatusCounts.assigned = stat._count.id;
    } else if (stat.status === 'MAINTENANCE') {
      deviceStatusCounts.maintenance = stat._count.id;
    } else if (stat.status === 'RETIRED') {
      deviceStatusCounts.retired = stat._count.id;
    }
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Raporlar ve İstatistikler</h1>
        <p className="mt-2 text-gray-700">
          Zimmet ve envanter durumlarına ilişkin genel istatistikler ve raporlar
        </p>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Toplam Cihaz" 
          value={deviceStats.reduce((acc, curr) => acc + curr._count.id, 0)} 
          description="Envanterdeki cihaz sayısı" 
          color="bg-blue-500"
        />
        <StatCard 
          title="Aktif Zimmetler" 
          value={activeAssignmentsCount} 
          description="Halen çalışanlarda olan cihazlar" 
          color="bg-green-500"
        />
        <StatCard 
          title="Çalışan Sayısı" 
          value={employeeCount} 
          description="Sistemde kayıtlı çalışanlar" 
          color="bg-purple-500"
        />
        <StatCard 
          title="Müsait Cihazlar" 
          value={deviceStatusCounts.available} 
          description="Zimmetlenmeye hazır cihazlar" 
          color="bg-yellow-500"
        />
      </div>
      
      {/* Device Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cihaz Durumu Dağılımı</h2>
          <div className="flex items-center justify-around">
            <StatusPill label="Müsait" count={deviceStatusCounts.available} color="bg-green-100 text-green-800" />
            <StatusPill label="Zimmetli" count={deviceStatusCounts.assigned} color="bg-blue-100 text-blue-800" />
            <StatusPill label="Bakımda" count={deviceStatusCounts.maintenance} color="bg-yellow-100 text-yellow-800" />
            <StatusPill label="Emekli" count={deviceStatusCounts.retired} color="bg-gray-100 text-gray-800" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cihaz Tipi Dağılımı</h2>
          <div className="flex flex-wrap gap-4 justify-around">
            {deviceTypeStats.map((type) => (
              <div key={type.type} className="text-center">
                <div className="text-2xl font-bold">{type._count.id}</div>
                <div className="text-gray-500 text-sm">{type.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Assignments */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Son Zimmet İşlemleri</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Çalışan</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cihaz</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAssignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-gray-500 text-center">
                    Henüz zimmet kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                recentAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {assignment.employee.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {assignment.device.brand} {assignment.device.model}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        assignment.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : assignment.status === 'RETURNED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status === 'ACTIVE' 
                          ? 'Aktif' 
                          : assignment.status === 'RETURNED'
                          ? 'İade Edildi'
                          : assignment.status === 'LOST'
                          ? 'Kayıp'
                          : 'Hasarlı'
                        }
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, color }: { 
  title: string; 
  value: number; 
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`${color} p-3 rounded-md`}>
              <div className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
  );
}

function StatusPill({ label, count, color }: { 
  label: string; 
  count: number;
  color: string; 
}) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold mb-1">{count}</div>
      <span className={`${color} py-1 px-2 rounded-full text-xs font-medium`}>
        {label}
      </span>
    </div>
  );
} 