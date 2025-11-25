# 📖 Guía de Configuración Completa

## 🎯 Pasos para poner en marcha el proyecto

### 1. Instalar PostgreSQL

#### En macOS (con Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### En Windows:
1. Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Ejecuta el instalador y sigue los pasos
3. Anota la contraseña que configures para el usuario `postgres`

#### En Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Crear la base de datos

```bash
# Acceder a PostgreSQL
psql -U postgres

# Dentro de psql:
CREATE DATABASE taekwondo_db;
CREATE USER tkd_user WITH ENCRYPTED PASSWORD 'tu_password_segura';
GRANT ALL PRIVILEGES ON DATABASE taekwondo_db TO tkd_user;
\q
```

### 3. Configurar el proyecto

```bash
# Clonar e instalar
git clone <tu-repositorio>
cd frontend-tkd
npm install

# Copiar variables de entorno
cp .env.example .env.local
```

### 4. Editar `.env.local`

```env
DATABASE_URL="postgresql://tkd_user:tu_password_segura@localhost:5432/taekwondo_db"
JWT_SECRET="genera-un-string-aleatorio-largo-aqui"
JWT_REFRESH_SECRET="genera-otro-string-aleatorio-diferente"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generar secrets seguros:**
```bash
# En terminal (Linux/Mac):
openssl rand -base64 32

# En PowerShell (Windows):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 5. Configurar la base de datos con Prisma

```bash
# Generar el cliente
npm run db:generate

# Crear las tablas
npm run db:push

# (Opcional) Ver los datos en Prisma Studio
npm run db:studio
```

### 6. Crear un usuario de prueba (opcional)

Puedes usar Prisma Studio (`npm run db:studio`) o crear un usuario mediante la API:

```bash
# Una vez que el servidor esté corriendo:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taekwondo.com",
    "username": "admin",
    "password": "password123",
    "firstName": "Mario",
    "lastName": "Gutiérrez"
  }'
```

### 7. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🐛 Problemas Comunes

### Error: "relation does not exist"
**Solución:** Ejecuta `npm run db:push` para crear las tablas.

### Error: "password authentication failed"
**Solución:** Verifica que el usuario y contraseña en `DATABASE_URL` sean correctos.

### Error: "Port 3000 is already in use"
**Solución:** Mata el proceso en el puerto 3000 o usa otro puerto:
```bash
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambia el puerto:
npm run dev -- -p 3001
```

### Error: "Cannot find module '@prisma/client'"
**Solución:** 
```bash
npm run db:generate
```

---

## 🔄 Actualizar el Schema de Base de Datos

Si modificas `prisma/schema.prisma`:

```bash
# Opción 1: Push directo (desarrollo)
npm run db:push

# Opción 2: Crear migración (recomendado para producción)
npm run db:migrate
```

---

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `next` | 15.5.3 | Framework |
| `react` | 19.1.0 | UI |
| `@prisma/client` | ^6.1.0 | ORM |
| `jose` | ^5.9.6 | JWT |
| `bcrypt` | ^5.1.1 | Hash passwords |
| `zod` | ^3.24.1 | Validación |
| `axios` | ^1.12.2 | HTTP client |
| `tailwindcss` | ^4 | Estilos |

---

## 🎨 Configuración de Desarrollo Recomendada

### VSCode Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

### Configuración de Prettier (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 🚀 Siguientes Pasos

1. ✅ Configurar el proyecto ← **Estás aquí**
2. 📝 Crear usuarios de prueba
3. 🧪 Probar las funcionalidades
4. 🎨 Personalizar estilos
5. 🚀 Deploy a producción

---

¿Problemas? Revisa los logs en la consola o contacta al equipo de desarrollo.

