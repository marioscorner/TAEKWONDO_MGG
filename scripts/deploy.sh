#!/bin/bash

set -e

echo "🚀 Desplegando Taekwondo MGG..."

# Cargar variables de entorno
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production no encontrado"
    echo "📝 Crea el archivo .env.production con todas las variables necesarias"
    exit 1
fi

export $(cat .env.production | grep -v '^#' | xargs)

# Verificar que las variables críticas estén definidas
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_SECRET" ] || [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "❌ Error: Variables críticas no definidas en .env.production"
    echo "   Requeridas: POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET"
    exit 1
fi

# Detener contenedores existentes
echo "⏹️  Deteniendo contenedores..."
docker compose down

# Construir nuevas imágenes
echo "🔨 Construyendo imágenes..."
docker compose build --no-cache

# Iniciar servicios
echo "▶️  Iniciando servicios..."
docker compose up -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a PostgreSQL..."
sleep 15

# Verificar que PostgreSQL esté listo
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Esperando a PostgreSQL..."
    sleep 2
done

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
docker compose exec -T app npx prisma migrate deploy || {
    echo "⚠️  Error en migraciones. Intentando generar Prisma Client..."
    docker compose exec -T app npx prisma generate
    docker compose exec -T app npx prisma migrate deploy
}

echo ""
echo "✅ Deploy completado!"
echo "📱 Aplicación: ${NEXT_PUBLIC_APP_URL:-https://tu-dominio.com}"
echo "🗄️  PostgreSQL: postgres:5432 (interno)"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: docker compose logs -f"
echo "   Reiniciar: docker compose restart"
echo "   Detener: docker compose down"

