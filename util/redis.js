const config = require('../config')
const Redis  = require('ioredis')

const logger = require('../util').logger(config.API_LOG_PATH)

const client = new Redis({
    port: config.REDIS_PORT,
    host: config.REDIS_HOST,
    db: config.REDIS_DB,
    password: config.REDIS_PASSWORD,
})

client.on('error', (err) => {
    if (err) {
        logger.info('connect to redis error, check your redis config', err)
        process.exit(1)
    }
})

module.exports = client
