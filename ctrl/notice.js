const { notice, enums } = require('../models')
const { userSvc } = require('../service')

const { ReadStatus } = enums
/**
 * 通知相关
 */
module.exports = {

    /**
     * 获取消息列表
     */
    async getNoticeList(req, res) {
        const { pageNo, pageSize, status, userId } = req.query
        const { selfId, type } = req.auth
        const query = { people_id: selfId }
        if (status) {
            query.status = status
        }
        if (userId && userSvc.checkAdmin(type)) query.people_id = userId
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await notice.findAll({
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
            attributs: ['id', 'people_id', 'title', 'content', 'status', 'send_id', 'created_at'],
        })
        data.total = await notice.count({ where: query })
        res.success(data)
    },

    /**
     * 更新通知状态
     */
    async updateStatus(req, res) {
        await notice.update({
            status: ReadStatus.Readed.value,
        }, {
            where: { id: req.body.noticeId },
        })
        res.success()
    },

    /**
     * 删除通知
     */
    async removeNotice(req, res) {
        await notice.destroy({
            where: { id: req.body.noticeId },
        })
        res.success()
    },
}
