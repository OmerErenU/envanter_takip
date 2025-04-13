import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET metodu
export async function GET(
  request: Request,
  context: { params: { id: string } } // params burada context nesnesinin içinde
) {
  const { id } = context.params;  // params.id doğru şekilde alıyoruz

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(id),  // id'yi sayıya çeviriyoruz
      },
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            device: true,
          },
        },
      },
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
  request: Request,
  context: { params: { id: string } } // params burada context nesnesinin içinde
) {
  const { id } = context.params;  // params.id doğru şekilde alıyoruz
  
  try {
    const body = await request.json();
    const { name, email, phone, department, position, notes } = body;

    // Email benzersizliğini kontrol et
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        email,
        NOT: {
          id: parseInt(id),  // Aynı id'yi kontrol ediyoruz
        },
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Bu email adresi başka bir çalışan tarafından kullanılıyor' },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: parseInt(id), // id'yi sayıya çeviriyoruz
      },
      data: {
        name,
        email,
        phone,
        department,
        position,
        notes,
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json(
      { error: 'Çalışan güncellenemedi' },
      { status: 500 }
    );
  }
}