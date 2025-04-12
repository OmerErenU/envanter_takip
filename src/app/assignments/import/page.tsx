'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseExcelFile } from '@/lib/utils';

export default function ImportAssignmentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setPreview([]);
    setShowPreview(false);
    setImportResults(null);
    
    if (!selectedFile) {
      return;
    }
    
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Lütfen Excel formatında bir dosya seçiniz (.xlsx veya .xls)');
      return;
    }
    
    setFile(selectedFile);
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Lütfen önce bir dosya seçiniz');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await parseExcelFile(file);
      
      if (data.length === 0) {
        setError('Dosya boş veya geçersiz. Lütfen farklı bir dosya seçiniz');
        setLoading(false);
        return;
      }
      
      setPreview(data.slice(0, 5)); // İlk 5 kaydı göster
      setShowPreview(true);
    } catch (err) {
      setError('Dosya ayrıştırılırken hata oluştu. Lütfen geçerli bir Excel dosyası seçtiğinizden emin olun.');
      console.error(err);
    }
    
    setLoading(false);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Lütfen önce bir dosya seçiniz');
      return;
    }
    
    setLoading(true);
    setError(null);
    setImportResults(null);
    
    try {
      const data = await parseExcelFile(file);
      
      const response = await fetch('/api/assignments/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments: data }),
      });
      
      const result = await response.json();
      
      if (!response.ok && response.status !== 207) {
        throw new Error(result.message || 'Veri içe aktarılırken bir hata oluştu');
      }
      
      setImportResults(result);
      
      if (result.results.failed === 0) {
        setTimeout(() => {
          router.push('/assignments');
          router.refresh();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Veri içe aktarılırken bir hata oluştu');
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-gray-900">Zimmetleri İçe Aktar</h1>
          <p className="mt-2 text-gray-700">
            Excel dosyanızı yükleyerek zimmet bilgilerini toplu olarak içe aktarabilirsiniz.
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {importResults && (
          <div className={`mb-4 p-4 rounded-md ${importResults.results.failed > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
            <p className="font-medium">{importResults.message}</p>
            {importResults.results.failed > 0 && (
              <div className="mt-2">
                <p className="font-medium">Hatalar:</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {importResults.results.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {importResults.results.failed === 0 && (
              <p className="mt-2 text-sm">
                Başarıyla içe aktarıldı. Yönlendiriliyorsunuz...
              </p>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Dosya Formatı</h2>
          <p className="text-gray-600 mb-2">
            Excel dosyanız aşağıdaki alanları içermelidir:
          </p>
          <ul className="list-disc pl-5 text-gray-600">
            <li><strong>employeeEmail:</strong> Çalışan e-posta adresi (sistemde kayıtlı olmalı)</li>
            <li><strong>deviceSerialNumber:</strong> Cihaz seri numarası (sistemde kayıtlı olmalı)</li>
            <li><strong>assignedDate:</strong> Zimmet tarihi (YYYY-MM-DD)</li>
            <li><strong>returnDate:</strong> İade tarihi - opsiyonel (YYYY-MM-DD)</li>
            <li><strong>status:</strong> Durum - opsiyonel (Aktif, İade Edildi, Kayıp, Hasarlı)</li>
            <li><strong>notes:</strong> Notlar - opsiyonel</li>
          </ul>
        </div>
        
        <div className="border border-gray-300 rounded-md p-4 mb-6">
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Excel Dosyası Seçin (.xlsx veya .xls)
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : 'Önizleme'}
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : 'İçe Aktar'}
            </button>
            <Link
              href="/assignments"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              İptal
            </Link>
          </div>
        </div>
        
        {showPreview && preview.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Önizleme (İlk 5 Kayıt)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {preview.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value: any, valIndex) => (
                        <td key={valIndex} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {value !== null && value !== undefined ? value.toString() : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Önizlemeyi kontrol ettikten sonra "İçe Aktar" butonuna tıklayarak işlemi tamamlayabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 