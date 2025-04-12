import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { DeviceStatus } from '@prisma/client';

export async function GET() {
  try {
    // Önce veritabanı bağlantısını test et
    await prisma.$connect();

    // Cihazları getir
    const devices = await prisma.device.findMany({
      orderBy: [
        { type: 'asc' },
        { brand: 'asc' },
      ],
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                department: true
              }
            }
          }
        }
      }
    });

    // Bağlantıyı kapat
    await prisma.$disconnect();

    if (!devices) {
      return NextResponse.json({ error: 'Cihazlar bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(devices);
  } catch (error) {
    console.error('Cihazlar getirilemedi:', error);
    
    // Bağlantıyı kapatmaya çalış
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Veritabanı bağlantısı kapatılamadı:', disconnectError);
    }

    return NextResponse.json(
      { 
        error: 'Cihazlar getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.type || !body.brand || !body.model) {
      return NextResponse.json(
        { error: 'Cihaz tipi, marka ve model zorunludur' },
        { status: 400 }
      );
    }

    // Seri numarası varsa benzersiz olup olmadığını kontrol et
    if (body.serialNumber) {
      const existingDevice = await prisma.device.findUnique({
        where: { serialNumber: body.serialNumber }
      });

      if (existingDevice) {
        return NextResponse.json(
          { error: 'Bu seri numarasına sahip bir cihaz zaten mevcut' },
          { status: 400 }
        );
      }
    }

    const device = await prisma.device.create({
      data: {
        type: body.type,
        brand: body.brand,
        model: body.model,
        serialNumber: body.serialNumber,
        status: body.status || 'AVAILABLE',
        notes: body.notes,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date()
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Cihaz oluşturma hatası:', error);
    return NextResponse.json(
      { 
        error: 'Cihaz oluşturulamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 