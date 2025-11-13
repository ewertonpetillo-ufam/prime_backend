#!/usr/bin/env node

/**
 * Script para gerar hash de senha usando bcrypt
 * 
 * Uso:
 *   node scripts/generate-password-hash.js <senha>
 *   node scripts/generate-password-hash.js <senha> <cost>
 * 
 * Exemplo:
 *   node scripts/generate-password-hash.js senha123
 *   node scripts/generate-password-hash.js minhaSenha 12
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

async function generateHash(password, cost = 10) {
  if (!password) {
    // Se não forneceu senha, pedir via terminal
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('Digite a senha: ', async (inputPassword) => {
        rl.close();
        if (!inputPassword) {
          console.error('❌ Senha não pode ser vazia!');
          process.exit(1);
        }
        const hash = await bcrypt.hash(inputPassword, cost);
        resolve({ password: inputPassword, hash });
      });
    });
  }

  const hash = await bcrypt.hash(password, cost);
  return { password, hash };
}

async function main() {
  const args = process.argv.slice(2);
  const password = args[0];
  const cost = args[1] ? parseInt(args[1], 10) : 10;

  if (cost < 4 || cost > 31) {
    console.error('❌ Cost factor deve estar entre 4 e 31');
    process.exit(1);
  }

  try {
    const { password: finalPassword, hash } = await generateHash(password, cost);
    
    console.log('\n✅ Hash gerado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Senha:', finalPassword);
    console.log('🔐 Hash bcrypt:', hash);
    console.log('⚙️  Cost factor:', cost);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Para usar no banco de dados, copie o hash acima.\n');
    console.log('📋 Exemplo de UPDATE SQL:');
    console.log(`   UPDATE users SET password_hash = '${hash}' WHERE email = 'seu@email.com';\n`);
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error.message);
    process.exit(1);
  }
}

main();

