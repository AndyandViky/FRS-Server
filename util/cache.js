const redis  = require('./redis')
const config = require('../config')
const logger = require('../util').logger(config.API_LOG_PATH)

const get = function (key, callback) {
    const t = new Date()
    redis.get(key, (err, data) => {
        if (err) {
            return callback(err)
        }
        if (!data) {
            return callback()
        }
        data = JSON.parse(data)
        const duration = (new Date() - t)

        if (config.DEBUG) {
            logger.info('Cache', 'get', key, (`${duration}ms`).green)
        }

        callback(null, data)
    })
}

exports.get = get

// time 参数可选，秒为单位
const set = function (key, value, time, callback) {
    const t = new Date()

    if (typeof time === 'function') {
        callback = time
        time = null
    }
    callback = callback || _.noop
    value = JSON.stringify(value)

    if (!time) {
        redis.set(key, value, callback)
    } else {
        redis.setex(key, time, value, callback)
    }
    const duration = (new Date() - t)

    if (config.DEBUG) {
        logger.info('Cache', 'set', key, (`${duration}ms`).green)
    }
}

exports.set = set
