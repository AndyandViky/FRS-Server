/**
 * https://www.cnblogs.com/zhongweiv/p/node_schedule.html
 * 全局信息 JOB
 * 定时扫描config文件中的流量记录等全局信息
 * 执行频率: 每天晚上12点
 * 6个占位符从左到右分别代表：秒、分、时、日、月、周几
 */
const schedule = require('node-schedule')
const { systemFlow } = require('../models')
const config = require('../config')

schedule.scheduleJob('0 0 0 * * *', async () => {
    await systemFlow.create({
        server_count: config.SERVERCOUNT,
        data_upload_flow: `${config.DATACATCHCOUNT}`,
        browser_flow: `${config.BROWSERCOUNT}`,
    })
})
