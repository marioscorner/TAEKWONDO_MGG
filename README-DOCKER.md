# 🐳 Guía de Docker

Este proyecto tiene dos configuraciones de Docker Compose:

## 📁 Archivos Docker Compose

### `docker-compose.yml` (Producción)
**Uso:** Despliegue en producción (VPS Hostinger)

Incluye:
- ✅ PostgreSQL (base de datos)
- ✅ Next.js App (aplicación)
- ✅ Nginx (reverse proxy con SSL)

**Comandos:**
```bash
# Desplegar
./scripts/deploy.sh

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

### `docker-compose.local.yml` (Desarrollo Local)
**Uso:** Desarrollo local (solo base de datos)

Incluye:
- ✅ PostgreSQL (base de datos local)

**Comandos:**
```bash
# Iniciar solo PostgreSQL
docker compose -f docker-compose.local.yml up -d

# Detener
docker compose -f docker-compose.local.yml down

# Ver logs
docker compose -f docker-compose.local.yml logs -f postgres
```

## 🚀 Desarrollo Local

Para desarrollo local, usa `docker-compose.local.yml` para la base de datos y ejecuta Next.js directamente:

```bash
# 1. Iniciar PostgreSQL
docker compose -f docker-compose.local.yml up -d

# 2. Configurar .env.local con:
DATABASE_URL="postgresql://postgres:postgres_local_password@localhost:5432/taekwondo_db?schema=public"

# 3. Ejecutar migraciones
npm run db:migrate

# 4. Iniciar Next.js en modo desarrollo
npm run dev
```

## 🏭 Producción

Para producción, usa `docker-compose.yml` (el archivo principal):

```bash
# 1. Configurar SSL
./scripts/setup-ssl.sh tu-dominio.com tu-email@example.com

# 2. Configurar .env.production

# 3. Desplegar
./scripts/deploy.sh
```

## 📝 Notas

- **Producción:** Usa `docker-compose.yml` (sin flag `-f`)
- **Desarrollo:** Usa `docker-compose.local.yml` (con flag `-f`)
- Los scripts (`deploy.sh`, `setup-ssl.sh`) usan automáticamente `docker-compose.yml`

