import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { DeviceStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Tüm cihazları getir
    const devices = await prisma.device.findMany({
      orderBy: [
        { type: 'asc' },
        { brand: 'asc' },
      ],
    });

    // Cihaz verilerini Excel için formatlama
    const formattedDevices = devices.map(device => ({
      ID: device.id,
      Tip: device.type,
      Marka: device.brand,
      Model: device.model,
      Seri_No: device.serialNumber,
      Satın_Alma_Tarihi: new Date(device.purchaseDate).toLocaleDateString('tr-TR'),
      Durum: getStatusText(device.status),
      Kayıt_Tarihi: new Date(device.createdAt).toLocaleDateString('tr-TR'),
      Son_Güncelleme: new Date(device.updatedAt).toLocaleDateString('tr-TR'),
    }));

    // Excel dosyası oluştur
    const worksheet = XLSX.utils.json_to_sheet(formattedDevices);
    
    // Sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 5 },   // ID
      { wch: 15 },  // Tip
      { wch: 15 },  // Marka
      { wch: 20 },  // Model
      { wch: 20 },  // Seri_No
      { wch: 15 },  // Satın_Alma_Tarihi
      { wch: 10 },  // Durum
      { wch: 15 },  // Kayıt_Tarihi
      { wch: 15 },  // Son_Güncelleme
    ];
    
    worksheet['!cols'] = columnWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cihazlar');
    
    // Excel dosyasını buffer olarak al
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Response döndür
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="cihazlar.xlsx"',
      },
    });
  } catch (error) {
    console.error('Cihazlar dışa aktarılırken hata:', error);
    return NextResponse.json(
      { message: 'Cihazlar dışa aktarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Cihaz durumunu Türkçe olarak döndüren yardımcı fonksiyon
function getStatusText(status: DeviceStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'Müsait';
    case 'ASSIGNED':
      return 'Zimmetli';
    case 'MAINTENANCE':
      return 'Bakımda';
    case 'RETIRED':
      return 'Emekli';
    default:
      return status;
  }
} 