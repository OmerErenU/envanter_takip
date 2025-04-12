import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Tüm çalışanları getir
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          include: {
            device: true
          }
        }
      }
    });

    // Çalışan bazlı veri hazırla
    const formattedData = employees.map(employee => {
      // Boş bir veri şablonu oluştur
      const rowData: any = {
        "İsim": employee.name,
        "Bilgisayar Marka/Model": "",
        "Bilgisayar Seri No": "",
        "Teslim Edilen Tarih": "",
        "Telefon Marka/Model": "",
        "Telefon Seri no": "",
        "Telefon IMEI": "",
        "Teslim Edilen Tarih_2": "",
        "Tablet Marka/Model": "",
        "Tablet Seri no": "",
        "Teslim Edilen Tarih_3": ""
      };
      
      // Çalışana zimmetli cihazları bul
      employee.assignments.forEach(assignment => {
        const device = assignment.device;
        
        if (device.type.toLowerCase().includes('bilgisayar') || device.type.toLowerCase().includes('laptop')) {
          rowData["Bilgisayar Marka/Model"] = `${device.brand} ${device.model}`;
          rowData["Bilgisayar Seri No"] = device.serialNumber;
          rowData["Teslim Edilen Tarih"] = new Date(assignment.assignedDate).toLocaleDateString('tr-TR');
        } 
        else if (device.type.toLowerCase().includes('telefon')) {
          rowData["Telefon Marka/Model"] = `${device.brand} ${device.model}`;
          rowData["Telefon Seri no"] = device.serialNumber;
          // IMEI bilgisi notes alanında olabilir
          rowData["Telefon IMEI"] = assignment.notes || "";
          rowData["Teslim Edilen Tarih_2"] = new Date(assignment.assignedDate).toLocaleDateString('tr-TR');
        }
        else if (device.type.toLowerCase().includes('tablet')) {
          rowData["Tablet Marka/Model"] = `${device.brand} ${device.model}`;
          rowData["Tablet Seri no"] = device.serialNumber;
          rowData["Teslim Edilen Tarih_3"] = new Date(assignment.assignedDate).toLocaleDateString('tr-TR');
        }
      });
      
      return rowData;
    });

    // Excel dosyası oluştur
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Sütun genişliklerini ayarla
    worksheet['!cols'] = [
      { wch: 25 },  // İsim
      { wch: 25 },  // Bilgisayar Marka/Model
      { wch: 20 },  // Bilgisayar Seri No
      { wch: 15 },  // Teslim Edilen Tarih
      { wch: 25 },  // Telefon Marka/Model
      { wch: 20 },  // Telefon Seri no
      { wch: 20 },  // Telefon IMEI
      { wch: 15 },  // Teslim Edilen Tarih_2
      { wch: 25 },  // Tablet Marka/Model
      { wch: 20 },  // Tablet Seri no
      { wch: 15 },  // Teslim Edilen Tarih_3
    ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Envanter');
    
    // Excel dosyasını buffer olarak al
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Response döndür
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="envanter.xlsx"',
      },
    });
  } catch (error) {
    console.error('Envanter dışa aktarılırken hata:', error);
    return NextResponse.json(
      { message: 'Envanter dışa aktarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 