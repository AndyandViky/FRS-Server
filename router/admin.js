const express = require('express')
const { validate } = require('../midware')
const {
    notice,
    admin,
    bug,
    article,
    question,
    user,
    resident,
} = require('../ctrl')

const router = express.Router()

/**
 * 首页数据获取
 */
register('get', '/', admin.getIndexData)

/**
 * login
 */
register('post', '/login', user.login)

/**
 * 管理员相关
 */
// 通过业主申请
register('put', '/resident', admin.approveResident)
register('get', '/users', admin.getUsers)
register('get', '/user', user.getUserInfo)
register('put', '/user', user.changeUserInfo)
register('delete', '/user', admin.deleteUser)
register('put', '/password', user.updatePwd)
register('get', '/face', user.getUserFaceModel)
register('put', '/face/active', user.activeModel)
register('get', '/visitors', resident.getVisitors)
register('put', '/visite/time', resident.addVisiteTime)

/**
 * 摄像头
 */
register('post', '/open/camera', admin.openCamera)
register('post', '/close/camera', admin.closeCamera)
register('get', '/cameras', admin.getCameras)
register('get', '/camera/records', user.getCameraRecords)

/**
 * 故障
 */
register('put', '/bug', bug.operatedBug)
register('get', '/bugs', bug.getBugs)
register('get', '/bug', bug.getBug)
register('delete', '/bug', bug.deleteBug)

/**
 * 文章
 */
register('post', '/article', article.addArticle)
register('put', '/article', article.changeArticle)
register('delete', '/article', article.deleteArticle)
register('get', '/articles', article.getArticles)
register('get', '/article', article.getArticle)

/**
 * 问答
 */
register('post', '/question', question.addQuestion)
register('delete', '/question', question.deleteQuestion)
register('post', '/answer', question.addAnswer)
register('get', '/questions', question.getQuestions)
register('get', '/question', question.getQuestion)
register('put', '/question', question.changeQuestionInfo)
register('put', '/answer', question.changeAnswer)
register('delete', '/answer', question.deleteAnswer)

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
