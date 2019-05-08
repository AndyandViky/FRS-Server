/**
 * 文章推荐 JOB
 * 定时根据用户行为拉取推荐文章
 * 执行频率: 每5分钟
 * 每次处理: 全部的用户
 */
const schedule = require('node-schedule')
const { faceSvc } = require('../service')
const {
    userBehavior,
    recommond,
} = require('../models')

schedule.scheduleJob('* */5 * * * *', async () => {
    const interval = new Date() - 3 * 24 * 60 * 60 * 1000
    // 查找三天之内更新的行为
    const data = await userBehavior.findAll({
        where: {
            updated_at: {
                $between: [new Date(interval), new Date()],
            },
        },
        attributes: ['id', 'people_id', 'behavior'],
    })
    if (data) {
        data.map(async (item) => {
            item.behavior = JSON.parse(item.behavior)
            // 先更新一下behavior
            item.behavior = item.behavior.filter((rItem) => {
                return rItem.createTime > interval
            })
            // const recomnondIds = await faceSvc.getRecommondById({ behavior: item.behavior })
            const recomnondIds = [22379, 22378, 22377, 22376, 22375, 22374, 22373, 22372, 22371, 22370]
            // 获取到新的数据，更新数据
            const preRIds = await recommond.findOne({
                where: { people_id: item.people_id },
            })
            if (!preRIds) {
                // 第一次推荐
                await recommond.create({
                    people_id: item.people_id,
                    recommonds: JSON.stringify(recomnondIds),
                })
            } else {
                preRIds.recommonds = JSON.stringify(recomnondIds)
                preRIds.save()
            }
            // item使用结束后更新至数据库
            item.behavior = JSON.stringify(item.behavior)
            item.save()
        })
    }
})
