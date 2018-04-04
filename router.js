const express = require('express')
const { validate } = require('./midware')
const {
    test,
} = require('./ctrl')

const router = express.Router()

/**
 * 测试接口
 */
// 传入selfId计算jwt
router.get('/test/jwt', test.getJwt)


/**
 * register ctrl and validate(if any) midware funcs to routes
 * @param {string} method    http method
 * @param {string} path      route path
 * @param {function} func      ctrl func
 */
function register(method, path, func) {
    const funcName = func.name
    const fields = validate[funcName]
    if (fields) {
        const validFunc = (req, res, next) => {
            validate.validateParams(req, next, fields)
        }
        return router[method](path, validFunc, co(func))
    }
    return router[method](path, co(func))
}

/**
 * wrap all ctrl funcs to handle errors
 */
function co(asyncFunc) {
    return async (req, res, next) => {
        try {
            await asyncFunc(req, res, next)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = router
