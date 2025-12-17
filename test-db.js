import 'dotenv/config';
import sequelize from './src/config/database.js';

async function testConnection() {
  console.log('🔍 Testando configuração do banco...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Definido' : '❌ FALTANDO!');
  console.log('');
  
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão com banco OK!');
    
    console.log('🔍 Verificando tabelas...');
    const [results] = await sequelize.query("SELECT to_regclass('public.users')");
    
    if (results[0].to_regclass) {
      console.log('✅ Tabela "users" existe');
      
      const [count] = await sequelize.query("SELECT COUNT(*) FROM users");
      console.log(`📊 Total de usuários: ${count[0].count}`);
      
      if (count[0].count > 0) {
        const [users] = await sequelize.query(
          `SELECT id, name, email, active, "createdAt", "updatedAt" FROM users LIMIT 3`
        );
        console.log('👥 Primeiros usuários:');
        users.forEach(user => {
          console.log(`   - ${user.name} (${user.email})`);
          console.log(`     Status: ${user.active ? '✅ Ativo' : '❌ Inativo'}`);
          console.log(`     Criado: ${new Date(user.createdAt).toLocaleString()}`);
        });
      }
    } else {
      console.log('⚠️  Tabela "users" não existe');
      console.log('   Será criada automaticamente ao iniciar o servidor');
    }
    
    console.log('\n🎉 Banco de dados configurado corretamente!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Inicie o servidor: npm run dev');
    console.log('   2. Teste registro: curl -X POST http://localhost:3002/api/auth/register ...');
    console.log('   3. Verifique token no console do servidor');
    console.log('   4. Ative conta e faça login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na conexão com banco:');
    console.error('   Mensagem:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n🔧 Verifique DB_PASSWORD no .env');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n🔧 Crie o banco: createdb -U postgres auth_db');
    } else if (error.message.includes('connection refused')) {
      console.error('\n🔧 Verifique se PostgreSQL está rodando');
    }
    
    process.exit(1);
  }
}

testConnection();