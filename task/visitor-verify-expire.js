/**
 * 验证访客是否过期 JOB
 * 定时扫描所有访客
 * 执行频率: 每10分钟
 * 每次处理: 全部已激活记录
 */
const schedule = require('node-schedule')
const { visitorRecord, enums, faceData } = require('../models')

const { DataStatus, VisitorStatus } = enums

// async function test() {
schedule.scheduleJob('* * */10 * * *', async () => {
    await init()
})
async function init() {
    const recordsData = await visitorRecord.findAll({
        where: {
            status: DataStatus.Actived.value,
        },
        attributes: ['id', 'visitor_id', 'deadline', 'pass_time'],
    })
    const records = []
    if (recordsData) {
        // 整合数据
        recordsData.map((item) => {
            item.child = []
            const isLive = records.find((item1) => {
                return item.visitor_id === item1.visitor_id
            })
            if (isLive) {
                isLive.child.push(item)
            } else {
                records.push(item)
            }
        })
        // 判断是否过期
        const expireRecord = []
        records.map(async (item2) => {
            let isExpire = true
            if (item2.child.length > 0) {
                item2.child.map((item3) => {
                    if (judgeExpire(item3.deadline, item3.pass_time)) {
                        expireRecord.push(item3.id)
                    } else {
                        isExpire = false
                    }
                })
            }
            if (isExpire) {
                // 如果child中的全部过期，则查看最外层
                isExpire = judgeExpire(item2.deadline, item2.pass_time)
                if (isExpire) {
                    // 如果返回true，说明全部过期了
                    expireRecord.push(item2.id)
                    // 将所有的faceData置为 false
                    console.log('全部过期')
                    console.log(expireRecord)
                    await faceData.update({
                        is_active: DataStatus.NotActived.value,
                    }, {
                        where: {
                            people_id: item2.visitor_id,
                        },
                    })
                }
            }
        })
        if (expireRecord.length > 0) {
            // 发现过期的访客记录
            await visitorRecord.update({
                status: VisitorStatus.Invalid.value,
            }, {
                where: {
                    id: { $in: expireRecord },
                },
            })
        }
    }
}
function judgeExpire(deadline, passTime) {
    const second = 3600 * 24 * parseInt(deadline) * 1000
    if (parseInt(passTime) + second < Date.now()) {
        return true
    }
    return false
}
