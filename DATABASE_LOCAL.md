# Base de Datos PostgreSQL Local

## Configuración

Hemos migrado de Supabase a una base de datos PostgreSQL local usando Docker para evitar problemas de conectividad IPv6.

## Comandos Básicos

### Iniciar la base de datos

```bash
docker compose up -d
```

### Detener la base de datos

```bash
docker compose down
```

### Detener y eliminar datos

```bash
docker compose down -v
```

### Ver logs de la base de datos

```bash
docker compose logs -f postgres
```

### Ver estado de los contenedores

```bash
docker compose ps
```

## Gestión de Migraciones

### Crear una nueva migración

```bash
npm run db:migrate
```

### Aplicar migraciones pendientes

```bash
npx prisma migrate deploy
```

### Ver estado de las migraciones

```bash
npm run db:migrate:status
```

### Regenerar el cliente de Prisma

```bash
npm run db:generate
```

## Acceso Directo a PostgreSQL

### Conectar con psql

```bash
docker exec -it taekwondo_postgres psql -U postgres -d taekwondo_db
```

### Comandos útiles en psql

```sql
-- Ver todas las tablas
\dt

-- Describir una tabla
\d "User"

-- Salir de psql
\q
```

## Gestión de Datos

### Ver la base de datos con Prisma Studio

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en `http://localhost:5555` donde puedes ver y editar datos visualmente.

### Reiniciar la base de datos (eliminar todos los datos)

```bash
# Opción 1: Solo eliminar datos (mantener esquema)
npx prisma migrate reset

# Opción 2: Eliminar volumen de Docker (eliminar todo)
docker compose down -v
docker compose up -d
npm run db:migrate
```

## Usuarios de Prueba

Los siguientes usuarios están pre-creados:

**Instructor:**
- Email: mariogugon@outlook.com
- Password: password123
- Role: INSTRUCTOR

**Alumno:**
- Email: alumno@test.com
- Password: alumno123
- Role: ALUMNO

## Conexión desde la Aplicación

La cadena de conexión está en `.env` y `.env.local`:

```
DATABASE_URL="postgresql://postgres:postgres_local_password@localhost:5432/taekwondo_db?schema=public"
```

## Backup y Restauración

### Crear un backup

```bash
docker exec taekwondo_postgres pg_dump -U postgres taekwondo_db > backup.sql
```

### Restaurar desde un backup

```bash
docker exec -i taekwondo_postgres psql -U postgres taekwondo_db < backup.sql
```

## Troubleshooting

### El puerto 5432 ya está en uso

Si tienes otra instancia de PostgreSQL corriendo localmente:

```bash
# Opción 1: Detener PostgreSQL local
sudo systemctl stop postgresql

# Opción 2: Cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar puerto 5433 en lugar de 5432

# Y actualizar DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:postgres_local_password@localhost:5433/taekwondo_db?schema=public"
```

### No puedo conectarme a la base de datos

1. Verifica que el contenedor está corriendo:
   ```bash
   docker compose ps
   ```

2. Verifica los logs:
   ```bash
   docker compose logs postgres
   ```

3. Reinicia el contenedor:
   ```bash
   docker compose restart
   ```

## Ventajas de PostgreSQL Local

✅ Sin problemas de conectividad IPv6
✅ Desarrollo completamente offline
✅ Control total sobre la base de datos
✅ Mismo motor que en producción
✅ Datos de prueba persistentes
✅ Sin costos de servicio externo

## Para Producción

En producción, puedes usar:
- PostgreSQL en tu VPS
- Supabase con IPv6
- Cualquier otro proveedor de PostgreSQL

Solo necesitas cambiar la `DATABASE_URL` en las variables de entorno de producción.


