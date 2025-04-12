import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { employees } = await request.json();
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { message: 'Geçersiz veri formatı. Çalışan listesi boş olamaz.' }, 
        { status: 400 }
      );
    }
    
    // Gerekli alanları kontrol et
    const invalidEmployees = employees.filter(employee => 
      !employee.name || !employee.email || !employee.department
    );
    
    if (invalidEmployees.length > 0) {
      return NextResponse.json(
        { 
          message: 'Bazı çalışan kayıtları gerekli alanları içermiyor (name, email, department)',
          invalidEmployees
        }, 
        { status: 400 }
      );
    }
    
    // Benzersiz email kontrolü
    const existingEmails = await prisma.employee.findMany({
      where: {
        email: {
          in: employees.map(e => e.email)
        }
      },
      select: {
        email: true
      }
    });
    
    const duplicateEmails = existingEmails.map(e => e.email);
    
    // Benzersiz olmayan e-postalar varsa geri dön
    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        { 
          message: 'Bazı e-posta adresleri zaten kullanılıyor',
          duplicateEmails
        }, 
        { status: 400 }
      );
    }
    
    // Tüm çalışanları ekle
    const createdEmployees = await prisma.employee.createMany({
      data: employees
    });
    
    return NextResponse.json({ 
      message: `${createdEmployees.count} çalışan başarıyla içe aktarıldı.`,
      count: createdEmployees.count
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Çalışanları içe aktarma hatası:', error);
    
    // Özel hata yönetimi
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Bazı e-posta adresleri zaten kullanılıyor' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Çalışanlar içe aktarılırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 