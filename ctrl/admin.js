const { users, enums, notice, peoples, cameraConfig } = require('../models')
const { faceSvc } = require('../service')

const { DataStatus, UserRank } = enums
module.exports = {
    /**
     * 通过业主认证
     */
    async approveResident(req, res) {
        const { userId } = req.body
        await users.update({
            is_verify: DataStatus.Actived.value,
        }, {
            where: { people_id: userId },
        })
        await notice.create({
            people_id: userId,
            title: '业主认证通知',
            content: '您申报的业主认证已处理完毕, 处理结果: 通过',
            send_id: 0,
        })
        res.success()
    },

    /**
     * 获取业主列表
     */
    async getResidents(req, res) {
        const { pageNo, pageSize } = req.query
        const query = { types: UserRank.Resident.value }
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await peoples.findAll({
            include: [users],
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
            order: [
                ['created_at', 'desc'],
            ],
        })
        data.total = await peoples.count({ where: query })
        res.success(data)
    },

    /**
     * 打开摄像头
     */
    async openCamera(req, res, next) {
        const result = await faceSvc.openCamera(req.body)
        if (result.code === -1) {
            return next(new Error(result.data))
        }
        res.success()
    },

    /**
     * 关闭摄像头
     */
    async closeCamera(req, res, next) {
        const result = await faceSvc.closeCamera(req.body)
        if (result.code === -1) {
            return next(new Error(result.data))
        }
        res.success()
    },

    /**
     * 获取摄像头相关信息
     */
    async getCameras(req, res, next) {
        const result = await faceSvc.getCamera()
        if (result.code === -1) {
            return next(new Error(result.data))
        }
        const data = JSON.parse(result.data)
        const camera = await cameraConfig.findAll()
        for (let i = 0; i < camera.length; i++) {
            for (let j = 0; j < data.length; j++) {
                if (parseInt(camera[i].camera_num) === data[j].name) {
                    camera[i].status = data[j].isOpen
                    camera[i].is_operated = data[j].isOperated
                }
            }
        }
        res.success(camera)
    },
}
