import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testConnection() {
  try {
    await db.$connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    const users = await db.user.findMany({ take: 1 });
    console.log('✅ Database tables accessible');
    
    await db.$disconnect();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Create a .env file with DATABASE_URL');
    console.log('3. Run: npx prisma migrate dev');
  }
}

testConnection(); 