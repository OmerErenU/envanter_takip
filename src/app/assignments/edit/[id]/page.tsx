import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AssignmentStatus, DeviceStatus } from '@prisma/client';

export default async function EditAssignmentPage({ params }: { params: { id: string } }) {
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
  
  // notFound() çağrıldığı için TypeScript assignment'ın null olmadığını bilmeli
  // ama bilmiyorsa, burada non-null assertion kullanabiliriz
  const safeAssignment = assignment!;
  
  // Form gönderildiğinde çalışacak sunucu aksiyonu
  async function updateAssignment(formData: FormData) {
    'use server';
    
    const notes = formData.get('notes') as string;
    const status = formData.get('status') as AssignmentStatus;
    
    try {
      // Zimmeti güncelle
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          notes,
          status,
        },
      });
      
      // Zimmet durumu değiştiyse cihaz durumunu da güncelle
      if (status !== safeAssignment.status) {
        let deviceStatus: DeviceStatus = 'ASSIGNED'; // Varsayılan durum
        
        if (status === 'RETURNED') {
          deviceStatus = 'AVAILABLE';
        } else if (status === 'LOST' || status === 'DAMAGED') {
          deviceStatus = 'RETIRED';
        }
        
        await prisma.device.update({
          where: { id: safeAssignment.deviceId },
          data: { status: deviceStatus },
        });
      }
      
      // Başarı durumunda zimmet detay sayfasına yönlendir
      redirect(`/assignments/${assignmentId}`);
    } catch (error) {
      console.error('Zimmet güncellenirken hata:', error);
      throw new Error('Zimmet güncellenirken bir hata oluştu.');
    }
  }
  
  // İade düğmesi için sunucu aksiyonu
  async function returnDevice() {
    'use server';
    
    try {
      // Transaction başlat
      await prisma.$transaction([
        // Zimmet durumunu güncelle
        prisma.assignment.update({
          where: { id: assignmentId },
          data: {
            status: 'RETURNED',
            returnDate: new Date(),
          },
        }),
        
        // Cihaz durumunu güncelle
        prisma.device.update({
          where: { id: safeAssignment.deviceId },
          data: { status: 'AVAILABLE' },
        }),
      ]);
      
      // Başarı durumunda zimmet detay sayfasına yönlendir
      redirect(`/assignments/${assignmentId}`);
    } catch (error) {
      console.error('Cihaz iade edilirken hata:', error);
      throw new Error('Cihaz iade edilirken bir hata oluştu.');
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Zimmet Düzenle</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link 
            href={`/assignments/${assignmentId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            İptal
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {safeAssignment.employee.name} - {safeAssignment.device.brand} {safeAssignment.device.model}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {safeAssignment.device.type} | {safeAssignment.device.serialNumber}
          </p>
        </div>
        
        <form action={updateAssignment}>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Zimmet Durumu
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  defaultValue={safeAssignment.status}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="RETURNED">İade Edildi</option>
                  <option value="LOST">Kayıp</option>
                  <option value="DAMAGED">Hasarlı</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="assignedDate" className="block text-sm font-medium text-gray-700">
                  Zimmet Tarihi
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="assignedDate"
                    id="assignedDate"
                    disabled
                    value={new Date(safeAssignment.assignedDate).toLocaleDateString('tr-TR')}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notlar
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={safeAssignment.notes || ''}
                    placeholder="Zimmetle ilgili notlar (IMEI, Teknik özellikler, vb.)"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Değişiklikleri Kaydet
            </button>
            
            {safeAssignment.status === 'ACTIVE' && (
              <button
                type="submit"
                formAction={returnDevice}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cihazı İade Al
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 