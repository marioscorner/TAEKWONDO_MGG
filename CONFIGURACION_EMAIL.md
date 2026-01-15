# 📧 Configuración de Email para Recuperación de Contraseña

Este documento explica cómo configurar el sistema de emails para la recuperación de contraseña.

---

## 🎯 Variables de Entorno Necesarias

Añade las siguientes variables a tu archivo `.env.local` (para desarrollo) o `.env` (para producción):

```env
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-aqui
SMTP_FROM=Taekwondo Mario Gutiérrez <tu-email@gmail.com>

# URL de la aplicación (para links en emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Cambiar en producción
```

---

## 📮 Opciones de Servicio SMTP

### Opción 1: Gmail (Recomendado para desarrollo)

1. **Habilitar verificación en 2 pasos:**
   - Ve a tu cuenta de Google
   - Seguridad > Verificación en 2 pasos
   - Actívala si no la tienes

2. **Crear contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro dispositivo personalizado"
   - Nombra la app (ej: "Taekwondo App")
   - Copia la contraseña de 16 caracteres generada

3. **Configurar variables:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # Contraseña de aplicación de 16 caracteres
   SMTP_FROM=Taekwondo Mario Gutiérrez <tu-email@gmail.com>
   ```

---

### Opción 2: Resend.com (Recomendado para producción)

**Ventajas:**
- ✅ Gratis hasta 3,000 emails/mes
- ✅ Fácil configuración
- ✅ Dashboard con estadísticas
- ✅ API moderna

**Pasos:**

1. Regístrate en https://resend.com
2. Verifica tu dominio (o usa el sandbox)
3. Genera una API Key
4. Configurar variables:
   ```env
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASS=re_TuAPIKeyAqui
   SMTP_FROM=Taekwondo <onboarding@resend.dev>
   ```

---

### Opción 3: SendGrid

**Ventajas:**
- ✅ Gratis hasta 100 emails/día
- ✅ Confiable y escalable
- ✅ Analytics detallados

**Pasos:**

1. Regístrate en https://sendgrid.com
2. Verifica tu identidad de remitente
3. Crea una API Key
4. Configurar variables:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.TuAPIKeyAqui
   SMTP_FROM=Taekwondo Mario Gutiérrez <tu-email-verificado@tudominio.com>
   ```

---

### Opción 4: Servidor SMTP Propio

Si tienes un servidor de email propio:

```env
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587  # o 465 si usas SSL
SMTP_USER=noreply@tudominio.com
SMTP_PASS=tu-contraseña
SMTP_FROM=Taekwondo <noreply@tudominio.com>
```

---

## 🗄️ Actualizar Base de Datos

Después de configurar las variables de entorno, actualiza la base de datos:

```bash
# Genera el cliente de Prisma
npm run db:generate

# Sincroniza el schema con la BD (crea la tabla PasswordResetToken)
npm run db:push
```

---

## 🧪 Probar la Funcionalidad

### 1. Solicitar recuperación de contraseña

1. Ve a: http://localhost:3000/login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Deberías recibir un email con el enlace

### 2. Verificar en los logs

Si no recibes el email, revisa los logs del servidor:

```bash
npm run dev
```

Busca mensajes como:
```
✅ Email de recuperación enviado a: usuario@email.com
```

O errores como:
```
❌ Error al enviar email: [detalles del error]
```

### 3. Restablecer contraseña

1. Click en el enlace del email
2. Ingresa tu nueva contraseña
3. Confirma la contraseña
4. Deberías ser redirigido al login

---

## 🐛 Solución de Problemas

### Error: "Environment variable not found: SMTP_HOST"

**Solución:** Verifica que tu archivo `.env.local` existe y tiene las variables correctas.

```bash
# Crear archivo si no existe
cp .env.example .env.local

# Editar y añadir las variables SMTP
nano .env.local  # o code .env.local
```

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solución (Gmail):**
- Verifica que tienes la verificación en 2 pasos activada
- Usa una contraseña de aplicación, no tu contraseña normal
- La contraseña de aplicación debe ser de 16 caracteres sin espacios

### Error: "Error al enviar email: Connection timeout"

**Solución:**
- Verifica que el puerto SMTP es correcto (587 o 465)
- Prueba cambiar el puerto
- Verifica que tu firewall permite conexiones SMTP

### Los emails llegan a spam

**Soluciones:**
1. Configura SPF, DKIM y DMARC en tu dominio (si usas dominio propio)
2. Usa un servicio profesional como Resend o SendGrid
3. Pide a los usuarios que marquen como "no es spam"

---

## 🔐 Seguridad

### Recomendaciones:

1. **Nunca** subas el archivo `.env.local` a Git
2. Usa contraseñas de aplicación, no contraseñas normales
3. Rota las API keys periódicamente
4. En producción, usa servicios profesionales (Resend, SendGrid)
5. Los tokens expiran en 1 hora automáticamente
6. Los tokens solo se pueden usar una vez

---

## 📝 Ejemplo Completo de `.env.local`

```env
# Base de datos (ya configurado)
DATABASE_URL="postgresql://usuario:password@host:5432/database"

# JWT Secrets (ya configurado)
JWT_SECRET="tu-secret-super-seguro"
JWT_REFRESH_SECRET="otro-secret-diferente"

# URL de la app
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SMTP para emails (NUEVO)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Contraseña de aplicación de Gmail
SMTP_FROM=Taekwondo Mario Gutiérrez <tu-email@gmail.com>

# Contraseña secreta para registro de instructores (NUEVO)
INSTRUCTOR_SECRET_PASSWORD="tu-contraseña-secreta-aqui"
```

---

## 🚀 En Producción

Para producción, cambia:

```env
# URL de producción
NEXT_PUBLIC_APP_URL="https://tudominio.com"

# Usar servicio profesional
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_TuAPIKeyDeProduccion
SMTP_FROM=Taekwondo <noreply@tudominio.com>
```

---

## ✅ Checklist de Configuración

- [ ] Variables SMTP añadidas a `.env.local`
- [ ] Base de datos actualizada (`npm run db:push`)
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Probado solicitar recuperación
- [ ] Email recibido correctamente
- [ ] Probado restablecer contraseña
- [ ] Funciona correctamente

---

**¡Listo!** El sistema de recuperación de contraseña está completamente funcional. 🎉

Para más ayuda, revisa los logs del servidor o contacta al desarrollador.

