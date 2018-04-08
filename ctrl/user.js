const { peoples, users, visitor, enums, faceData, attachment, visitorRecord } = require('../models')
const { common } = require('../util')
const multiparty = require('multiparty')
const sequelize = require('sequelize')
const { emailSvc, jwtSvc, userSvc, faceSvc } = require('../service')
const gm = require('gm')

const { DataStatus, FaceModel, UploadPath, UserRank } = enums
/**
 * 用户相关
 */
module.exports = {
    /**
     * 用户登录
     */
    async login(req, res, next) {
        const { email, password, phone } = req.body
        if (!email && !phone) return next(new Error('邮箱或手机号不能为空'))
        const pwd = common.encryptInfo(password)
        let user = {}
        if (email) {
            user = await peoples.findOne({
                where: { email, is_active: DataStatus.Actived.value, password: pwd },
            })
        } else {
            user = await peoples.findOne({
                where: { phone, is_active: DataStatus.Actived.value, password: pwd },
            })
        }
        if (user) {
            // 返回 token
            const jwt = await jwtSvc.sign({ selfId: user.id })
            return res.success({ data: jwt })
        } return next(new Error('用户不存在'))
    },

    /**
     * 用户注册
     */
    async register(req, res, next) {
        const { password, confirmPwd, email } = req.body
        if (password !== confirmPwd) return next(new Error('两次密码输入不一致'))
        req.body.password = common.encryptInfo(password)
        await sequelize.transaction((t) => {
            // 在这里链接您的所有查询。 确保你返回他们。
            return peoples.create(req.body, { transaction: t }).then((user) => {
                emailSvc.sendEmail(email, '注册成功提醒', `<p>注册成功</p><br/><p>点击以下链接进行激活</p><br/><a href="http://localhost8000/user/activate/"${req.headers.authorization}>http://localhost8000/user/activate/${req.headers.authorization}</a>`)
                if (user.type === UserRank.Visitor.value) {
                    return visitor.create({
                        people_id: user.id,
                    }, { transaction: t })
                } else if (user.type === UserRank.Resident.value) {
                    return users.create({
                        people_id: user.id,
                    }, { transaction: t })
                } throw new Error()
            })
        })
    },

    /**
     * 激活用户
     */
    async actived(req, res, next) {
        const { authorization } = req.query
        const jwt = authorization.substr(7)
        const result = await jwtSvc.verify(jwt)
        if (!result) {
            return next(new Error('当前链接已失效'))
        }
        peoples.update({
            is_active: DataStatus.Actived.value,
        }, {
            where: { id: req.auth.selfId },
        })
        res.success()
    },

    /**
     * 获取用户信息
     */
    async getUserInfo(req, res) {
        const user = peoples.findOne({
            where: { id: req.auth.selfId },
        })
        res.success(user)
    },

    /**
     * 获取用户人脸模型
     */
    async getUserFaceModel(req, res) {
        const data = faceData.findAll({
            where: { people_id: req.auth.selfId, type: FaceModel.First.value },
        })
        res.success(data)
    },

    /**
     * 增加人脸模型
     */
    async addFaceModel(req, res) {
        const { selfId } = req.auth
        const form = new multiparty.Form()
        form.uploadDir = UploadPath.Face.value
        form.parse(req, (err, fields, files) => {
            // 获取提交的数据以及图片上传成功返回的图片信息
            const imageMagick = gm.subClass({ imageMagick: true })
            const paths = files.file[0].path
            imageMagick(paths).resize(640, 480, '!').autoOrient().write(paths, async (err, result) => {
                const atta = await attachment.create({
                    people_id: selfId,
                    paths,
                })
                // 调用api接口, 增加模型
                faceSvc.addModel({
                    id: selfId,
                    imageId: atta.id,
                    isActive: DataStatus.NotActived.value,
                })
                res.success()
            })
        })
    },

    /**
     * 激活人脸模型
     */
    async activeModel(req, res) {
        const data = await faceData.findOne({
            where: { people_id: req.auth.selfId, is_active: DataStatus.Actived.value },
        })
        if (data) {
            data.update({
                is_active: DataStatus.NotActived.value,
            })
        }
        await faceData.update({
            is_active: DataStatus.Actived.value,
        }, {
            where: { id: req.body.modeId },
        })
        res.success()
    },

    /**
     * 业主获取当前访客记录
     */
    async getVisitors(req, res) {
        const { pageNo, pageSize, status, userId } = req.query
        const { selfId } = req.auth
        const query = { people_id: selfId }
        if (status) {
            query.status = status
        }
        if (userId && userSvc.checkAdmin(selfId)) query.people_id = userId
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await visitorRecord.findAll({
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await visitorRecord.count({ where: query })
        res.success(data)
    },
}
