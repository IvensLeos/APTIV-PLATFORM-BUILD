// Configuración única de producción para PM2.

module.exports = {
  apps: [
    {
      name: 'aptiv-platform',
      script: './build/index.js',
      cwd: __dirname,

      // Una sola instancia en modo fork: el bus Andon (SSE) y el cron viven en memoria del proceso.
      instances: 1,
      exec_mode: 'fork',

      autorestart: true,
      max_memory_restart: '1G',
      kill_timeout: 5000,

      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 80,
        ORIGIN: 'http://dlhs372n3.aptiv.com',

        // Conexión a MongoDB.
        MONGODB_URI: "mongodb://root:root1100@localhost:27017",
        MONGODB_DB: "APTIV_PLATFORM",

        // Obligatorio: los equipos de planta no pueden consultar el ERP (*.aptiv.com) sin este bypass TLS.
        NODE_TLS_REJECT_UNAUTHORIZED: '0',

        // Fuerza el scraping contra los servidores reales y etiqueta los logs como [PROD].
        FORCE_PROD: 'true'
      }
    }
  ]
};
