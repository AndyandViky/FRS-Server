const express = require('express')
const { validate } = require('./midware')
const {
    test,
    notice,
    user,
} = require('./ctrl')

const router = express.Router()

/**
 * 用户相关
 */
register('post', '/login', user.login)
register('post', '/register', user.register)
register('get', '/user', user.getUserInfo)
register('get', '/face', user.getUserFaceModel)
register('post', '/face', user.addFaceModel)
register('get', '/user/activate', user.actived)
register('put', '/face/active', user.activeModel)

/**
 * 通知相关
 */
// 获取通知列表
register('get', '/notices', notice.getNoticeList)
// 更新通知状态
register('put', '/notice', notice.updateStatus)
// 删除通知
register('delete', '/notice', notice.removeNotice)

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
