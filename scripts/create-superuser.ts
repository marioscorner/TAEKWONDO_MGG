// scripts/create-superuser.ts
/**
 * Script para crear un superusuario (ADMIN)
 * 
 * Uso:
 *   npx ts-node scripts/create-superuser.ts
 *   
 * O añade un script en package.json:
 *   "scripts": {
 *     "create-superuser": "ts-node scripts/create-superuser.ts"
 *   }
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🥋 === CREAR SUPERUSUARIO (ADMIN) === 🥋\n');

  try {
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const firstName = await question('Nombre (opcional): ');
    const lastName = await question('Apellidos (opcional): ');

    if (!username || !email || !password) {
      console.error('\n❌ Error: Username, email y password son obligatorios\n');
      process.exit(1);
    }

    // Verificar si ya existe
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existing) {
      console.error('\n❌ Error: Ya existe un usuario con ese username o email\n');
      process.exit(1);
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    console.log('\n✅ Superusuario creado exitosamente!\n');
    console.log('📋 Detalles:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Nombre: ${user.firstName || 'N/A'}`);
    console.log(`   Apellidos: ${user.lastName || 'N/A'}\n`);
  } catch (error) {
    console.error('\n❌ Error al crear superusuario:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();

