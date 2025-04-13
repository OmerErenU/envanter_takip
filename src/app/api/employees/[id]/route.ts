import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RequestContext {
  params: {
    id: string;
  };
}

// GET metodu
export async function GET(
  req: NextRequest,
  context: RequestContext
) {
  try {
    const id = parseInt(context.params.id);
    
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            device: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json(
      { error: 'Çalışan bilgileri alınamadı' },
      { status: 500 }
    );
  }
}

// PUT metodu
export async function PUT(
  req: NextRequest,
  context: RequestContext
) {
  try {
    const id = parseInt(context.params.id);
    const body = await req.json();
    const { name, email, phone, department, position, notes } = body;

    // Email benzersizliğini kontrol et
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        email,
        NOT: { id }
      }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Bu email adresi başka bir çalışan tarafından kullanılıyor' },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        department,
        position,
        notes
      }
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json(
      { error: 'Çalışan güncellenemedi' },
      { status: 500 }
    );
  }
}