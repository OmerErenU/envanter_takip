import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            device: true
          }
        }
      }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      { error: 'Çalışanlar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department } = body;

    // Email benzersizliğini kontrol et
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        department
      }
    });

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json(
      { error: 'Çalışan oluşturulamadı' },
      { status: 500 }
    );
  }
} 