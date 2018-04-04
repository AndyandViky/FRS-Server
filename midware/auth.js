const { jwtSvc } = require('../service')
const config = require('../config')

module.exports = async (req, res, next) => {
    if (isNoAuthPath(req.path) || req.method === 'OPTIONS') {
        return next()
    }

    // verify
    const { authorization } = req.headers
    if (!authorization) {
        return next(new Error('调用失败, token不存在'))
    }
    const jwt = authorization.substr(7)

    let payload
    try {
        payload = await jwtSvc.verify(jwt)
    } catch (e) {
        return next(new Error(`调用失败${e}`))
    }
    if (!payload) {
        return next(new Error('token验证失败'))
    }

    req.auth = payload
    next()
}

/**
 * no auth files or paths
 * @param   {string} path    req url
 * @returns {boolean}
 */
function isNoAuthPath(path) {
    return config.NO_AUTH_PATHS.includes(path) || config.NO_AUTH_REG.test(path)
}
