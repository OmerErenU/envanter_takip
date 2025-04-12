import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Tüm zimmetleri ve ilişkili verileri getir
    const assignments = await prisma.assignment.findMany({
      orderBy: {
        assignedDate: 'desc',
      },
      include: {
        employee: {
          select: {
            name: true,
            department: true,
          },
        },
        device: {
          select: {
            type: true,
            brand: true,
            model: true,
            serialNumber: true,
          },
        },
      },
    });

    // Zimmet verilerini Excel için formatlama
    const formattedAssignments = assignments.map(assignment => ({
      Zimmet_ID: assignment.id,
      Çalışan_Adı: assignment.employee.name,
      Departman: assignment.employee.department,
      Cihaz_Tipi: assignment.device.type,
      Cihaz: `${assignment.device.brand} ${assignment.device.model}`,
      Seri_No: assignment.device.serialNumber,
      Zimmet_Tarihi: new Date(assignment.assignedDate).toLocaleDateString('tr-TR'),
      İade_Tarihi: assignment.returnDate 
        ? new Date(assignment.returnDate).toLocaleDateString('tr-TR') 
        : '-',
      Durum: getStatusText(assignment.status),
      Notlar: assignment.notes || '-',
    }));

    // Excel dosyası oluştur
    const worksheet = XLSX.utils.json_to_sheet(formattedAssignments);
    
    // Sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 10 },  // Zimmet_ID
      { wch: 25 },  // Çalışan_Adı
      { wch: 20 },  // Departman
      { wch: 15 },  // Cihaz_Tipi
      { wch: 25 },  // Cihaz
      { wch: 20 },  // Seri_No
      { wch: 15 },  // Zimmet_Tarihi
      { wch: 15 },  // İade_Tarihi
      { wch: 15 },  // Durum
      { wch: 30 },  // Notlar
    ];
    
    worksheet['!cols'] = columnWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zimmetler');
    
    // Excel dosyasını buffer olarak al
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Response döndür
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="zimmetler.xlsx"',
      },
    });
  } catch (error) {
    console.error('Zimmetler dışa aktarılırken hata:', error);
    return NextResponse.json(
      { message: 'Zimmetler dışa aktarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Zimmet durumunu Türkçe olarak döndüren yardımcı fonksiyon
function getStatusText(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif';
    case 'RETURNED':
      return 'İade Edildi';
    case 'LOST':
      return 'Kayıp';
    case 'DAMAGED':
      return 'Hasarlı';
    default:
      return status;
  }
} 