import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  try {
    // Tüm çalışanları getir
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Tarih alanlarını düzenle
    const formattedEmployees = employees.map(employee => ({
      ID: employee.id,
      Ad_Soyad: employee.name,
      Email: employee.email,
      Departman: employee.department,
      Kayıt_Tarihi: new Date(employee.createdAt).toLocaleDateString('tr-TR'),
      Son_Güncelleme: new Date(employee.updatedAt).toLocaleDateString('tr-TR'),
    }));

    // Excel dosyası oluştur
    const worksheet = XLSX.utils.json_to_sheet(formattedEmployees);
    
    // Sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 5 },  // ID
      { wch: 25 }, // Ad_Soyad
      { wch: 30 }, // Email
      { wch: 20 }, // Departman
      { wch: 15 }, // Kayıt_Tarihi
      { wch: 15 }, // Son_Güncelleme
    ];
    
    worksheet['!cols'] = columnWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Çalışanlar');
    
    // Excel dosyasını buffer olarak al
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Response döndür
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="calisanlar.xlsx"',
      },
    });
  } catch (error) {
    console.error('Çalışanlar dışa aktarılırken hata:', error);
    return NextResponse.json(
      { message: 'Çalışanlar dışa aktarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 