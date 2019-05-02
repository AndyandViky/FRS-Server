const {
    article,
} = require('../models')
const { cache } = require('../util')
const { CacheKey } = require('../models').enums
const { config } = require('../config')

module.exports = {
    /**
     * 获取文章列表
     */
    async getArticles(req, res) {
        const { pageNo, pageSize, status } = req.query
        const query = {}
        if (status !== undefined) {
            query.status = status
        }
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.datas = await getArticlesByCache(req.query)
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

/**
 * 获取缓存中的文章
 * @param {*} query
 */
async function getArticlesByCache(query) {
    const { pageNo, pageSize, status } = query

    let articles = await cache.getByPromise(CacheKey.Articles)
    if (!articles) {
        articles = updateArticleCache()
    }
    const data = []
    let index = (pageNo - 1) * pageSize
    if (status === undefined) {
        for (let i = index; i < index + pageSize && articles[i]; i++) {
            data.push(articles[i])
        }
    } else {
        let count = 0
        while (count < pageSize && articles[index]) {
            if (articles[index].status === status) {
                data.push(articles[index])
                count++
            }
            index++
        }
    }
    return data
}

/**
 * 更新文章缓存
 */
async function updateArticleCache() {
    const articles = await article.findAll()
    cache.set(CacheKey.Articles, articles, config.EXPIRE_TIME)
    return articles
}
