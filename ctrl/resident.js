const {
    peoples,
    users,
    enums,
    faceData,
    attachment,
    visitorRecord,
    cameraRecord,
    notice,
    systemConfig,
    userBehavior,
    recommond,
} = require('../models')
const { common } = require('../util')
const { faceSvc, emailSvc, userSvc } = require('../service')
const { compare } = require('../util').common

const { DataStatus, UserRank, DoorStatus, VisitorStatus, FaceModel } = enums

module.exports = {
    /**
     * 业主通过访客访问
     */
    async approveVisite(req, res) {
        const { visitorId } = req.body
        await visitorRecord.update({
            pass_time: Date.now(),
            status: VisitorStatus.Pass.value,
        }, {
            where: {
                visitor_id: visitorId,
            },
        })
        // 启用访客的人像图
        await faceData.update({
            is_active: DataStatus.Actived.value,
        }, {
            where: {
                people_id: visitorId,
                type: FaceModel.First.value,
            },
        })
        // 发送通知，此处由于输入的为手机号，所以会发生错误
        // const visitor = await peoples.findById(visitorId, {
        //     attributes: ['email'],
        // })
        // emailSvc.sendEmail(visitor.email, '访问通过通知', '尊敬的用户你好，您申请的访问已被通过！')
        res.success()
    },

    /**
     * 业主手机开门
     */
    async openDoor(req, res, next) {
        const { selfPwd } = req.body
        // 判断密码  --- 暂不验证
        if (selfPwd !== '-1') {
            const resident = await users.findOne({
                where: { people_id: req.auth.selfId },
                attributes: ['self_password'],
            })
            if (resident.self_password !== selfPwd) {
                return next(new Error('输入密码错误！'))
            }
        }
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
        req.body.belong = req.auth.selfId

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
            where: {
                people_id: userId,
                is_active: DataStatus.Actived.value,
                type: FaceModel.First.value,
            },
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
        await systemConfig.update({
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
     * App获取门禁记录
     * @param {*} req
     * @param {*} res
     */
    async getCameraRecordsById(req, res) {
        const { pageNo, pageSize } = req.query
        const { selfId } = req.auth
        const query = {
            people_id: selfId,
        }
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await cameraRecord.findAll({
            where: query,
            attributes: ['count', 'type', 'created_at'],
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await cameraRecord.count({ where: query })
        res.success(data)
    },

    /**
     * 给访客延期
     */
    async addVisiteTime(req, res) {
        const { recordId, deadline } = req.body
        await visitorRecord.update({
            deadline,
            pass_time: Date.now().toString(),
        }, {
            where: { id: recordId },
        })
        res.success()
    },

    /**
     * 根据id获取访客记录
     */
    async getVisitors(req, res) {
        const { pageNo, pageSize, status, userId } = req.query
        const { selfId, type } = req.auth
        const query = { belong: selfId }
        if (status !== undefined) {
            query.status = status
        }
        if (userId && userSvc.checkAdmin(type)) query.belong = userId
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
     * 增加用户行为
     */
    async addNewBehavior(req, res) {
        const { selfId } = req.auth
        const { type, categoryId, duration } = req.body
        const data = await userBehavior.findOne({
            where: { people_id: selfId },
            attributes: ['id', 'behavior'],
        })
        const newData = {
            categoryId,
            type,
            duration,
            createTime: Date.now(),
        }
        if (data) {
            // 以前存在记录，直接进行更新
            const jsonData = JSON.parse(data.behavior)
            console.log(jsonData)
            const isLive = jsonData.find((item) => {
                return parseInt(item.categoryId) === parseInt(categoryId)
            })
            if (isLive) {
                isLive.duration = parseInt(isLive.duration) + parseInt(duration)
                isLive.createTime = Date.now()
            } else jsonData.push(newData)
            data.behavior = JSON.stringify(jsonData)
            data.save()
        } else {
            // 没有记录，创建一个新的记录
            await userBehavior.create({
                people_id: selfId,
                behavior: JSON.stringify([newData]),
            })
        }
        res.success()
    },

    /**
     * 更新推荐
     */
    async updateRecommond(req, res, next) {
        const { selfId } = req.auth
        const preRIds = await recommond.findOne({
            where: { people_id: selfId },
        })
        if (preRIds) {
            if (new Date() - preRIds.updated_at < 3600 * 8 * 1000 + 60000) {
                return next(new Error('间隔太短，暂时不能推荐'))
            }
        }
        const interval = new Date() - 3 * 24 * 60 * 60 * 1000
        // 查找三天之内更新的行为
        const data = await userBehavior.findOne({
            where: {
                people_id: selfId,
                updated_at: {
                    $between: [new Date(interval), new Date()],
                },
            },
            attributes: ['id', 'people_id', 'behavior', 'updated_at'],
        })
        if (data) {
            data.behavior = JSON.parse(data.behavior)
            // 先更新一下behavior
            data.behavior = data.behavior.filter((rItem) => {
                return rItem.createTime > interval
            })
            const behavior = []
            const limit = 4
            if (data.behavior.length > limit) {
                data.behavior.sort(compare('createTime'))
                for (let i = 0; i < limit; i++) {
                    behavior.push(data.behavior[i])
                }
            } else {
                for (let i = 0; i < data.behavior.length; i++) {
                    behavior.push(data.behavior[i])
                }
            }
            const recommonds = await faceSvc.getRecommondById({ behavior })
            // const recomnondIds = [22379, 22378, 22377, 22376, 22375, 22374, 22373, 22372, 22371, 22370]
            // 获取到新的数据，更新数据
            const recomnondIds = recommonds.data
            if (recomnondIds) {
                if (!preRIds) {
                // 第一次推荐
                    await recommond.create({
                        people_id: data.people_id,
                        recommonds: JSON.stringify(recomnondIds),
                    })
                } else {
                    preRIds.recommonds = JSON.stringify(recomnondIds)
                    preRIds.save()
                }
            }
            // item使用结束后更新至数据库
            data.behavior = JSON.stringify(data.behavior)
            data.save()
        }
        res.success()
    },

    /**
     * 通过上传的图片增加人脸模型
     * @param {*} req
     * @param {*} res
     */
    async addNewFaceByPicture(req, res, next) {
        const { attId } = req.body
        const { selfId } = req.auth
        let isActived = DataStatus.Actived.value
        const count = await faceData.count({
            where: { people_id: selfId, is_active: DataStatus.Actived.value },
        })
        if (count > 0) isActived = DataStatus.NotActived.value
        // 调用api接口, 增加模型
        const apiRes = await faceSvc.addModel({
            id: selfId,
            imageId: attId,
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
        res.success()
    },
}
