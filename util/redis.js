const config = require('../config')
const Redis  = require('ioredis')

const client = new Redis({
    port: config.REDIS_PORT,
    host: config.REDIS_HOST,
    db: config.REDIS_DB,
    password: config.REDIS_PASSWORD,
})

client.on('error', (err) => {
    if (err) {
        process.exit(1)
    }
})

module.exports = client
