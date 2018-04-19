const express = require('express')
const { validate } = require('./midware')
const {
    test,
    notice,
    user,
    attachment,
    admin,
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
register('post', '/bug', user.addBug)
register('get', '/camera/records', user.getCameraRecords)
/**
 * 业主
 */
register('put', '/verify', user.residentVerify)
register('get', '/visitors', user.getVisitors)
register('put', '/visitors', user.approveVisitor)
register('get', '/articles', user.getArticles)
register('get', '/article', user.getArticle)
register('post', '/visitor', user.registerVisitor)
register('post', '/open/door', user.openDoor)

/**
 * 访客
 */
// 申请访问
register('post', '/visite', user.applyVisite)

/**
 * 管理员相关
 */
// 通过业主申请
register('put', '/resident', admin.approveResident)
register('put', '/bug', admin.operatedBug)
register('post', '/article', admin.addArticle)
register('get', '/bugs', admin.getBugs)
register('get', '/bug', admin.getBug)
register('get', '/residents', admin.getResidents)
register('post', '/open/camera', admin.openCamera)
register('post', '/close/camera', admin.closeCamera)
register('get', '/cameras', admin.getCameras)

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
