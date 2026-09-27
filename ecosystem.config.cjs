// Configuración única de producción para PM2.
// El deploy (.github/workflows/deploy.yml) copia este archivo junto al build
// y lo arranca con: pm2 startOrReload ecosystem.config.cjs --update-env
const fs = require('node:fs');
const path = require('node:path');

/**
 * adapter-node NO lee .env en runtime; PM2 debe inyectar las variables.
 * Cargamos el .env que vive junto a este archivo (si existe) y encima
 * aplicamos los valores fijos de despliegue, que siempre tienen prioridad.
 */
function loadDotEnv(file) {
  const vars = {};
  if (!fs.existsSync(file)) return vars;
  for (const rawLine of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

module.exports = {
  apps: [
    {
      name: 'aptiv-platform',
      // El deploy copia el contenido de build\ a la raíz de la carpeta de producción
      script: './index.js',
      cwd: __dirname,

      // Una sola instancia en modo fork: el bus Andon (SSE) y el cron viven en memoria del proceso.
      instances: 1,
      exec_mode: 'fork',

      autorestart: true,
      max_memory_restart: '1G',
      kill_timeout: 5000,

      env: {
        ...loadDotEnv(path.join(__dirname, '.env')),

        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 80,
        ORIGIN: 'http://dlhs372n3.aptiv.com',

        // Obligatorio: los equipos de planta no pueden consultar el ERP (*.aptiv.com) sin este bypass TLS.
        NODE_TLS_REJECT_UNAUTHORIZED: '0',

        // Fuerza el scraping contra los servidores reales y etiqueta los logs como [PROD].
        FORCE_PROD: 'true'
      }
    }
  ]
};
