const gm = require('gm')
const multiparty = require('multiparty')
const { sequelize } = require('../util')
const config = require('../config')

const {
    peoples,
    users,
    visitor,
    enums,
    faceData,
    attachment,
    visitorRecord,
    cameraRecord,
    systemConfig,
} = require('../models')
const { common, cache } = require('../util')
const { emailSvc, jwtSvc, userSvc, faceSvc } = require('../service')
const { isPhone, isEmail } = require('../util').customValidators

const { DataStatus, FaceModel, UploadPath, UserRank } = enums
/**
 * 用户相关
 */
module.exports = {
    /**
     * 用户登录
     */
    async login(req, res, next) {
        const { username, password, types } = req.body
        const pwd = common.encryptInfo(password)
        let user = {}
        const query = {
            is_active: DataStatus.Actived.value,
            password: pwd,
        }
        if (isPhone(username)) query.phone = username
        else if (isEmail(username)) query.email = username
        else return next(new Error('用户名格式不正确'))
        user = await peoples.findOne({
            where: query,
            attributes: ['id', 'name', 'gender', 'age', 'email', 'phone', 'avatar', 'types'],
        })
        if (user) {
            if (types !== undefined && user.types !== types) {
                return next(new Error('您没有权限访问'))
            }
            let isVerify = 1
            if (user.types === UserRank.Resident.value) {
                const resident = await users.findOne({
                    where: { people_id: user.id },
                    attributes: ['is_verify'],
                })
                isVerify = resident.is_verify
            }
            // 返回 token
            const token = await jwtSvc.sign({ selfId: user.id, type: user.types })
            return res.success({
                user,
                token,
                isVerify,
            })
        } return next(new Error('用户不存在'))
    },

    /**
     * 用户注册
     */
    async register(req, res, next) {
        const { password, confirmPassword, email, vCode } = req.body
        const people = await peoples.count({
            where: { email },
        })
        if (people > 0) {
            return next(new Error('该邮箱已被注册'))
        }
        cache.get(email, (async (err, code) => {
            if (code !== vCode) return next(new Error('验证码不正确'))
            if (password !== confirmPassword) return next(new Error('两次密码输入不一致'))
            req.body.password = common.encryptInfo(password)
            if (!req.body.adress_id) req.body.adress_id = 1
            req.body.is_active = DataStatus.Actived.value
            sequelize.transaction((t) => {
                // 在这里链接您的所有查询。 确保你返回他们。
                return peoples.create(req.body, { transaction: t }).then((user) => {
                    if (user.types === UserRank.Visitor.value) {
                        return visitor.create({
                            people_id: user.id,
                        }, { transaction: t })
                    } if (user.types === UserRank.Resident.value) {
                        return users.create({
                            people_id: user.id,
                            self_password: '123456',
                        }, { transaction: t })
                    }
                })
            }).then((result) => {
                res.success()
                // Transaction 会自动提交
                // result 是事务回调中使用promise链中执行结果
            }).catch((err) => {
                return next(new Error('注册失败'))
                // Transaction 会自动回滚
                // err 是事务回调中使用promise链中的异常结果
            })
        }))
    },

    /**
     * 发送邮件验证码
     */
    async sendEmail(req, res) {
        const { email } = req.body
        const random = common.randomString(6)
        emailSvc.sendEmail(email, '通知', `邮箱验证码为: ${random}`)
        cache.set(email, random, 600)
        res.success()
    },

    /**
     * 忘记密码
     */
    async reChangePassword(req, res, next) {
        const { password, email, vCode } = req.body
        const people = await peoples.findOne({
            where: { email },
            attributes: ['id'],
        })
        if (!people) {
            return next(new Error('该邮箱未注册'))
        }
        cache.get(email, (async (err, code) => {
            if (code !== vCode) return next(new Error('验证码不正确'))
            await peoples.update({
                password: common.encryptInfo(password),
            }, {
                where: { id: people.id },
            })
            res.success()
        }))
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
    async getUserInfo(req, res, next) {
        const user = await peoples.findOne({
            where: { id: req.auth.selfId, is_active: DataStatus.Actived.value },
            attributes: ['id', 'name', 'gender', 'age', 'email', 'phone', 'avatar', 'types'],
        })
        if (user) {
            let isVerify = 1
            if (user.types === UserRank.Resident.value) {
                const resident = await users.findOne({
                    where: { people_id: user.id },
                    attributes: ['is_verify'],
                })
                isVerify = resident.is_verify
            }
            return res.success({ user, isVerify })
        } return next(new Error('用户不存在'))
    },

    /**
     * 修改用户信息
     */
    async changeUserInfo(req, res) {
        const { userId } = req.body
        const query = {}
        if (userId && userSvc.checkAdmin(req.auth.type)) {
            query.id = userId
        } else {
            query.id = req.auth.selfId
        }
        await peoples.update(req.body, {
            where: query,
        })
        res.success()
    },

    /**
     * 更新用户头像
     */
    async uploadAvatar(req, res) {
        const { peopleId } = req.query
        let userId = req.auth.selfId
        if (peopleId) userId = peopleId
        const form = new multiparty.Form()
        form.uploadDir = UploadPath.Attachment.value
        form.parse(req, async (err, fields, files) => {
            const paths = files.file[0].path
            config.DATACATCHCOUNT += files.file[0].size
            await peoples.update({
                avatar: paths,
            }, {
                where: { id: userId },
            })
            res.success(paths)
        })
    },

    /**
     * 修改密码
     */
    async updatePwd(req, res, next) {
        const { oldPwd, newPwd, confirmPwd } = req.body
        if (newPwd !== confirmPwd) return next(new Error('两次输入密码不一致'))
        const people = await peoples.findById(req.auth.selfId, {
            attributes: ['id', 'password'],
        })
        if (people.password !== common.encryptInfo(oldPwd)) {
            return next(new Error('输入旧密码错误'))
        }
        await people.update({ password: common.encryptInfo(newPwd) })
        res.success()
    },

    /**
     * 获取用户人脸模型
     */
    async getUserFaceModel(req, res) {
        const { userId, isActive } = req.query
        console.log(isActive)
        let id
        if (userId && userSvc.checkAdmin(req.auth.type)) {
            id = userId
        } else id = req.auth.selfId
        const query = {
            people_id: id,
            type: FaceModel.First.value,
        }
        if (isActive !== undefined) {
            query.is_active = isActive
        }
        const data = await faceData.findAll({
            where: query,
            attributes: ['id', 'model_image', 'is_active', 'people_id'],
        })
        res.success(data)
    },

    /**
     * 增加人脸模型
     */
    async addFaceModel(req, res, next) {
        const { selfId } = req.auth
        const form = new multiparty.Form()
        form.uploadDir = UploadPath.Face.value
        form.parse(req, (err, fields, files) => {
            if (!files) return next(new Error('请上传图片'))
            const paths = files.file[0].path
            config.DATACATCHCOUNT += files.file[0].size
            const imageMagick = gm.subClass({ imageMagick: true })
            imageMagick(paths).size(async (err1, value) => {
                if (err1) return next(new Error('获取失败, 请重新上传'))
                let Rwidth
                let Rheight
                let rate
                if (value.width > value.height) {
                    rate = 640 / value.width
                    Rwidth = 640
                    Rheight = Math.floor(value.height * rate)
                } else {
                    rate = 640 / value.height
                    Rheight = 640
                    Rwidth = Math.floor(value.width * rate)
                }
                imageMagick(paths)
                    .resize(Rwidth, Rheight, '!')
                    .autoOrient()
                    .write(paths, async (err2) => {
                        const atta = await attachment.create({
                            people_id: selfId,
                            path: paths,
                            width: Rwidth,
                            height: Rheight,
                        })
                        let isActived = DataStatus.Actived.value
                        const count = await faceData.count({
                            where: { people_id: selfId, is_active: DataStatus.Actived.value },
                        })
                        if (count > 0) isActived = DataStatus.NotActived.value
                        // 调用api接口, 增加模型
                        const apiRes = await faceSvc.addModel({
                            id: selfId,
                            imageId: atta.id,
                            isActived,
                        })
                        if (apiRes.code === -1) {
                            return next(new Error(apiRes.data))
                        }
                        await systemConfig.update({
                            isUpdate: DataStatus.Actived.value,
                        }, {
                            where: { id: 1 },
                        })
                        res.success({ id: atta.id, path: atta.path })
                    })
            })
        })
    },

    /**
     * 激活人脸模型
     */
    async activeModel(req, res, next) {
        const { modelId, userId } = req.body
        const { selfId } = req.auth
        let id
        if (userId && userSvc.checkAdmin(req.auth.type)) {
            id = userId
        } else id = selfId
        // 验证激活图片的是否为访客
        const user = await peoples.findById(selfId, {
            attributes: ['types'],
        })
        if (user.types === UserRank.Visitor.value) {
            // 查看访客记录
            const visiteCount = visitorRecord.count({
                where: { visitor_id: selfId, status: DataStatus.Actived.value },
            })
            if (visiteCount === 0) {
                return next(new Error('您的访问申请尚未通过！'))
            }
        }

        if (modelId !== 0) {
            const data = await faceData.findOne({
                where: {
                    people_id: id,
                    is_active: DataStatus.Actived.value,
                    type: FaceModel.First.value,
                },
            })
            if (data) {
                if (data.id === parseInt(modelId)) {
                    return next(new Error('该人像已经被激活，请勿重复激活！'))
                }
                await data.update({
                    is_active: DataStatus.NotActived.value,
                })
            }
            await faceData.update({
                is_active: DataStatus.Actived.value,
            }, {
                where: { id: modelId },
            })
        } else {
            await faceData.update({
                is_active: DataStatus.NotActived.value,
            }, {
                where: { people_id: id, type: FaceModel.First.value },
            })
        }
        // 更新配置
        await systemConfig.update({
            isUpdate: DataStatus.Actived.value,
        }, {
            where: { id: 1 },
        })
        res.success()
    },

    /**
     * 删除人脸模型
     */
    async deleteFaceModel(req, res) {
        const { modelId } = req.body
        await faceData.destroy({
            where: { id: modelId },
        })
        res.success()
    },

    /**
     * 获取门禁记录
     * 传 0 代表获取全部
     */
    async getCameraRecords(req, res) {
        const { pageNo, pageSize, type, userId } = req.query
        const { selfId } = req.auth
        const query = {}
        if (type !== undefined) {
            query.type = type
        }
        if (userId !== undefined && userSvc.checkAdmin(req.auth.type)) {
            if (userId !== 0) {
                query.people_id = userId
            } else query.people_id = { $gt: userId }
        } else query.people_id = selfId
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await cameraRecord.findAll({
            include: [peoples],
            where: query,
            order: [
                ['id', 'desc'], // 根据id倒序
            ],
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await cameraRecord.count({ where: query })
        res.success(data)
    },

    /**
     * 跨年领测试
     */
    async ageText(req, res, next) {
        const { selfId } = req.auth
        const form = new multiparty.Form()
        form.uploadDir = UploadPath.Attachment.value
        form.parse(req, async (err, fields, files) => {
            const paths = files.file[0].path
            config.DATACATCHCOUNT += files.file[0].size
            const imageMagick = gm.subClass({ imageMagick: true })
            imageMagick(paths).size(async (err, value) => {
                if (err) return next(new Error('获取失败, 请重新上传'))
                let Rwidth
                let Rheight
                let rate
                if (value.width > value.height) {
                    rate = 640 / value.width
                    Rwidth = 640
                    Rheight = Math.floor(value.height * rate)
                } else {
                    rate = 640 / value.height
                    Rheight = 640
                    Rwidth = Math.floor(value.width * rate)
                }
                imageMagick(paths)
                    .resize(Rwidth, Rheight, '!')
                    .autoOrient()
                    .write(paths, async (err) => {
                        const attr = await attachment.create({
                            people_id: selfId,
                            path: paths,
                            width: Rwidth,
                            height: Rheight,
                        })
                        // 调用api接口, 增加模型
                        const apiRes = await faceSvc.ageText({
                            id: selfId,
                            attachId: attr.id,
                        })
                        if (apiRes.code === -1) {
                            return next(new Error(apiRes.data))
                        }
                        res.success({ score: apiRes.data })
                    })
            })
        })
    },
}
