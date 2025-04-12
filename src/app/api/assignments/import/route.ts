import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus, DeviceStatus } from '@prisma/client';

type ImportedAssignment = {
  employeeEmail: string;
  deviceSerialNumber: string;
  assignedDate: string;
  returnDate?: string;
  status: string;
  notes?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { assignments } = await request.json();
    
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { message: 'Geçersiz veri formatı. Zimmet listesi boş olamaz.' }, 
        { status: 400 }
      );
    }
    
    // Verileri işle
    const processedAssignments = normalizeAssignmentData(assignments);
    
    // Gerekli alanları kontrol et
    const invalidAssignments = processedAssignments.filter(assignment => 
      !assignment.employeeEmail || !assignment.deviceSerialNumber || !assignment.assignedDate
    );
    
    if (invalidAssignments.length > 0) {
      return NextResponse.json(
        { 
          message: 'Bazı zimmet kayıtları gerekli alanları içermiyor (employeeEmail, deviceSerialNumber, assignedDate)',
          invalidAssignments
        }, 
        { status: 400 }
      );
    }
    
    // İşlem sonuçları
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    // Her bir zimmet için işlem yap
    for (const assignmentData of processedAssignments) {
      try {
        // Çalışanı bul
        const employee = await prisma.employee.findUnique({
          where: {
            email: assignmentData.employeeEmail,
          },
        });
        
        if (!employee) {
          results.errors.push(`Çalışan bulunamadı: ${assignmentData.employeeEmail}`);
          results.failed++;
          continue;
        }
        
        // Cihazı bul
        const device = await prisma.device.findUnique({
          where: {
            serialNumber: assignmentData.deviceSerialNumber,
          },
        });
        
        if (!device) {
          results.errors.push(`Cihaz bulunamadı: ${assignmentData.deviceSerialNumber}`);
          results.failed++;
          continue;
        }
        
        // Durum kontrolü
        const status = getAssignmentStatus(assignmentData.status);
        
        // Zimmet oluştur
        await prisma.$transaction(async (tx) => {
          // Zimmet oluştur
          await tx.assignment.create({
            data: {
              employeeId: employee.id,
              deviceId: device.id,
              assignedDate: new Date(assignmentData.assignedDate),
              returnDate: assignmentData.returnDate ? new Date(assignmentData.returnDate) : null,
              status: status,
              notes: assignmentData.notes,
            },
          });
          
          // Cihaz durumunu güncelle
          const deviceStatus = status === 'ACTIVE' ? 'ASSIGNED' : 'AVAILABLE';
          await tx.device.update({
            where: { id: device.id },
            data: { status: deviceStatus as DeviceStatus },
          });
        });
        
        results.success++;
      } catch (err: any) {
        console.error('Zimmet içe aktarma hatası:', err);
        results.errors.push(`Hata: ${err.message}`);
        results.failed++;
      }
    }
    
    return NextResponse.json({ 
      message: `${results.success} zimmet başarıyla içe aktarıldı. ${results.failed} zimmet aktarılamadı.`,
      results
    }, { status: results.failed > 0 ? 207 : 201 });
    
  } catch (error: any) {
    console.error('Zimmetleri içe aktarma hatası:', error);
    return NextResponse.json(
      { message: 'Zimmetler içe aktarılırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}

// Alan adlarını normalleştirme fonksiyonu
function normalizeAssignmentData(assignments: any[]): ImportedAssignment[] {
  return assignments.map(item => {
    const normalized: ImportedAssignment = {
      employeeEmail: '',
      deviceSerialNumber: '',
      assignedDate: '',
      status: 'ACTIVE',
    };
    
    // Email alanını bul
    if (item.employeeEmail) normalized.employeeEmail = item.employeeEmail;
    else if (item.employee_email) normalized.employeeEmail = item.employee_email;
    else if (item.email) normalized.employeeEmail = item.email;
    else if (item.Email) normalized.employeeEmail = item.Email;
    
    // Cihaz seri no alanını bul
    if (item.deviceSerialNumber) normalized.deviceSerialNumber = item.deviceSerialNumber;
    else if (item.device_serial_number) normalized.deviceSerialNumber = item.device_serial_number;
    else if (item.serialNumber) normalized.deviceSerialNumber = item.serialNumber;
    else if (item.serial_number) normalized.deviceSerialNumber = item.serial_number;
    else if (item.SerialNumber) normalized.deviceSerialNumber = item.SerialNumber;
    
    // Zimmet tarihi alanını bul
    if (item.assignedDate) normalized.assignedDate = item.assignedDate;
    else if (item.assigned_date) normalized.assignedDate = item.assigned_date;
    else if (item.zimmetTarihi) normalized.assignedDate = item.zimmetTarihi;
    else if (item.zimmet_tarihi) normalized.assignedDate = item.zimmet_tarihi;
    else if (item.date) normalized.assignedDate = item.date;
    
    // İade tarihi alanını bul (opsiyonel)
    if (item.returnDate) normalized.returnDate = item.returnDate;
    else if (item.return_date) normalized.returnDate = item.return_date;
    else if (item.iadeTarihi) normalized.returnDate = item.iadeTarihi;
    else if (item.iade_tarihi) normalized.returnDate = item.iade_tarihi;
    
    // Durum alanını bul (opsiyonel)
    if (item.status) normalized.status = item.status;
    else if (item.durum) normalized.status = item.durum;
    
    // Notlar alanını bul (opsiyonel)
    if (item.notes) normalized.notes = item.notes;
    else if (item.notlar) normalized.notes = item.notlar;
    
    return normalized;
  });
}

// Durum alanını standartlaştırma
function getAssignmentStatus(status: string): AssignmentStatus {
  const normalizedStatus = status?.toLowerCase()?.trim();
  
  if (!normalizedStatus || normalizedStatus === 'aktif' || normalizedStatus === 'active') {
    return 'ACTIVE';
  } else if (normalizedStatus === 'iade' || normalizedStatus === 'iade edildi' || normalizedStatus === 'returned') {
    return 'RETURNED';
  } else if (normalizedStatus === 'kayıp' || normalizedStatus === 'kayip' || normalizedStatus === 'lost') {
    return 'LOST';
  } else if (normalizedStatus === 'hasarlı' || normalizedStatus === 'hasarli' || normalizedStatus === 'damaged') {
    return 'DAMAGED';
  }
  
  return 'ACTIVE'; // Varsayılan olarak aktif
} 