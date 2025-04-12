import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function ReturnAssignmentPage({ params }: { params: { id: string } }) {
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
  
  // Zimmet zaten iade edildiyse veya aktif değilse hata ver
  if (assignment.status !== 'ACTIVE') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Bu zimmet için işlem yapılamaz
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Bu zimmet zaten iade edilmiş veya aktif değil.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <Link 
              href={`/assignments/${assignmentId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Zimmet Detayına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // İade işlemi için sunucu aksiyonu
  async function processReturn(formData: FormData) {
    'use server';
    
    const returnNotes = formData.get('returnNotes') as string;
    const deviceCondition = formData.get('deviceCondition') as string;
    
    // Güvenli assignment değeri oluşturuyoruz (notFound çağrıldıysa assignment null olamaz)
    const safeAssignment = assignment!;
    
    try {
      // Transaction başlat
      await prisma.$transaction([
        // Zimmet durumunu güncelle
        prisma.assignment.update({
          where: { id: assignmentId },
          data: {
            status: 'INACTIVE',
            returnDate: new Date(),
            notes: returnNotes ? `İade notları: ${returnNotes}` : null
          },
        }),
        
        // Cihaz durumunu güncelle
        prisma.device.update({
          where: { id: safeAssignment.deviceId },
          data: { 
            status: deviceCondition === 'DAMAGED' ? 'REPAIR' : 'AVAILABLE'
          },
        }),
      ]);
      
      // Başarı durumunda zimmet detay sayfasına yönlendir
      redirect(`/assignments/${assignmentId}`);
    } catch (error: any) {
      // Next.js yönlendirme hatasıysa, tekrar fırlat (gerçek hata değil)
      if (error?.digest) throw error;
      console.error('Cihaz iade edilirken hata:', error);
      throw new Error('Cihaz iade edilirken bir hata oluştu.');
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Cihaz İadesi</h1>
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
            {assignment.employee.name} - {assignment.device.brand} {assignment.device.model}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {assignment.device.type} | {assignment.device.serialNumber}
          </p>
        </div>
        
        <form action={processReturn}>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 mb-4">
                  Cihazı iade aldığınızda, bu cihaz tekrar kullanılabilir duruma gelecektir. İade işlemi tamamlandıktan sonra, cihaz başka bir personele zimmetlenebilir.
                </p>
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
                    value={new Date(assignment.assignedDate).toLocaleDateString('tr-TR')}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
                  İade Tarihi
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="returnDate"
                    id="returnDate"
                    disabled
                    value={new Date().toLocaleDateString('tr-TR')}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="deviceCondition" className="block text-sm font-medium text-gray-700">
                  Cihaz Durumu
                </label>
                <select
                  id="deviceCondition"
                  name="deviceCondition"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  defaultValue="GOOD"
                >
                  <option value="GOOD">İyi Durumda</option>
                  <option value="DAMAGED">Hasarlı</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="returnNotes" className="block text-sm font-medium text-gray-700">
                  İade Notları
                </label>
                <div className="mt-1">
                  <textarea
                    id="returnNotes"
                    name="returnNotes"
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="İade ile ilgili notlar (Cihazın durumuyla ilgili bilgiler, eksik parçalar, vb.)"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cihazı İade Al
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 