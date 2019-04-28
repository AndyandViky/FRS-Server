const {
    peoples,
    users,
    enums,
    faceData,
    attachment,
    visitorRecord,
    cameraRecord,
    notice,
    config,
} = require('../models')
const { common } = require('../util')
const { faceSvc, emailSvc } = require('../service')

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
}
