# 🚀 Guía de Despliegue con Docker, Nginx y SSL

Esta guía te ayudará a desplegar la aplicación Taekwondo MGG en producción usando Docker, Nginx como reverse proxy y certificados SSL de Let's Encrypt.

**✅ Optimizado para Hostinger VPS**

## 📋 Requisitos Previos

- **VPS Hostinger** con Ubuntu/Debian (recomendado) o similar
- **Docker** y **Docker Compose** instalados
- **Dominio** apuntando a la IP del VPS
- **Puertos 80 y 443** abiertos en el firewall de Hostinger
- **Acceso root o sudo** al servidor

## 🔧 Instalación Inicial

### 1. Conectar al VPS de Hostinger

```bash
# Conectar por SSH
ssh root@tu-ip-o-dominio

# O si usas usuario específico
ssh usuario@tu-ip-o-dominio
```

### 2. Instalar Docker y Docker Compose

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias
apt install -y curl git

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose (plugin)
apt install -y docker-compose-plugin

# Iniciar y habilitar Docker
systemctl start docker
systemctl enable docker

# Verificar instalación
docker --version
docker compose version
```

**Nota para Hostinger:** Si tienes problemas con permisos, asegúrate de estar como root o añade tu usuario al grupo docker:

```bash
# Si no eres root
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clonar el Repositorio

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/TAEKWONDO_MGG.git
cd TAEKWONDO_MGG

# O si ya tienes el código, subirlo al servidor
# scp -r ./TAEKWONDO_MGG root@tu-servidor:/root/
```

### 2.1. Verificar Configuración (Opcional)

```bash
# Ejecutar script de verificación
chmod +x scripts/check-hostinger.sh
./scripts/check-hostinger.sh
```

Este script verifica que todo esté listo para el despliegue.

### 3. Configurar Variables de Entorno

```bash
# Crear archivo de producción
cp .env.example .env.production
nano .env.production
```

**Variables requeridas:**

```env
# Base de datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_segura_aqui
POSTGRES_DB=taekwondo_db
DATABASE_URL=postgresql://postgres:tu_password_segura_aqui@postgres:5432/taekwondo_db?schema=public

# JWT
JWT_SECRET=genera_un_secret_largo_y_aleatorio
JWT_REFRESH_SECRET=otro_secret_diferente_y_largo

# Aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM=tu-email@gmail.com

# Instructor
INSTRUCTOR_SECRET_PASSWORD=tu_contraseña_secreta_instructor
```

**Generar secrets seguros:**

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar JWT_REFRESH_SECRET
openssl rand -base64 32
```

## 🔐 Configurar SSL con Let's Encrypt

### 1. Configurar DNS

Asegúrate de que tu dominio apunta a la IP del servidor:

```bash
# Verificar IP del servidor
curl ifconfig.me

# Verificar DNS
dig +short tu-dominio.com
```

### 2. Obtener Certificado SSL

```bash
# Dar permisos de ejecución
chmod +x scripts/setup-ssl.sh

# Ejecutar script de SSL
./scripts/setup-ssl.sh tu-dominio.com tu-email@example.com
```

Este script:

- Instala certbot si no está instalado
- Obtiene el certificado SSL de Let's Encrypt
- Configura la renovación automática
- Actualiza la configuración de Nginx

### 3. Actualizar URL en .env.production

```bash
# Editar .env.production
nano .env.production

# Cambiar NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 🚀 Desplegar la Aplicación

### 1. Desplegar

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecutar deploy
./scripts/deploy.sh
```

Este script:

- Verifica las variables de entorno
- Detiene contenedores existentes
- Construye nuevas imágenes
- Inicia todos los servicios
- Ejecuta migraciones de base de datos

### 2. Verificar el Despliegue

```bash
# Ver logs
docker compose logs -f

# Ver estado de contenedores
docker compose ps

# Verificar health check
curl https://tu-dominio.com/health
```

## 📊 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f app
docker compose logs -f nginx
docker compose logs -f postgres

# Reiniciar servicios
docker compose restart

# Reiniciar un servicio específico
docker compose restart app

# Detener todo
docker compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker compose down -v
```

### Base de Datos

```bash
# Backup de base de datos
docker compose exec postgres pg_dump -U postgres taekwondo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T postgres psql -U postgres taekwondo_db < backup.sql

# Acceder a PostgreSQL
docker compose exec postgres psql -U postgres -d taekwondo_db

# Ejecutar migraciones manualmente
docker compose exec app npx prisma migrate deploy
```

### Actualizar la Aplicación

```bash
# 1. Hacer pull de cambios
git pull

# 2. Reconstruir y desplegar
./scripts/deploy.sh

# O manualmente:
docker compose build --no-cache
docker compose up -d
docker compose exec app npx prisma migrate deploy
```

### SSL y Certificados

```bash
# Renovar certificado manualmente
sudo certbot renew

# Verificar certificado
sudo certbot certificates

# Probar renovación (dry-run)
sudo certbot renew --dry-run
```

## 🔒 Seguridad

### Firewall en Hostinger VPS

Hostinger generalmente gestiona el firewall a través de su panel. Sin embargo, puedes configurar UFW localmente:

```bash
# Instalar UFW (si no está instalado)
apt install -y ufw

# Permitir SSH (¡IMPORTANTE! No cierres esta conexión)
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activar firewall
ufw enable

# Ver estado
ufw status
```

**⚠️ Importante para Hostinger:**

- Verifica en el panel de Hostinger que los puertos 80 y 443 estén abiertos
- Algunos planes de Hostinger pueden requerir configuración adicional en el panel
- Si tienes problemas de conectividad, revisa el firewall en el panel de Hostinger

### Actualizar Sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Reiniciar si es necesario
sudo reboot
```

## 🏢 Notas Específicas para Hostinger VPS

### Configuración de Red

Hostinger VPS puede tener configuraciones de red específicas:

1. **IP Pública**: Verifica que tu dominio apunta a la IP pública del VPS
2. **Panel de Control**: Revisa el panel de Hostinger para configuraciones de firewall
3. **Puertos**: Asegúrate de que los puertos 80 y 443 estén abiertos en el panel

### Verificar IP del VPS

```bash
# Ver IP pública
curl ifconfig.me

# Ver IPs de red
ip addr show
```

### Configuración de Dominio en Hostinger

1. Ve al panel de Hostinger
2. Configura el DNS de tu dominio para apuntar a la IP del VPS
3. Espera a que se propague (puede tardar hasta 24 horas, pero generalmente es más rápido)

### Recursos del VPS

```bash
# Ver uso de recursos
htop

# Ver espacio en disco
df -h

# Ver memoria
free -h
```

**Recomendaciones para Hostinger:**

- Plan mínimo recomendado: 2GB RAM, 2 vCPU
- Asegúrate de tener al menos 10GB de espacio libre
- Monitorea el uso de recursos durante los primeros días

## 🐛 Troubleshooting

### La aplicación no inicia

```bash
# Ver logs detallados
docker compose logs app

# Verificar variables de entorno
docker compose exec app env | grep -E "DATABASE_URL|JWT_SECRET"
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker compose ps postgres

# Ver logs de PostgreSQL
docker compose logs postgres

# Probar conexión
docker compose exec postgres pg_isready -U postgres
```

### Error 502 Bad Gateway

```bash
# Verificar que la app está corriendo
docker compose ps app

# Ver logs de Nginx
docker compose logs nginx

# Verificar configuración de Nginx
docker compose exec nginx nginx -t
```

### Certificado SSL no funciona

```bash
# Verificar que el certificado existe
sudo ls -la /etc/letsencrypt/live/tu-dominio.com/

# Verificar renovación
sudo certbot certificates

# Forzar renovación
sudo certbot renew --force-renewal
docker compose restart nginx
```

## 📝 Notas Importantes

1. **Backups**: Configura backups automáticos de la base de datos
2. **Monitoreo**: Considera usar herramientas como Uptime Robot para monitorear la aplicación
3. **Logs**: Los logs se pueden ver con `docker compose logs`
4. **Renovación SSL**: Se renueva automáticamente, pero verifica periódicamente
5. **Actualizaciones**: Mantén Docker y el sistema operativo actualizados

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica las variables de entorno en `.env.production`
3. Asegúrate de que el dominio apunta correctamente al servidor
4. Verifica que los puertos 80 y 443 están abiertos

---

**¡Tu aplicación debería estar funcionando en https://tu-dominio.com!** 🎉
