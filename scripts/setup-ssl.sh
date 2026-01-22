#!/bin/bash

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ Uso: ./scripts/setup-ssl.sh tu-dominio.com tu-email@example.com"
    echo ""
    echo "Ejemplo:"
    echo "  ./scripts/setup-ssl.sh taekwondo.marioscorner.com hello@marioscorner.com"
    exit 1
fi

echo "🔐 Configurando SSL para $DOMAIN..."

# Verificar que el dominio apunta a este servidor
echo "🔍 Verificando que $DOMAIN apunta a este servidor..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo "⚠️  Advertencia: El dominio $DOMAIN ($DOMAIN_IP) no apunta a este servidor ($SERVER_IP)"
    echo "   Asegúrate de que el DNS esté configurado correctamente antes de continuar"
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Instalar certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando certbot..."
    if [ -f /etc/debian_version ]; then
        sudo apt update
        sudo apt install -y certbot
    elif [ -f /etc/redhat-release ]; then
        sudo yum install -y certbot
    else
        echo "❌ No se pudo detectar el sistema operativo. Instala certbot manualmente."
        exit 1
    fi
fi

# Detener nginx temporalmente para obtener el certificado
echo "⏸️  Deteniendo nginx temporalmente..."
docker compose stop nginx 2>/dev/null || true

# Obtener certificado
echo "📜 Obteniendo certificado SSL de Let's Encrypt..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --preferred-challenges http

# Verificar que el certificado se creó
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ Error: No se pudo obtener el certificado"
    exit 1
fi

# Actualizar nginx.conf con el dominio
echo "📝 Actualizando configuración de Nginx..."
sed -i.bak "s/taekwondo.marioscorner.com/$DOMAIN/g" nginx/nginx.conf
rm nginx/nginx.conf.bak 2>/dev/null || true

# Reiniciar nginx
echo "▶️  Reiniciando nginx..."
docker compose up -d nginx

# Configurar renovación automática
echo "🔄 Configurando renovación automática..."
(crontab -l 2>/dev/null | grep -v "certbot renew" || true; echo "0 3 * * * certbot renew --quiet --deploy-hook 'docker compose restart nginx'") | crontab -

echo ""
echo "✅ SSL configurado correctamente!"
echo "🔒 Certificado instalado en /etc/letsencrypt/live/$DOMAIN/"
echo "🔄 Renovación automática configurada (diaria a las 3 AM)"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Actualiza NEXT_PUBLIC_APP_URL en .env.production a https://$DOMAIN"
echo "   2. Ejecuta ./scripts/deploy.sh para desplegar la aplicación"

