const express = require('express')
const { validate } = require('./midware')
const {
    test,
    notice,
    user,
    attachment,
    admin,
    president,
    visiter,
    bug,
    article,
    question,
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
register('put', '/user/active', user.actived)
register('put', '/face/active', user.activeModel)
register('post', '/bug', bug.addBug)
register('get', '/camera/records', user.getCameraRecords)
register('put', '/avatar', user.uploadAvatar)
register('put', '/password', user.updatePwd)

/**
 * 业主
 */
register('put', '/verify', president.residentVerify)
register('get', '/visitors', user.getVisitors)
register('put', '/visitors', president.approveVisitor)
register('post', '/visitor', president.registerVisitor)
register('post', '/open/door', president.openDoor)

/**
 * 文章
 */
register('get', '/articles', article.getArticles)
register('get', '/article', article.getArticle)

/**
 * 访客
 */
// 申请访问
register('post', '/visite', visiter.applyVisite)

/**
 * 管理员相关
 */
// 通过业主申请
register('put', '/resident', admin.approveResident)
register('put', '/bug', bug.operatedBug)
register('post', '/article', article.addArticle)
register('put', '/article', article.changeArticle)
register('delete', '/article', article.deleteArticle)
register('get', '/bugs', bug.getBugs)
register('get', '/bug', bug.getBug)
register('delete', '/bug', bug.deleteBug)
register('get', '/residents', admin.getResidents)
register('post', '/open/camera', admin.openCamera)
register('post', '/close/camera', admin.closeCamera)
register('get', '/cameras', admin.getCameras)

/**
 * 问题回答相关
 */
// register('post', '/question', question.addQuestion)
// register('get', '/questions', question.getQuestions)
// register('get', '/question', question.getQuestion)
// register('delete', '/question', question.deleteQuestion)
// register('post', '/answer', question.addAnswer)

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
