import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DeviceStatus } from '@prisma/client';

export default function NewDevicePage() {
  async function createDevice(formData: FormData) {
    'use server';
    
    const type = formData.get('type') as string;
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const serialNumber = formData.get('serialNumber') as string;
    const status = formData.get('status') as DeviceStatus;
    
    if (!type || !brand || !model || !serialNumber || !status) {
      throw new Error('Tüm alanlar zorunludur');
    }
    
    await prisma.device.create({
      data: {
        type,
        brand,
        model,
        serialNumber,
        status,
      },
    });
    
    redirect('/devices');
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Yeni Cihaz Ekle</h1>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form action={createDevice}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Cihaz Tipi
              </label>
              <div className="mt-1">
                <select
                  id="type"
                  name="type"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Telefon">Telefon</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Monitör">Monitör</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Marka
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="brand"
                  id="brand"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Örn: Apple, Dell, Samsung"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="model"
                  id="model"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Örn: MacBook Pro, XPS 13"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                Seri Numarası
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="serialNumber"
                  id="serialNumber"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Cihazın seri numarası"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Durum
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="AVAILABLE">Müsait</option>
                  <option value="ASSIGNED">Zimmetli</option>
                  <option value="MAINTENANCE">Bakımda</option>
                  <option value="RETIRED">Emekli</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-end gap-x-4">
            <a
              href="/devices"
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