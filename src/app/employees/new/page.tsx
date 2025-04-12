import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default function NewEmployeePage() {
  async function createEmployee(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    
    if (!name || !email || !department) {
      throw new Error('Ad, email ve departman zorunludur');
    }
    
    await prisma.employee.create({
      data: {
        name,
        email,
        department,
      },
    });
    
    redirect('/employees');
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Yeni Çalışan Ekle</h1>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form action={createEmployee}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Örn: Ömer Eren"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta Adresi
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="ornek@motherson.com"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Departman
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="department"
                  id="department"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Örn: Yazılım Geliştirme"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-x-4">
            <a
              href="/employees"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              İptal
            </a>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 