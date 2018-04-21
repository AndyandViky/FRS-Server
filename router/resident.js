const express = require('express')
const { validate } = require('../midware')
const {
    notice,
    user,
    resident,
    article,
    question,
    bug,
} = require('../ctrl')

const router = express.Router()

/**
 * 业主
 */
register('put', '/verify', resident.residentVerify)
register('get', '/visitors', user.getVisitors)
register('put', '/visite', resident.approveVisite)
register('post', '/visitor', resident.registerVisitor)
register('post', '/open/door', resident.openDoor)

/**
 * 故障
 */
register('post', '/bug', bug.addBug)

/**
 * 文章
 */
register('get', '/articles', article.getArticles)
register('get', '/article', article.getArticle)

/**
 * 问答
 */
register('post', '/question', question.addQuestion)
register('delete', '/question', question.deleteQuestion)
register('post', '/answer', question.addAnswer)
register('put', '/like', question.addLike)

/**
 * 通知相关
 */
// 获取通知列表
register('get', '/notices', notice.getNoticeList)
// 更新通知状态
register('put', '/notice', notice.updateStatus)

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
