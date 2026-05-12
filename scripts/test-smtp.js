#!/usr/bin/env node

/**
 * Script para probar la configuración SMTP
 * Uso: node scripts/test-smtp.js
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🧪 Probando configuración SMTP...\n');

  // Verificar variables
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variables faltantes:', missing.join(', '));
    console.error('   Asegúrate de tenerlas en .env.local');
    process.exit(1);
  }

  console.log('📋 Configuración detectada:');
  console.log('   SMTP_HOST:', process.env.SMTP_HOST);
  console.log('   SMTP_PORT:', process.env.SMTP_PORT || '587');
  console.log('   SMTP_USER:', process.env.SMTP_USER);
  console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NO CONFIGURADA');
  console.log('   SMTP_FROM:', process.env.SMTP_FROM || process.env.SMTP_USER);
  console.log('');

  // Crear transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true,
  });

  // Verificar conexión
  console.log('🔍 Verificando conexión SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente\n');
  } catch (error) {
    console.error('❌ Error al verificar conexión SMTP:');
    console.error('   Mensaje:', error.message);
    if (error.code) console.error('   Código:', error.code);
    if (error.response) console.error('   Respuesta:', error.response);
    process.exit(1);
  }

  // Enviar email de prueba
  const testEmail = process.env.SMTP_USER; // Enviar a sí mismo
  console.log(`📨 Enviando email de prueba a: ${testEmail}...`);

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: testEmail,
      subject: '🧪 Email de Prueba - Taekwondo MGG',
      html: `
        <h1>Email de Prueba</h1>
        <p>Si recibes este email, la configuración SMTP está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
      `,
    });

    console.log('✅ Email de prueba enviado correctamente');
    console.log('   MessageId:', info.messageId);
    console.log('   Revisa tu bandeja de entrada (y spam)');
  } catch (error) {
    console.error('❌ Error al enviar email de prueba:');
    console.error('   Mensaje:', error.message);
    if (error.code) console.error('   Código:', error.code);
    if (error.response) console.error('   Respuesta:', error.response);
    process.exit(1);
  }
}

testSMTP().catch(console.error);

