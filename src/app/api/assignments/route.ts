import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        status: 'ACTIVE', // Sadece aktif zimmetleri getir
      },
      include: {
        employee: true,
        device: true
      },
      orderBy: {
        assignedDate: 'desc'
      }
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Zimmetler getirilemedi:', error);
    return NextResponse.json(
      { error: 'Zimmetler getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, deviceId, assignedDate, notes } = body;

    // Cihazın aktif zimmeti var mı kontrol et
    const activeAssignment = await prisma.assignment.findFirst({
      where: {
        deviceId: parseInt(deviceId),
        status: 'ACTIVE'
      }
    });

    if (activeAssignment) {
      return NextResponse.json(
        { error: 'Bu cihaz zaten başka bir çalışana zimmetli' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        employeeId: parseInt(employeeId),
        deviceId: parseInt(deviceId),
        assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
        notes
      },
      include: {
        employee: true,
        device: true
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Zimmet oluşturulamadı' },
      { status: 500 }
    );
  }
} 