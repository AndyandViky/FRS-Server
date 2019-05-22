/**
 * 人脸模型 JOB
 * 定时更新人脸数据的第二张模型
 * 执行频率: 每天晚上12点
 * 每次处理: 全部已激活记录
 */
const schedule = require('node-schedule')
const { peoples, enums, cameraRecord } = require('../models')
const { faceSvc } = require('../service')

const { DataStatus } = enums

// async function test() {
schedule.scheduleJob('0 0 0 * * *', async () => {
    // 从最近的10次门禁记录中选取数值最大的更新
    const interval = 1000 * 60 * 20 // 内部循环为20分钟一次
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
    let cnt = 0
    const timer = setInterval(async () => {
        // 根据每个adress_id下的数据获取每个人的数据
        for (const peopleId of result[cnt].peopleIds) {
            const records = await cameraRecord.findAll({
                where: { people_id: peopleId, count: 1 },
                limit: 10,
                attributes: ['id', 'semblance'],
                order: [
                    ['id', 'DESC'],
                ],
            })
            if (records.length > 0) {
                // 获取最大值
                const maxRecord = records.reduce((num1, num2) => {
                    return num1.semblance > num2.semblance ? num1 : num2
                })
                if (maxRecord) {
                    // 调用接口更新模型 传入peopleId 和 maxRecord.id
                    await faceSvc.updateSecondModel({ id: peopleId, recordId: maxRecord.id })
                }
            }
        }
        cnt++
        if (cnt === result.length) clearInterval(timer)
    }, interval)
})
