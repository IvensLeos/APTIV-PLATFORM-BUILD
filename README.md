# APTIV-PLATFORM

Plataforma de OEE y Andon para piso de producción. SvelteKit 5, Tailwind 4, MongoDB, un proceso Node (`adapter-node` + PM2 en modo fork).

- Arquitectura y convenciones: [ARCHITECTURE.md](ARCHITECTURE.md)
- Esquema de MongoDB: [DATABASE-CONTEXT.md](DATABASE-CONTEXT.md)
- Turnos y hora de planta: `src/lib/shifts.js`, `src/lib/plantTime.js`
- Acceso al panel: `src/lib/server/access.js` (público: dashboards, captura y Andon; panel: SUPERVISOR/ADMIN)

```sh
npm install
npm run dev
```

Producción: push a `main` dispara `.github/workflows/deploy.yml`, que arranca `ecosystem.config.cjs`.

## Respaldos de MongoDB

Guía para respaldo y restauración binaria local con `mongodump` y `mongorestore`. Requiere MongoDB Database Tools en el PATH.

### Crear el backup

```bash
cd db
mongodump --uri="mongodb://localhost:27017/APTIV_PLATFORM" --archive="Backup_APTIV_PLATFORM.gz" --gzip
```

### Restaurar el backup

Borra las colecciones actuales y recrea documentos, índices (incluido `unique_oee_identifier`):

```bash
cd db
mongorestore --uri="mongodb://localhost:27017/APTIV_PLATFORM" --archive="Backup_APTIV_PLATFORM.gz" --gzip --drop
```

En la app, el mismo flujo está en `/admin/backup` (solo ADMIN).
