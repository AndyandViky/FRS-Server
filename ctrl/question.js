const {
    question,
    answer,
    peoples,
} = require('../models')

const { userSvc } = require('../service')

module.exports = {
    /**
     * 增加问题
     */
    async addQuestion(req, res) {
        req.body.people_id = req.auth.selfId
        await question.create(req.body)
        res.success()
    },

    /**
     * 获取问题列表
     */
    async getQuestions(req, res) {
        const { pageNo, pageSize, type, userId } = req.query
        const { selfId } = req.auth
        const query = {}
        if (type) {
            query.type = type
        }
        if (userId !== undefined && userSvc.checkAdmin(selfId)) {
            if (userId !== 0) {
                query.people_id = userId
            } else query.people_id = { $gt: userId }
        } else query.people_id = selfId
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await question.findAll({
            include: [answer, peoples],
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await question.count({ where: query })
        res.success(data)
    },

    /**
     * 获取问题详情
     */
    async getQuestion(req, res) {
        const data = await question.findOne({
            include: [answer, peoples],
            where: { id: req.query.questionId },
        })
        res.success(data)
    },

    /**
     * 删除问题
     */
    async deleteQuestion(req, res) {
        await question.delete({
            where: { id: req.query.questionId },
        })
        res.success()
    },

    /**
     * 给问题点赞/取消点赞
     */
    async addLike(req, res) {
    },

    /**
     * 回答问题
     */
    async addAnswer(req, res) {
        req.body.people_id = req.auth.selfId
        await answer.create(req.body)
        res.success()
    },
}
