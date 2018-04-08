const config = {

    APP_NAME: 'face-api',

    // Security
    JWT_SECRET: '>it)Cimcjx,r>~I',
    JWT_TOKEN_TIMEOUT: 864000, // 10 days
    NO_AUTH_REG: /\.log$|\.ico$|^\/socket.io/,
    NO_AUTH_PATHS: [
        'login',
        'register',
        '/test/jwt',
    ],

    // logs location
    API_LOG_PATH: `${__dirname}/../log/`,
    TASK_LOG_PATH: `${__dirname}/../log/task/`,

    // Redis
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: 6379,
    REDIS_DB: 0,

    PORT: {
        HTTP: '8000',
    },

    // Paths
    QRCODE_FOLDER: './static/qrcode/',

    EMAIL: {
        SERVICE: '1026530721',
        USER: '1026530721@qq.com',
        PASSWORD: 'jbfhcjxncoidbfjj',
    },
}

module.exports = config
