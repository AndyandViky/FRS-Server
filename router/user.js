const express = require('express')
const { validate } = require('../midware')
const {
    test,
    user,
    attachment,
    bug,
    question,
} = require('../ctrl')

const router = express.Router()

/**
 * 用户相关
 */
register('post', '/login', user.login)
register('post', '/register', user.register)
register('get', '/', user.getUserInfo)
register('get', '/face', user.getUserFaceModel)
register('post', '/face', user.addFaceModel)
register('put', '/active', user.actived)
register('put', '/face/active', user.activeModel)
register('post', '/bug', bug.addBug)
register('get', '/camera/records', user.getCameraRecords)
register('put', '/avatar', user.uploadAvatar)
register('put', '/password', user.updatePwd)

/**
 * 问答
 */
register('get', '/questions', question.getQuestions)
register('get', '/question', question.getQuestion)

/**
 * 附件上传
 */
// 图片上传
register('post', '/image', attachment.uploadImage)
register('post', '/file', attachment.uploadFile)

/**
 * 测试接口
 */
// 传入selfId计算jwt
router.get('/test/jwt', test.getJwt)
register('post', '/age/test', user.ageText)


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
