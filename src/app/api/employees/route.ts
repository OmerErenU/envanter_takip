import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('API: Çalışanlar getiriliyor (SupaBase)...');
    
    // SupaBase sorgusunu çalıştır
    const { data, error } = await supabase
      .from('employee')
      .select(`
        *,
        assignments (
          *,
          device (*)
        )
      `);

    if (error) {
      console.error('SupaBase çalışanlar sorgu hatası:', error);
      throw error;
    }

    console.log(`${data?.length || 0} çalışan başarıyla getirildi`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Çalışanlar getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Çalışanlar getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department, phone, position, notes } = body;

    // Email benzersizliğini kontrol et
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employee')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Email kontrol hatası:', checkError);
      throw checkError;
    }

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Yeni çalışan oluştur
    const { data, error } = await supabase
      .from('employee')
      .insert([
        { 
          name, 
          email, 
          department, 
          phone, 
          position, 
          notes,
          createdat: new Date().toISOString(), // Sütun adlarının lowercase olduğunu varsayıyorum
          updatedat: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Çalışan oluşturma hatası:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Çalışan oluşturma hatası:', error);
    return NextResponse.json(
      { 
        error: 'Çalışan oluşturulamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      },
      { status: 500 }
    );
  }
} 