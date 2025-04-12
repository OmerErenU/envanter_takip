import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(props.params.id)
      },
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

export async function PUT(
  request: NextRequest,
  props: Props
) {
  try {
    const body = await request.json();
    const { name, email, phone, department, position, notes } = body;

    // Email benzersizliğini kontrol et
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        email,
        NOT: {
          id: parseInt(props.params.id)
        }
      }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Bu email adresi başka bir çalışan tarafından kullanılıyor' },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: parseInt(props.params.id)
      },
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