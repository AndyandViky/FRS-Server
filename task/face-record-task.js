/**
 * 门禁记录 JOB
 * 定时扫描门禁记录
 * 执行频率: 每10分钟
 * 每次处理: 这10分钟内的数据
 */

const schedule = require('node-schedule')
const { cameraRecord, notice, peoples, enums } = require('../models')

const { DataStatus, UserRank } = enums

schedule.scheduleJob('* * */10 * * *', async () => {
    const interval = 1000 * 60 * 10 // 内部循环为十分钟一次
    const limit = new Date(Date.now() - (3600 * 1000 * 2)) // 2小时之内的数据
    const now = new Date() // 开始外部定时器的时间
    const datas = await peoples.findAll({
        where: { is_active: DataStatus.Actived.value },
        attributes: ['id', 'adress_id'],
    })

    // 整合数据
    const result = []
    datas.map(people => {
        const item = result.find(element => {
            return element.adress_id === people.adress_id
        })
        if (!item) result.push({ adress_id: people.adress_id, peopleIds: [people.id] })
        else item.peopleIds.push(people.id)
    })
    // 内部定时器
    let count = 0
    const timer = setInterval(async () => {
        const records = await cameraRecord.findAll({
            where: { people_id: { $in: result[count].peopleIds }, created_at: { $between: [limit, now] } },
            attributes: ['type'],
        })
        if (records.length > 0) {
            let cameraType = 0
            records.map((item) => {
                if (item.type === 0)cameraType++
            })
            const rate = (cameraType / records.length).toFixed(2)
            if (rate < 0.65) {
                const adminIds = await peoples.findAll({
                    where: { adress_id: result[count].adress_id, types: { $eq: UserRank.Admin.value } },
                    attributes: ['id'],
                })
                for (const item of adminIds) {
                    notice.create({
                        people_id: item.id,
                        title: '系统识别警告',
                        content: '尊敬的管理员您好, 系动检测到当前进出门识别率过低, 请关注...',
                        send_id: 0,
                    })
                }
            }
        }
        count++
        if (count === result.length) clearInterval(timer)
    }, interval)
})
