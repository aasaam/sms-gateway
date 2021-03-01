const instances = 2;

module.exports = {
  apps: [
    {
      name: 'http',
      script: './app-http.js',
      instances,
      watch: ['src'],
      autorestart: true,
      watch_delay: 1000,
      max_memory_restart: '256M',
      ignore_watch: ['node_modules', 'coverage'],
    },
    {
      name: 'worker',
      script: './app-worker.js',
      instances,
      watch: ['src'],
      autorestart: true,
      watch_delay: 1000,
      max_memory_restart: '256M',
      ignore_watch: ['node_modules', 'coverage'],
    },
  ],
};
