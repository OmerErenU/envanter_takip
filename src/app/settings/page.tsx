'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  // Aktif sekme durumu
  const [activeTab, setActiveTab] = useState('general');
  
  // Form durumları
  const [companyName, setCompanyName] = useState('Şirket Adı');
  const [logo, setLogo] = useState('/logo.png');
  const [dateFormat, setDateFormat] = useState('DD.MM.YYYY');
  const [language, setLanguage] = useState('tr');
  
  // Departman yönetimi
  const [departments, setDepartments] = useState([
    'Bilgi İşlem', 
    'İnsan Kaynakları', 
    'Muhasebe', 
    'Satış', 
    'Pazarlama'
  ]);
  const [newDepartment, setNewDepartment] = useState('');
  
  // Cihaz türleri yönetimi
  const [deviceTypes, setDeviceTypes] = useState([
    'Dizüstü Bilgisayar', 
    'Masaüstü Bilgisayar', 
    'Tablet', 
    'Cep Telefonu', 
    'Yazıcı',
    'Monitör'
  ]);
  const [newDeviceType, setNewDeviceType] = useState('');

  // Yeni departman ekleme fonksiyonu
  const addDepartment = () => {
    if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
      setDepartments([...departments, newDepartment.trim()]);
      setNewDepartment('');
    }
  };

  // Departman silme fonksiyonu
  const removeDepartment = (index: number) => {
    const newDepartments = [...departments];
    newDepartments.splice(index, 1);
    setDepartments(newDepartments);
  };

  // Yeni cihaz türü ekleme fonksiyonu
  const addDeviceType = () => {
    if (newDeviceType.trim() && !deviceTypes.includes(newDeviceType.trim())) {
      setDeviceTypes([...deviceTypes, newDeviceType.trim()]);
      setNewDeviceType('');
    }
  };

  // Cihaz türü silme fonksiyonu
  const removeDeviceType = (index: number) => {
    const newDeviceTypes = [...deviceTypes];
    newDeviceTypes.splice(index, 1);
    setDeviceTypes(newDeviceTypes);
  };

  // Ayarları kaydetme fonksiyonu
  const saveSettings = () => {
    alert('Ayarlar kaydedildi!');
    // Burada verileri API'ye gönderme işlemi yapılabilir
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Sistem Ayarları</h1>
          <button
            onClick={saveSettings}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      {/* Sekme Menüsü */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-6">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('general')}
          >
            Genel Ayarlar
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'departments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('departments')}
          >
            Departman Yönetimi
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deviceTypes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('deviceTypes')}
          >
            Cihaz Türleri
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('backup')}
          >
            Yedekleme
          </button>
        </div>
      </div>

      {/* Genel Ayarlar Sekmesi */}
      {activeTab === 'general' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Genel Sistem Ayarları</h2>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Şirket Adı
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="companyName"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="logo"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                Tarih Formatı
              </label>
              <div className="mt-1">
                <select
                  id="dateFormat"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM.DD.YYYY">MM.DD.YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Dil
              </label>
              <div className="mt-1">
                <select
                  id="language"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">Bildirim Ayarları</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                      E-posta Bildirimleri
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="lowStockNotifications"
                      name="lowStockNotifications"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lowStockNotifications" className="ml-2 block text-sm text-gray-700">
                      Bakım Bildirimleri
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="assignmentNotifications"
                      name="assignmentNotifications"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="assignmentNotifications" className="ml-2 block text-sm text-gray-700">
                      Zimmet Bildirimleri
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departman Yönetimi Sekmesi */}
      {activeTab === 'departments' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Departman Yönetimi</h2>
          
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Yeni departman adı"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
              <button
                type="button"
                onClick={addDepartment}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ekle
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {departments.map((department, index) => (
                <li key={index}>
                  <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{department}</p>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeDepartment(index)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Cihaz Türleri Sekmesi */}
      {activeTab === 'deviceTypes' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cihaz Türleri Yönetimi</h2>
          
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Yeni cihaz türü"
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value)}
              />
              <button
                type="button"
                onClick={addDeviceType}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ekle
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {deviceTypes.map((type, index) => (
                <li key={index}>
                  <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-lg">
                        {type.toLowerCase().includes('bilgisayar') ? '💻' : 
                         type.toLowerCase().includes('telefon') ? '📱' : 
                         type.toLowerCase().includes('tablet') ? '📱' :
                         type.toLowerCase().includes('yazıcı') ? '🖨️' :
                         type.toLowerCase().includes('monitör') ? '🖥️' : '📦'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{type}</p>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeDeviceType(index)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Yedekleme Sekmesi */}
      {activeTab === 'backup' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Veri Yedekleme ve Dışa Aktarma</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Tam Yedekleme</h3>
              <p className="text-sm text-gray-500 mb-4">
                Tüm sistem verilerinin tam bir yedeğini alın. Bu işlem, çalışanlar, cihazlar ve zimmet bilgilerini içerir.
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Tam Yedek Al
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Verileri Dışa Aktar</h3>
              <p className="text-sm text-gray-500 mb-4">
                Belirli verileri Excel formatında dışa aktarın.
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Çalışan Verileri</h4>
                  <p className="text-sm text-gray-500 mb-4">Tüm çalışanların verilerini Excel olarak indirin</p>
                  <Link
                    href="/api/export/employees"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Excel İndir →
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Cihaz Envanteri</h4>
                  <p className="text-sm text-gray-500 mb-4">Tüm cihazların verilerini Excel olarak indirin</p>
                  <Link
                    href="/api/export/devices"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Excel İndir →
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Zimmet Raporu</h4>
                  <p className="text-sm text-gray-500 mb-4">Tüm zimmet verilerini Excel olarak indirin</p>
                  <Link
                    href="/api/export/assignments"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Excel İndir →
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Tam Envanter Raporu</h4>
                  <p className="text-sm text-gray-500 mb-4">Çalışan ve cihaz zimmet verilerini Excel olarak indirin</p>
                  <Link
                    href="/api/export/all"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Excel İndir →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 