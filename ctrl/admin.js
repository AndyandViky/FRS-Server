const { admin, users, enums, bug, notice, article } = require('../models')

const { DataStatus } = enums
module.exports = {
    /**
     * 通过业主认证
     */
    async approveResident(req, res) {
        const { userId } = req.body
        await users.update({
            where: { people_id: userId },
        }, {
            is_verify: DataStatus.Actived.value,
        })
        res.success()
    },

    /**
     * 处理故障信息
     */
    async operatedBug(req, res) {
        const { bugId, result } = req.body
        await bug.update({
            where: { id: bugId },
        }, {
            result,
            operated_id: req.auth.selfId,
        })
        const data = await bug.findById(bugId)
        await notice.create({
            people_id: data.people_id,
            title: '故障申报处理',
            content: `您申报的故障已处理完毕, 处理结果: ${result}`,
            send_id: 0,
        })
        res.success()
    },

    /**
     * 发布文章
     */
    async addArticle(req, res) {
        await article.create(req.body)
        res.success()
    },
}
