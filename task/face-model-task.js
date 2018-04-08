/**
 * 人脸模型 JOB
 * 定时扫描人脸模型当中已激活的数据, 根据数据作出相关操作
 * 执行频率: 每5分钟
 * 每次处理: 全部已激活记录
 */
const schedule = require('node-schedule')
const { faceData, notice, enums } = require('../models')

const { DataStatus } = enums

// async function test() {
schedule.scheduleJob('* */5 * * * *', async () => {
    const faces = await faceData.findAll({
        where: { is_active: DataStatus.Actived.value },
        order: [
            ['people_id', 'DESC'],
        ],
        attributes: ['people_id', 'semblance', 'pass_count'],
    })

    // 整合数据
    const result = []
    faces.map(face => {
        if (face.semblance > 0) {
            const item = result.find(element => {
                return element.people_id === face.people_id
            })
            const data = {
                semblance: face.semblance,
                pass_count: face.pass_count,
            }
            if (!item) result.push({ people_id: face.people_id, faces: [data] })
            else item.faces.push(data)
        }
    })

    // 计算数据
    for (const item of result) {
        const average = item.faces.reduce((sum, face) => {
            return sum + face.semblance
        }, 0) / item.faces.length
        // 判断平均值
        if (average < 0.65) {
            notice.create({
                people_id: item.people_id,
                title: '更换人脸数据提醒',
                content: '您好. 系统检测到当前您存储的人脸数据模型相似度有所下降, 请尽快替换相似度较低的数据...',
                send_id: 0,
            })
        }
    }
})
