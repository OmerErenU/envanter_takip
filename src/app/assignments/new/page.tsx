import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DeviceStatus } from '@prisma/client';

export default async function NewAssignmentPage({ searchParams }: { searchParams: { employeeId?: string } }) {
  const preselectedEmployeeId = searchParams.employeeId ? parseInt(searchParams.employeeId, 10) : undefined;
  
  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' },
  });
  
  // Eğer preselectedEmployeeId varsa, bu çalışanın detaylarını al
  const preselectedEmployee = preselectedEmployeeId ? 
    await prisma.employee.findUnique({
      where: { id: preselectedEmployeeId },
    }) : null;
  
  const availableDevices = await prisma.device.findMany({
    where: {
      status: 'AVAILABLE',
    },
    orderBy: [
      { type: 'asc' },
      { brand: 'asc' },
      { model: 'asc' },
    ],
  });
  
  async function createAssignment(formData: FormData) {
    'use server';
    
    const employeeId = parseInt(formData.get('employeeId') as string, 10);
    const deviceId = parseInt(formData.get('deviceId') as string, 10);
    const notes = formData.get('notes') as string;
    
    if (!employeeId || !deviceId) {
      throw new Error('Çalışan ve cihaz seçimi zorunludur');
    }
    
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });
    
    if (!device || device.status !== 'AVAILABLE') {
      throw new Error('Seçilen cihaz müsait değil veya bulunamadı');
    }
    
    // Transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      // Create the assignment
      prisma.assignment.create({
        data: {
          employeeId,
          deviceId,
          notes,
          status: 'ACTIVE',
        },
      }),
      // Update device status
      prisma.device.update({
        where: { id: deviceId },
        data: { status: 'ASSIGNED' as DeviceStatus },
      }),
    ]);
    
    redirect('/assignments');
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">
            {preselectedEmployee 
              ? `${preselectedEmployee.name} İçin Yeni Zimmet Oluştur`
              : 'Yeni Zimmet Oluştur'
            }
          </h1>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {availableDevices.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Müsait durumda cihaz bulunmamaktadır.</p>
            <a 
              href="/devices/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Yeni Cihaz Ekle
            </a>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Henüz çalışan kaydı bulunmamaktadır.</p>
            <a 
              href="/employees/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Yeni Çalışan Ekle
            </a>
          </div>
        ) : (
          <form action={createAssignment}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                  Çalışan
                </label>
                <div className="mt-1">
                  <select
                    id="employeeId"
                    name="employeeId"
                    required
                    defaultValue={preselectedEmployeeId}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Çalışan Seçiniz</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
                  Cihaz
                </label>
                <div className="mt-1">
                  <select
                    id="deviceId"
                    name="deviceId"
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Cihaz Seçiniz</option>
                    {availableDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.brand} {device.model} ({device.type}) - SN: {device.serialNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notlar
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Zimmet ile ilgili ek bilgiler..."
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-x-4">
              <a
                href={preselectedEmployeeId ? `/employees/${preselectedEmployeeId}` : "/assignments"}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                İptal
              </a>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Zimmetle
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}