const {
    question,
    answer,
    peoples,
    adress,
    questionLike,
    enums,
} = require('../models')
const { userSvc } = require('../service')

const { QuestionLike } = enums

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
        const { pageNo, pageSize, userId, search } = req.query
        const { type } = req.auth
        const query = {}
        if (search) {
            const searchData = JSON.parse(search)
            if (searchData.searchName !== '') {
                query.title = { $like: `%${searchData.searchName}%` }
            }
            if (searchData.dateFilter[0] !== '' && searchData.dateFilter[1] !== '') {
                query.created_at = { $between: searchData.dateFilter }
            }
        }
        if (userId !== undefined && userSvc.checkResident(type)) {
            query.people_id = userId
        }
        const data = {
            datas: [],
            adress: [],
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

        // 获取所有的adress id 并作一个分类
        const adressIds = []
        for (const item of data.datas) {
            const adressId = adressIds.find(result => {
                return result.id === item.people.adress_id
            })
            if (adressId) {
                adressId.questionIds.push(item.id)
            } else {
                adressIds.push({ id: item.people.adress_id, questionIds: [item.id] })
            }
        }

        for (const item1 of adressIds) {
            const adressR = await adress.findById(item1.id, {
                attributes: ['province', 'city', 'community'],
            })
            for (const item2 of item1.questionIds) {
                data.adress.push({
                    questionId: item2,
                    adress: adressR,
                })
            }
        }
        data.total = await question.count({ where: query })
        res.success(data)
    },

    /**
     * 获取问题详情
     */
    async getQuestion(req, res) {
        const data = {
            question: {},
            answers: [],
            total: 0,
        }
        data.question = await question.findOne({
            include: [peoples],
            where: { id: req.query.questionId },
        })
        data.answers = await answer.findAll({
            include: [peoples],
            where: { question_id: req.query.questionId },
            pageNo: 0,
            pageSize: 10,
        })
        data.total = await answer.count({
            where: { question_id: req.query.questionId },
        })
        res.success(data)
    },

    /**
     * 修改问题内容
     */
    async changeQuestionInfo(req, res) {
        await question.update(req.body, {
            where: { id: req.body.questionId },
        })
        res.success()
    },


    /**
     * 删除问题
     */
    async deleteQuestion(req, res) {
        await question.destroy({
            where: { id: req.body.questionId },
        })
        res.success()
    },

    /**
     * 给问题点赞/取消点赞
     */
    async addLike(req, res, next) {
        const { selfId, type } = req.auth
        const { questionId } = req.body
        if (!userSvc.checkResident(type)) {
            return next(new Error('您暂没有点暂的权限'))
        }
        const like = await questionLike.findOne({
            where: { question_id: questionId, people_id: selfId },
        })
        const questionData = await question.findById(questionId)
        let likeType = 0
        if (like) {
            // 已点过
            await like.update({
                is_like: like.is_like === QuestionLike.Add.value ? QuestionLike.Cancel.value : QuestionLike.Add.value,
            })
            await questionData.update({
                like: like.is_like === QuestionLike.Add.value ? questionData.like + 1 : questionData.like - 1,
            })
            likeType = like.is_like === QuestionLike.Add.value ? QuestionLike.Add.value : QuestionLike.Cancel.value
        } else {
            await questionLike.create({
                question_id: questionId,
                people_id: selfId,
                is_like: QuestionLike.Add.value,
            })
            await questionData.update({
                like: questionData.like + 1,
            })
            likeType = 1
        }
        res.success({ likeType })
    },

    /**
     * 回答问题
     */
    async addAnswer(req, res, next) {
        req.body.people_id = req.auth.selfId
        if (!userSvc.checkResident(req.auth.type)) {
            return next(new Error('您暂没有回答的权限'))
        }
        await answer.create(req.body)
        res.success()
    },

    /**
     * 修改回答内容
     */
    async changeAnswer(req, res) {
        await answer.update(req.body, {
            where: { id: req.body.answerId },
        })
        res.success()
    },

    /**
     * 删除回答
     */
    async deleteAnswer(req, res) {
        await answer.destroy({
            where: { id: req.body.answerId },
        })
        res.success()
    },
}
