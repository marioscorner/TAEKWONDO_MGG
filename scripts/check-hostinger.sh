#!/bin/bash

echo "🔍 Verificando configuración para Hostinger VPS..."
echo ""

# Verificar Docker
echo "📦 Docker:"
if command -v docker &> /dev/null; then
    docker --version
else
    echo "   ❌ Docker no está instalado"
fi
echo ""

# Verificar Docker Compose
echo "🐳 Docker Compose:"
if command -v docker compose &> /dev/null; then
    docker compose version
else
    echo "   ❌ Docker Compose no está instalado"
fi
echo ""

# Verificar puertos
echo "🔌 Puertos:"
if command -v netstat &> /dev/null; then
    netstat -tuln | grep -E ":80|:443" || echo "   ✅ Puertos 80 y 443 disponibles"
else
    echo "   ⚠️  netstat no disponible, verifica manualmente"
fi
echo ""

# Verificar IP
echo "🌐 IP Pública:"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip)
echo "   $PUBLIC_IP"
echo ""

# Verificar espacio en disco
echo "💾 Espacio en disco:"
df -h / | tail -1 | awk '{print "   Disponible: " $4 " de " $2 " (" $5 " usado)"}'
echo ""

# Verificar memoria
echo "🧠 Memoria:"
free -h | grep Mem | awk '{print "   Total: " $2 ", Disponible: " $7}'
echo ""

# Verificar firewall
echo "🔥 Firewall (UFW):"
if command -v ufw &> /dev/null; then
    ufw status | head -1
else
    echo "   ⚠️  UFW no instalado (opcional)"
fi
echo ""

# Verificar certificados SSL
echo "🔐 Certificados SSL:"
if [ -d "/etc/letsencrypt/live" ]; then
    echo "   ✅ Let's Encrypt configurado"
    ls -1 /etc/letsencrypt/live/ 2>/dev/null | head -5
else
    echo "   ⚠️  Let's Encrypt no configurado aún"
fi
echo ""

# Verificar contenedores Docker
echo "🐳 Contenedores Docker:"
if command -v docker &> /dev/null; then
    RUNNING=$(docker ps -q | wc -l)
    ALL=$(docker ps -aq | wc -l)
    echo "   Corriendo: $RUNNING, Total: $ALL"
else
    echo "   Docker no disponible"
fi
echo ""

echo "✅ Verificación completada"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Si falta algo, instálalo siguiendo DEPLOY.md"
echo "   2. Configura .env.production"
echo "   3. Ejecuta ./scripts/setup-ssl.sh para SSL"
echo "   4. Ejecuta ./scripts/deploy.sh para desplegar"

