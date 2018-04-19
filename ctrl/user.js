const {
    peoples,
    users,
    visitor,
    enums,
    faceData,
    attachment,
    visitorRecord,
    cameraRecord,
    bug,
    notice,
    article,
    config,
} = require('../models')
const { common } = require('../util')
const multiparty = require('multiparty')
const sequelize = require('sequelize')
const { emailSvc, jwtSvc, userSvc, faceSvc } = require('../service')
const gm = require('gm')

const { DataStatus, FaceModel, UploadPath, UserRank, DoorStatus } = enums
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
                        self_password: common.encryptInfo('123456'),
                    }, { transaction: t })
                } throw new Error()
            })
        })
        res.success()
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
        })
        if (user) {
            const result = {}
            Object.assign(result, {
                age: user.age,
                avatar: user.avatar,
                email: user.email,
                gender: user.gender,
                house_number: user.house_number,
                id: user.id,
                is_active: user.is_active,
                phone: user.phone,
                types: user.types,
                name: user.name,
            })
            if (user.types === UserRank.Resident.value) {
                const resident = await users.findOne({
                    where: { people_id: user.id },
                    attributes: ['is_verify'],
                })
                Object.assign(result, { is_verify: resident.is_verify })
            }
            return res.success(result)
        } return next(new Error('用户不存在'))
    },

    /**
     * 获取用户人脸模型
     */
    async getUserFaceModel(req, res) {
        const data = await faceData.findAll({
            where: { people_id: req.auth.selfId, type: FaceModel.First.value },
            attributes: ['id', 'model_image'],
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
                        await config.update({
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
     * 获取访客记录
     * 传 0 代表获取全部
     */
    async getCameraRecords(req, res) {
        const { pageNo, pageSize, type, userId } = req.query
        const { selfId } = req.auth
        const query = {}
        if (type) {
            query.type = type
        }
        if (userId !== undefined && userSvc.checkAdmin(selfId)) {
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
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await cameraRecord.count({ where: query })
        res.success(data)
    },

    /**
     * 业主获取当前访客记录
     */
    async getVisitors(req, res) {
        const { pageNo, pageSize, status, userId } = req.query
        const { selfId } = req.auth
        const query = { belong: selfId }
        if (status) {
            query.status = status
        }
        if (userId && userSvc.checkAdmin(selfId)) query.belong = userId
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await visitorRecord.findAll({
            include: [peoples],
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await visitorRecord.count({ where: query })
        res.success(data)
    },

    /**
     * 业主通过访客访问
     */
    async approveVisitor(req, res) {
        const { visitorId } = req.body
        await visitorRecord.update({
            where: {
                id: visitorId,
            },
        }, {
            pass_time: Date.now(),
        })
        res.success()
    },

    /**
     * 业主手机开门
     */
    async openDoor(req, res, next) {
        const { selfPwd } = req.body
        // 判断密码  --- 暂不验证
        const result = await faceSvc.openDoor({ type: 0 })
        if (result.code === -1) {
            return next(new Error(result.data))
        }
        await cameraRecord.create({
            people_id: req.auth.selfId,
            face_img: '',
            type: DoorStatus.App.value,
        })
        res.success()
    },

    /**
     * 业主注册访客
     */
    async registerVisitor(req, res, next) {
        const { phone, facePath } = req.body
        const people = await peoples.findOne({
            where: { phone },
            attributes: ['id'],
        })
        req.body.status = DataStatus.Actived.value
        req.body.pass_time = Date.now()
        let userId
        if (people) {
            // 已注册
            userId = people.id
            req.body.visitor_id = people.id
            await visitorRecord.create(req.body)
        } else {
            // 未注册
            req.body.types = UserRank.Visitor.value
            req.body.email = phone
            req.body.is_active = DataStatus.Actived.value
            req.body.password = common.encryptInfo('123456')
            const rePeople = await peoples.create(req.body)
            req.body.visitor_id = rePeople.id
            userId = rePeople.id
            await Promise.all([
                visitorRecord.create(req.body),
                notice.create({
                    people_id: req.auth.selfId,
                    title: '访客注册通知',
                    content: `您当前申请的访客尚未注册, 我们已为您注册, 初始帐号为: ${phone} 初始密码为: 123456`,
                    send_id: 0,
                }),
            ])
        }
        let isActived = DataStatus.Actived.value
        const faceCount = await faceData.count({
            where: { people_id: userId, is_active: DataStatus.Actived.value },
        })
        if (faceCount > 0) isActived = DataStatus.NotActived.value
        const imageData = await attachment.findOne({
            where: { path: facePath },
            attributes: ['id'],
        })
        const apiRes = await faceSvc.addModel({
            id: userId,
            imageId: imageData.id,
            isActived,
        })
        if (apiRes.code === -1) {
            return next(new Error(apiRes.data))
        }
        await config.update({
            isUpdate: DataStatus.Actived.value,
        }, {
            where: { id: 1 },
        })
        res.success()
    },

    /**
     * 业主认证
     */
    async residentVerify(req, res, next) {
        const { selfId } = req.auth
        const people = await peoples.findOne({
            where: { id: selfId },
        })
        if (people.types !== UserRank.Resident.value) {
            return next(new Error('您不是业主'))
        }
        const { phone } = req.body
        await Promise.all([
            peoples.update(
                { phone },
                {
                    where: { id: selfId },
                },
            ),
            users.update(req.body, {
                where: { people_id: selfId },
            }),
        ])
        res.success()
    },

    /**
     * 提交故障
     */
    async addBug(req, res) {
        const { selfId } = req.auth
        req.body.people_id = selfId
        await bug.create(req.body)
        const user = await peoples.findById(selfId)
        const admins = await peoples.findAll({
            where: { adress_id: user.adress_id, types: UserRank.Admin.value },
            attributes: ['id'],
        })
        for (const admin of admins) {
            await notice.create({
                people_id: admin.id,
                title: '故障申报通知',
                content: `申报人为: ${user.name}, 申报时间为: ${new Date()}`,
                send_id: selfId,
            })
        }
        res.success()
    },

    /**
     * 获取文章列表
     */
    async getArticles(req, res) {
        const { pageNo, pageSize, status } = req.query
        const query = {}
        if (status) {
            query.status = status
        }
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await article.findAll({
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await visitorRecord.count({ where: query })
        res.success(data)
    },

    /**
     * 获取文章详情
     */
    async getArticle(req, res) {
        const { articleId } = req.query
        const data = await article.findById(articleId)
        res.success(data)
    },

    /**
     * 访客申请访问
     */
    async applyVisite(req, res, next) {
        const { selfId } = req.auth
        const people = peoples.findOne({
            where: { id: selfId },
        })
        if (people.type !== UserRank.Visitor.value) {
            return next(new Error('您不是访客'))
        }
        await visitorRecord.create(req.body)
        res.success()
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
