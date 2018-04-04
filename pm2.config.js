const config = require('./config')
const cpuCount = require('os').cpus().length

console.log(`cpu count is: ${cpuCount}`)
const MAX_INS = cpuCount > 4 ? 4 : cpuCount

const isPrimary = process.env.IS_PRIMARY_ENDPOINT
console.log(`is primary endpoint: ${isPrimary || false}`)

const apps = [
    {
        name: config.APP_NAME,
        script: './app.js',
        instances: process.argv[5] ? 1 : MAX_INS,
        exec_mode: 'cluster',
        out_file: `./log/pm2/${config.APP_NAME}.log`,
        error_file: `./log/pm2/${config.APP_NAME}.log`,
        log_date_format: 'YYYY-MM-DD HH:mm:ss ',
        merge_logs: true,
        env: {
            NODE_ENV: 'prod',
        },
    },
]

// run tasks only on primary endpoint
if (isPrimary) {
    apps.push({
        name: 'referrer-task',
        script: './task/referrer-task.js',
        instances: 1,
        exec_mode: 'cluster',
        out_file: './log/pm2/referrer-task.log',
        error_file: './log/pm2/referrer-task.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss ',
        merge_logs: true,
        env: {
            NODE_ENV: 'prod',
        },
    }, {
        name: 'royalty-task',
        script: './task/royalty-task.js',
        instances: 1,
        exec_mode: 'cluster',
        out_file: './log/pm2/royalty-task.log',
        error_file: './log/pm2/royalty-task.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss ',
        merge_logs: true,
        env: {
            NODE_ENV: 'prod',
        },
    })
}

module.exports = { apps }
