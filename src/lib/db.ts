import { PrismaClient } from '@prisma/client';

<<<<<<< HEAD
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
    // Connection pooling sorunları için özel seçenekler kaldırıldı
    // connectionTimeout ve transactionTimeout Prisma tarafından desteklenmiyor
  });
=======
// DATABASE_URL'yi konsola yazdır (şifre olmadan)
const dbUrl = process.env.DATABASE_URL || '';
const sanitizedUrl = dbUrl.replace(/\/\/postgres:(.+?)@/, '//postgres:***@');
console.log('Veritabanı URL:', sanitizedUrl);

const prismaClientSingleton = () => {
  console.log('PrismaClient başlatılıyor...');
  try {
    return new PrismaClient({
      log: ['error', 'warn', 'query'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
      // Connection pooling sorunları için özel seçenekler kaldırıldı
      // connectionTimeout ve transactionTimeout Prisma tarafından desteklenmiyor
    });
  } catch (error) {
    console.error('Prisma başlatma hatası:', error);
    throw error;
  }
>>>>>>> 18ff6f5 (Veritabanı bağlantı hata ayıklaması eklendi)
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 