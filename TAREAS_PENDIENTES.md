# 📋 Tareas Pendientes

Este documento lista las tareas que están pendientes de completar o configurar.

---

## ⚙️ Configuración Pendiente

### 🔐 Configuración de Gmail para Recuperación de Contraseña

**Estado:** ⏳ Pendiente de configurar  
**Prioridad:** Media  
**Tiempo estimado:** 15-20 minutos

**Descripción:**
La funcionalidad de recuperación de contraseña está **completamente implementada** (código, endpoints, páginas, emails), pero falta configurar las variables de entorno SMTP para que los emails se envíen realmente.

**Pasos a seguir:**

1. **Habilitar verificación en 2 pasos en Gmail:**
   - Ir a: https://myaccount.google.com/security
   - Activar "Verificación en 2 pasos" si no está activada

2. **Crear contraseña de aplicación:**
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y "Otro dispositivo personalizado"
   - Nombrar la app (ej: "Taekwondo App")
   - Copiar la contraseña de 16 caracteres generada

3. **Añadir variables a `.env.local`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # La contraseña de aplicación de 16 caracteres
   SMTP_FROM="Taekwondo Mario Gutiérrez <tu-email@gmail.com>"
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # Cambiar en producción
   ```

4. **Actualizar base de datos:**
   ```bash
   npm run db:push
   ```

5. **Probar:**
   - Ir a `/login` → "¿Olvidaste tu contraseña?"
   - Ingresar email
   - Verificar que llega el email

**Documentación relacionada:**
- `CONFIGURACION_EMAIL.md` - Guía completa de configuración SMTP
- `RECUPERACION_PASSWORD_COMPLETADO.md` - Detalles de la implementación

**Nota:** La funcionalidad está lista, solo falta la configuración de las credenciales SMTP.

---

### 🥋 Configuración de Contraseña Secreta para Registro de Instructores

**Estado:** ⏳ Pendiente de configurar  
**Prioridad:** Media  
**Tiempo estimado:** 5 minutos

**Descripción:**
El sistema de registro de instructores está **completamente implementado** (código, endpoints, páginas), pero falta configurar la contraseña secreta en las variables de entorno.

**Pasos a seguir:**

1. **Añadir variable a `.env.local`:**
   ```env
   INSTRUCTOR_SECRET_PASSWORD="tu-contraseña-secreta-aqui"
   ```

2. **Elegir una contraseña segura:**
   - Mínimo 8 caracteres
   - Combina letras, números y símbolos
   - Ejemplo: `TKD_Inst_2026!MG`

3. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

4. **Probar:**
   - Ir a `/register/instructor`
   - Completar el formulario con la contraseña secreta
   - Verificar que se crea el usuario con rol INSTRUCTOR

**Documentación relacionada:**
- `REGISTRO_INSTRUCTOR.md` - Guía completa de la funcionalidad
- `CONFIGURACION_EMAIL.md` - Incluye ejemplo de `.env.local`

**Nota:** Esta contraseña la compartirás con personas autorizadas para registrarse como instructores.

---

## ✅ Funcionalidades Completadas (pero pendientes de probar)

- ✅ Recuperación de contraseña (código completo, falta configurar SMTP)
- ✅ Panel de instructor con listado de alumnos
- ✅ Cambio de cinturones desde panel de instructor
- ✅ Amistad automática alumno-instructor
- ✅ Protección de instructores (no se pueden eliminar)
- ✅ Registro de instructores con contraseña secreta (falta configurar variable)

---

## 📝 Notas

- Este archivo se actualiza conforme se completan tareas
- Las tareas con ⏳ están pendientes
- Las tareas con ✅ están completadas pero pueden necesitar pruebas

