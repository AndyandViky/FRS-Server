const {
    peoples,
    enums,
    bug,
    notice,
} = require('../models')

const { UserRank } = enums

module.exports = {
    /**
     * 提交故障
     */
    async addBug(req, res) {
        const { selfId } = req.auth
        req.body.people_id = selfId
        await bug.create(req.body)
        const user = await peoples.findById(selfId)
        const admins = await peoples.findAll({
            where: { adress_id: user.adress_id, types: UserRank.Admin.value },
            attributes: ['id'],
        })
        for (const admin of admins) {
            await notice.create({
                people_id: admin.id,
                title: '故障申报通知',
                content: `申报人为: ${user.name}, 申报时间为: ${new Date()}`,
                send_id: selfId,
            })
        }
        res.success()
    },

    /**
     * 获取故障列表
     */
    async getBugs(req, res) {
        const { pageNo, pageSize, userId, search } = req.query
        const query = {}
        if (search !== undefined && search !== '{}') {
            const searchData = JSON.parse(search)
            if (searchData.searchName !== '') {
                query.title = { $like: `%${searchData.searchName}%` }
            }
            if (searchData.dateFilter[0] !== '' && searchData.dateFilter[1] !== '') {
                query.created_at = { $between: searchData.dateFilter }
            }
        }
        if (userId) query.people_id = userId
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await bug.findAll({
            include: [peoples],
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await bug.count({ where: query })
        res.success(data)
    },

    /**
     * 获取故障详情
     */
    async getBug(req, res) {
        const data = await bug.findById(req.query.bugId)
        res.success(data)
    },

    /**
     * 处理故障信息
     */
    async operatedBug(req, res) {
        const { bugId, result } = req.body
        await bug.update({
            result,
            operated_id: req.auth.selfId,
        }, {
            where: { id: bugId },
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
     * 删除故障信息
     */
    async deleteBug(req, res) {
        await bug.destroy({
            where: { id: req.body.bugId },
        })
        res.success()
    },

}
