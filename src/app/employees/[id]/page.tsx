import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const employeeId = parseInt(params.id, 10);
  
  if (isNaN(employeeId)) {
    notFound();
  }
  
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      assignments: {
        include: {
          device: true
        }
      }
    }
  });
  
  if (!employee) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Çalışan Detayı</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link 
            href={`/employees/${employee.id}/edit`}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Düzenle
          </Link>
          <Link 
            href={`/assignments/new?employeeId=${employee.id}`}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Cihaz Zimmetle
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-2xl font-medium">
              {employee.name.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.department}</p>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">E-posta</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Departman</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.department}</dd>
            </div>
          </dl>
        </div>
        
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Zimmetli Cihazlar</h3>
          
          {employee.assignments.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">
              Bu çalışana ait zimmetli cihaz bulunmamaktadır.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cihaz Türü
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marka / Model
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seri No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zimmet Tarihi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employee.assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xl">
                            {assignment.device.type.toLowerCase().includes('bilgisayar') ? '💻' : 
                             assignment.device.type.toLowerCase().includes('telefon') ? '📱' : 
                             assignment.device.type.toLowerCase().includes('tablet') ? '📱' : '📦'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{assignment.device.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.device.brand} {assignment.device.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.device.serialNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/assignments/${assignment.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 