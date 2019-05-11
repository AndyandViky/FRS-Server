const { users, admin, adress, enums, notice, peoples, cameraConfig, property, visitor, cameraRecord } = require('../models')
const { faceSvc } = require('../service')
const config = require('../config')

const { DataStatus, UserRank, DoorStatus } = enums
module.exports = {
    /**
     * 获取首页数据
     */
    async getIndexData(req, res) {
        const now = new Date()
        const today = new Date(new Date().setHours(0, 0, 0, 0))
        const week = new Date(new Date(now - ((now.getDay() - 1) * 86400000)).setHours(0, 0, 0, 0))
        const month = new Date(now.getFullYear(), now.getMonth(), 1)

        const peopleCount = await peoples.count({
            where: { created_at: { $between: [today, now] } },
        })
        const appRecordToday = await cameraRecord.count({
            where: { created_at: { $between: [today, now] }, type: DoorStatus.App.value, people_id: { $gt: 0 } },
        })
        const cameraRecordToday = await cameraRecord.count({
            where: { created_at: { $between: [today, now] }, type: DoorStatus.Camera.value, people_id: { $gt: 0 }  },
        })
        const appRecordWeek = await cameraRecord.count({
            where: { created_at: { $between: [week, now] }, type: DoorStatus.App.value, people_id: { $gt: 0 }  },
        })
        const cameraRecordWeek = await cameraRecord.count({
            where: { created_at: { $between: [week, now] }, type: DoorStatus.Camera.value, people_id: { $gt: 0 }  },
        })
        const appRecordMonth = await cameraRecord.count({
            where: { created_at: { $between: [month, now] }, type: DoorStatus.App.value, people_id: { $gt: 0 }  },
        })
        const cameraRecordMonth = await cameraRecord.count({
            where: { created_at: { $between: [month, now] }, type: DoorStatus.Camera.value, people_id: { $gt: 0 }  },
        })
        const cameraLastWeeks = []
        const appLastWeeks = []
        // 获取上周每天的数据
        for (let i = 0; i < 30; i++) {
            const date1 = new Date((week.getTime() + (i * 24 * 60 * 60 * 1000)))
            const date2 = new Date((week.getTime() + ((i + 1) * 24 * 60 * 60 * 1000)))
            const cameraLastWeek = await cameraRecord.count({
                where: { created_at: { $between: [date1, date2] }, type: DoorStatus.Camera.value, people_id: { $gt: 0 }  },
            })
            const appLastWeek = await cameraRecord.count({
                where: { created_at: { $between: [date1, date2] }, type: DoorStatus.App.value, people_id: { $gt: 0 }  },
            })
            cameraLastWeeks.push(cameraLastWeek)
            appLastWeeks.push(appLastWeek)
        }
        const data = {
            server: config.SERVERCOUNT,
            dataCatch: config.DATACATCHCOUNT,
            browser: config.BROWSERCOUNT,
            peopleCount,
            appRecordToday,
            cameraRecordToday,
            appRecordWeek,
            cameraRecordWeek,
            appRecordMonth,
            cameraRecordMonth,
            cameraLastWeeks,
            appLastWeeks,
        }
        res.success(data)
    },

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
    async getUsers(req, res) {
        const { pageNo, pageSize, types, search } = req.query
        const query = { types }
        if (search !== undefined && search !== '{}') {
            console.log(search)
            const searchData = JSON.parse(search)
            if (searchData.searchName !== '') {
                query.name = { $like: `%${searchData.searchName}%` }
            }
            if (searchData.dateFilter[0] !== '' && searchData.dateFilter[1] !== '') {
                query.created_at = { $between: searchData.dateFilter }
            }
        }
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        const attribute = ['age', 'avatar', 'email', 'gender', 'house_number', 'id', 'is_active', 'name', 'phone', 'types']
        if (types === UserRank.Admin.value) {
            data.datas = await peoples.findAll({
                include: [admin, adress],
                where: query,
                offset: (pageNo - 1) * pageSize,
                limit: pageSize,
                order: [
                    ['id', 'desc'],
                ],
                attributes: attribute,
            })
        } else if (types === UserRank.Resident.value) {
            data.datas = await peoples.findAll({
                include: [users, adress],
                where: query,
                offset: (pageNo - 1) * pageSize,
                limit: pageSize,
                order: [
                    ['id', 'desc'],
                ],
                attributes: attribute,
            })
        } else {
            data.datas = await peoples.findAll({
                include: [adress],
                where: query,
                offset: (pageNo - 1) * pageSize,
                limit: pageSize,
                order: [
                    ['id', 'desc'],
                ],
                attributes: attribute,
            })
        }
        data.total = await peoples.count({ where: query })
        res.success(data)
    },

    /**
     * 删除用户
     */
    async deleteUser(req, res) {
        const { type, userId } = req.body
        if (type === UserRank.Resident.value) {
            await users.destroy({
                where: { people_id: userId },
            })
        } else if (type === UserRank.Visitor.value) {
            await visitor.destroy({
                where: { people_id: userId },
            })
        } else if (type === UserRank.Property.value) {
            await property.destroy({
                where: { people_id: userId },
            })
        }
        await peoples.destroy({
            where: { id: userId },
        })
        res.success()
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
