module.exports = {
  apps: [
    {
      name: 'demo',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: '3002',
      }
    },
  ],
}
