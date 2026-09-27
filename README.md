## 1. APTIV-PLATFORM

Plataforma de OEE y Andon para piso de producción. SvelteKit 5, Tailwind 4, MongoDB, un proceso Node (`adapter-node` + PM2 en modo fork).

```sh
npm install
npm run build-aptiv
```

## 2. Respaldos de MongoDB

Guía para respaldo y restauración binaria local con `mongodump` y `mongorestore`. Requiere MongoDB Database Tools en el PATH.

### Crear el backup

```bash
cd db
mongodump --uri="mongodb://localhost:27017/APTIV_PLATFORM" --archive="Backup_APTIV_PLATFORM.gz" --gzip
```

### Restaurar el backup

Borra las colecciones actuales y recrea documentos e índices:

```bash
cd db
mongorestore --uri="mongodb://localhost:27017/APTIV_PLATFORM" --archive="Backup_APTIV_PLATFORM.gz" --gzip --drop
```

En la app, el mismo flujo está en `/admin/backup` (solo ADMIN).

## 3. Configuración como Servicio de Windows

Para garantizar la disponibilidad de la plataforma y evitar que los procesos se detengan al cerrar la sesión de usuario o al reiniciarse el servidor de planta, configura PM2 como un servicio nativo del sistema.

> ⚠️ **Importante:** Ejecuta la terminal (**PowerShell o CMD**) con **permisos de Administrador**.

### Paso 1: Instalar el gestor de servicios para PM2
```bash
npm install --global pm2-windows-service
```

### Paso 2: Instalar el servicio en el sistema OS
```bash
pm2-service-install
```
* Presiona **`Y`** cuando se te pregunte `Perform environment setup?`.
* Presiona **Enter** en la sección `PM2_HOME` para utilizar la ruta por defecto del usuario.

### Paso 3: Desplegar y congelar la aplicación
Navega hasta la carpeta del proyecto donde se ubica tu archivo `ecosystem.config.js` e inicia el proceso:

```bash
pm2 start ecosystem.config.js
```

Inmediatamente después, ejecuta el comando de congelamiento para persistir la configuración en los arranques del sistema:
```bash
pm2 save
```

---

## 4. Comandos de Administración Útiles

* **Monitorear el estado del Andon:**
  ```bash
  pm2 status
  ```
* **Inspeccionar logs en tiempo real:**
  ```bash
  pm2 logs aptiv-platform
  ```
* **Reiniciar el servidor tras cambios de código o despliegues:**
  ```bash
  pm2 restart aptiv-platform
  ```
* **Interfaz gráfica de monitoreo integrada:**
  ```bash
  pm2 monit
  ```
