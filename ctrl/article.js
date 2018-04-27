const {
    article,
} = require('../models')

module.exports = {
    /**
     * 获取文章列表
     */
    async getArticles(req, res) {
        const { pageNo, pageSize, status } = req.query
        const query = {}
        if (status) {
            query.status = status
        }
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await article.findAll({
            where: query,
            offset: (pageNo - 1) * pageSize,
            limit: pageSize,
        })
        data.total = await article.count({ where: query })
        res.success(data)
    },

    /**
     * 获取文章详情
     */
    async getArticle(req, res) {
        const { articleId } = req.query
        const data = await article.findById(articleId)
        res.success(data)
    },

    /**
     * 发布文章
     */
    async addArticle(req, res) {
        await article.create(req.body)
        res.success()
    },

    /**
     * 删除文章
     */
    async deleteArticle(req, res) {
        await article.destroy({
            where: { id: req.body.articleId },
        })
        res.success()
    },

    /**
     * 修改文章
     */
    async changeArticle(req, res) {
        await article.update(req.body, {
            where: { id: req.body.articleId },
        })
        res.success()
    },
}
