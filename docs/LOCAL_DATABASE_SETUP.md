# Base de Datos PostgreSQL Local

Guia para ejecutar PostgreSQL local con Docker Compose y preparar el esquema con Prisma.

## Configuracion

El proyecto incluye `docker-compose.local.yml`, que levanta solo PostgreSQL para desarrollo:

- Imagen: `postgres:16-alpine`
- Contenedor: `taekwondo_postgres`
- Base de datos: `taekwondo_db`
- Usuario: `postgres`
- Puerto local: `5432`

La conexion esperada en `.env.local` es:

```env
DATABASE_URL="postgresql://postgres:postgres_local_password@localhost:5432/taekwondo_db?schema=public"
```

## Comandos Basicos

### Iniciar la base de datos

```bash
docker compose -f docker-compose.local.yml up -d
```

### Detener la base de datos

```bash
docker compose -f docker-compose.local.yml down
```

### Detener y eliminar datos

Esto elimina el volumen de PostgreSQL y todos los datos locales.

```bash
docker compose -f docker-compose.local.yml down -v
```

### Ver logs

```bash
docker compose -f docker-compose.local.yml logs -f postgres
```

### Ver estado del contenedor

```bash
docker compose -f docker-compose.local.yml ps
```

## Preparar el Esquema

### Aplicar migraciones existentes

```bash
npm run db:migrate:deploy
```

### Regenerar Prisma Client

```bash
npm run db:generate
```

### Ver estado de migraciones

```bash
npm run db:migrate:status
```

### Crear una nueva migracion durante desarrollo

```bash
npm run db:migrate -- --name nombre_del_cambio
```

## Acceso Directo a PostgreSQL

### Abrir psql dentro del contenedor

```bash
docker exec -it taekwondo_postgres psql -U postgres -d taekwondo_db
```

### Comandos utiles en psql

```sql
-- Ver tablas
\dt

-- Describir una tabla
\d "User"

-- Salir
\q
```

## Gestion de Datos

### Abrir Prisma Studio

```bash
npm run db:studio
```

Prisma Studio queda disponible normalmente en `http://localhost:5555`.

### Reiniciar la base de datos local

```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
npm run db:migrate:deploy
npm run db:generate
```

El repositorio no incluye un seed automatico de usuarios de prueba. Para crear un administrador usa:

```bash
npm run create-superuser
```

## Backup y Restauracion

### Crear backup

```bash
docker exec taekwondo_postgres pg_dump -U postgres taekwondo_db > backup.sql
```

### Restaurar backup

```bash
docker exec -i taekwondo_postgres psql -U postgres taekwondo_db < backup.sql
```

## Troubleshooting

### El puerto 5432 ya esta en uso

Si tienes otra instancia de PostgreSQL corriendo localmente, puedes detenerla o cambiar el puerto publicado en `docker-compose.local.yml`:

```yaml
ports:
  - "5433:5432"
```

Despues actualiza `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres_local_password@localhost:5433/taekwondo_db?schema=public"
```

### No puedo conectarme a la base de datos

Verifica el contenedor:

```bash
docker compose -f docker-compose.local.yml ps
```

Revisa logs:

```bash
docker compose -f docker-compose.local.yml logs postgres
```

Reinicia el servicio:

```bash
docker compose -f docker-compose.local.yml restart postgres
```

## Produccion

En produccion el repositorio usa `docker-compose.yml`, que levanta la aplicacion, PostgreSQL y Nginx. Consulta `DEPLOY.md` para el despliegue completo.
