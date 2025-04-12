import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DeviceStatus, AssignmentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { rows } = await request.json();
    
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { message: 'Geçersiz veri formatı. Veri listesi boş olamaz.' }, 
        { status: 400 }
      );
    }

    // Debug: Excel sütun başlıklarını görelim
    console.log("Excel sütun başlıkları:", Object.keys(rows[0]));
    
    // İlk satırı debug amaçlı görelim
    console.log("İlk satır verisi:", rows[0]);
    
    // İşlem sonuçları
    const results = {
      employees: { created: 0, updated: 0, failed: 0 },
      devices: { created: 0, updated: 0, failed: 0 },
      assignments: { created: 0, failed: 0 },
      errors: [] as string[],
    };
    
    // Her bir satır için işlem yap
    for (const row of rows) {
      try {
        // Boş satırları atla
        if (!row["İsim"] || row["İsim"] === "Vacant") {
          continue;
        }

        // Çalışan bilgisini işle
        let employee = await prisma.employee.findFirst({
          where: { name: row["İsim"] }
        });
        
        if (!employee) {
          try {
            employee = await prisma.employee.create({
              data: {
                name: row["İsim"],
                email: `${row["İsim"].toLowerCase().replace(/\s+/g, '.')}@sirket.com`,
                department: row["Departman"] || "Belirlenmemiş",
                phone: null // Telefonu zimmet olarak tutuyoruz, çalışan bilgisinde değil
              }
            });
            results.employees.created++;
          } catch (err) {
            results.employees.failed++;
            results.errors.push(`Çalışan oluşturma hatası: ${row["İsim"]} - ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
            continue;
          }
        }

        const devicePromises = [];

        // TELEFON işleme - herhangi bir bilgi varsa
        if (row["Telefon Marka/Model"] || row["Telefon Seri no"] || row["Telefon IMEI"]) {
          console.log(`${row["İsim"]} için telefon kaydı başlatılıyor`);
          
          // Marka ve model bilgisini ayır (varsa)
          let telefonMarka = "Belirlenmemiş";
          let telefonModel = "Belirlenmemiş";
          
          if (row["Telefon Marka/Model"] && row["Telefon Marka/Model"].trim() !== "" && row["Telefon Marka/Model"] !== "NA") {
            const markaParcalari = row["Telefon Marka/Model"].split(' ');
            telefonMarka = markaParcalari[0];
            telefonModel = markaParcalari.length > 1 ? markaParcalari.slice(1).join(' ') : markaParcalari[0];
          }
          
          devicePromises.push(
            processDevice({
              type: "Telefon",
              brand: telefonMarka,
              model: telefonModel,
              serialNumber: (row["Telefon Seri no"] && row["Telefon Seri no"].trim() !== "" && row["Telefon Seri no"] !== "NA") ? row["Telefon Seri no"] : null,
              imei: (row["Telefon IMEI"] && row["Telefon IMEI"].trim() !== "" && row["Telefon IMEI"] !== "NA") ? row["Telefon IMEI"] : null,
              notes: `${row["İsim"]} için telefon kaydı.`
            }).then(device => {
              if (device) {
                console.log(`${row["İsim"]} için telefon kaydedildi, zimmetleniyor: ID=${device.id}`);
                return createAssignment(device.id, employee!.id, results);
              } else {
                console.log(`${row["İsim"]} için telefon kaydedilemedi!`);
              }
            }).catch(err => {
              console.error(`${row["İsim"]} için telefon işleme hatası:`, err);
              results.devices.failed++;
              results.errors.push(`Telefon işleme hatası: ${row["İsim"]} - ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
            })
          );
        }

        // BİLGİSAYAR işleme - herhangi bir bilgi varsa
        if (row["Bilgisayar Marka/Model"] || row["Bilgisayar Seri No"] || row["Hostname"] || row["Bilgisayar UUID"]) {
          console.log(`${row["İsim"]} için bilgisayar kaydı başlatılıyor`);
          
          // Marka ve model bilgisini ayır (varsa)
          let pcMarka = "Belirlenmemiş";
          let pcModel = "Belirlenmemiş";
          
          if (row["Bilgisayar Marka/Model"] && row["Bilgisayar Marka/Model"].trim() !== "" && row["Bilgisayar Marka/Model"] !== "NA") {
            const markaParcalari = row["Bilgisayar Marka/Model"].trim().split(' ');
            pcMarka = markaParcalari[0];
            pcModel = markaParcalari.length > 1 ? markaParcalari.slice(1).join(' ') : "";
          }
          
          devicePromises.push(
            processDevice({
              type: "Bilgisayar",
              brand: pcMarka,
              model: pcModel,
              serialNumber: (row["Bilgisayar Seri No"] && row["Bilgisayar Seri No"].trim() !== "" && row["Bilgisayar Seri No"] !== "NA") ? 
                           row["Bilgisayar Seri No"] : null,
              hostname: (row["Hostname"] && row["Hostname"].trim() !== "" && row["Hostname"] !== "NA") ? 
                        row["Hostname"] : null,
              uuid: (row["Bilgisayar UUID"] && row["Bilgisayar UUID"].trim() !== "" && row["Bilgisayar UUID"] !== "NA") ? 
                    row["Bilgisayar UUID"] : null,
              notes: `${row["İsim"]} için bilgisayar kaydı.`
            }).then(device => {
              if (device) {
                console.log(`${row["İsim"]} için bilgisayar kaydedildi, zimmetleniyor: ID=${device.id}`);
                return createAssignment(device.id, employee!.id, results);
              } else {
                console.log(`${row["İsim"]} için bilgisayar kaydedilemedi!`);
              }
            }).catch(err => {
              console.error(`${row["İsim"]} için bilgisayar işleme hatası:`, err);
              results.devices.failed++;
              results.errors.push(`Bilgisayar işleme hatası: ${row["İsim"]} - ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
            })
          );
        }

        // Tüm cihaz işlemlerinin tamamlanmasını bekle
        await Promise.all(devicePromises);

      } catch (err) {
        results.errors.push(`Satır işleme hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      }
    }

    return NextResponse.json({
      message: 'İçe aktarma işlemi tamamlandı',
      results
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { message: 'İçe aktarma sırasında bir hata oluştu', error: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

interface DeviceData {
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei?: string;
  hostname?: string;
  uuid?: string;
  notes?: string;
}

async function processDevice(deviceData: DeviceData) {
  try {
    // Seri numarası zorunlu değil artık
    
    // Cihaz arama, artık seri numarası, imei veya uuid'den herhangi biri varsa
    let device = null;
    const searchConditions = [];
    if (deviceData.serialNumber) searchConditions.push({ serialNumber: deviceData.serialNumber });
    if (deviceData.imei) searchConditions.push({ imei: deviceData.imei });
    if (deviceData.uuid) searchConditions.push({ uuid: deviceData.uuid });
    
    if (searchConditions.length > 0) {
      device = await prisma.device.findFirst({
        where: { OR: searchConditions }
      });
    }
    
    if (!device) {
      // Cihaz yoksa oluştur
      device = await prisma.device.create({
        data: {
          type: deviceData.type,
          brand: deviceData.brand,
          model: deviceData.model,
          serialNumber: deviceData.serialNumber,
          imei: deviceData.imei || null,
          hostname: deviceData.hostname || null,
          uuid: deviceData.uuid || null,
          status: DeviceStatus.ASSIGNED,
          notes: deviceData.notes || null
        }
      });
    } else {
      // Cihaz varsa güncelle
      device = await prisma.device.update({
        where: { id: device.id },
        data: {
          type: deviceData.type,
          brand: deviceData.brand,
          model: deviceData.model,
          serialNumber: deviceData.serialNumber || device.serialNumber,
          imei: deviceData.imei || device.imei,
          hostname: deviceData.hostname || device.hostname,
          uuid: deviceData.uuid || device.uuid,
          status: DeviceStatus.ASSIGNED,
          notes: deviceData.notes || device.notes
        }
      });
    }

    return device;
  } catch (error) {
    throw error;
  }
}

async function createAssignment(deviceId: number, employeeId: number, results: any) {
  try {
    // Mevcut aktif zimmeti kontrol et
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        deviceId,
        status: AssignmentStatus.ACTIVE
      }
    });

    if (existingAssignment) {
      // Eski zimmeti pasif yap
      await prisma.assignment.update({
        where: { id: existingAssignment.id },
        data: { 
          status: AssignmentStatus.INACTIVE,
          returnDate: new Date()
        }
      });
    }

    // Yeni zimmet oluştur
    await prisma.assignment.create({
      data: {
        deviceId,
        employeeId,
        status: AssignmentStatus.ACTIVE,
        assignedDate: new Date()
      }
    });
    results.assignments.created++;
  } catch (err) {
    results.assignments.failed++;
    throw new Error(`Atama oluşturulamadı: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
  }
} 