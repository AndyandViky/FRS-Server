const {
    article,
} = require('../models')
const { cache } = require('../util')
const { CacheKey, ArticleCategory } = require('../models').enums
const config = require('../config')

module.exports = {
    /**
     * 获取文章列表
     */
    async getArticles(req, res) {
        const { pageNo, pageSize } = req.query
        const data = {
            datas: [],
            pageNo,
            pageSize,
            total: '',
        }
        data.total = await getArticlesByCache(req.query, data.datas)
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
        console.log('发布文章')
        await updateArticleCache()
        res.success()
    },

    /**
     * 删除文章
     */
    async deleteArticle(req, res) {
        await article.destroy({
            where: { id: req.body.articleId },
        })
        await updateArticleCache()
        res.success()
    },

    /**
     * 修改文章
     */
    async changeArticle(req, res) {
        await article.update(req.body, {
            where: { id: req.body.articleId },
        })
        await updateArticleCache()
        res.success()
    },
}

/**
 * 获取缓存中的文章
 * @param {*} query
 */
async function getArticlesByCache(query, datas) {
    const { pageNo, pageSize, category } = query

    let articles = await cache.getByPromise(CacheKey.Articles)
    if (!articles) {
        console.log('文章缓存没有了')
        articles = await updateArticleCache()
    }
    let index = (pageNo - 1) * pageSize
    let count = 0
    let total = articles.length
    if (category !== undefined) {
        if (category === 'recommond') {
            // 选取推荐的
            console.log('获取推荐文章')
            total = 0
        } else if (category === 'other') {
            // 选取除普通文章之外的
            console.log('获取动态文章')
            while (count < pageSize && articles[index]) {
                if (articles[index].category === ArticleCategory.Lost.value
                || articles[index].category === ArticleCategory.Dynamic.value) {
                    datas.push(articles[index])
                    count++
                }
                index++
            }
            total = await article.count({
                where: { category: {
                    $in: [ArticleCategory.Lost.value, ArticleCategory.Dynamic.value],
                } },
            })
        } else {
            while (count < pageSize && articles[index]) {
                if (articles[index].category === ArticleCategory.Article.value) {
                    datas.push(articles[index])
                    count++
                }
                index++
            }
            total = await article.count({
                where: { category: ArticleCategory.Article.value },
            })
        }
    } else {
        while (count < pageSize && articles[index]) {
            datas.push(articles[index++])
            count++
        }
    }
    return total
}

/**
 * 更新文章缓存
 */
async function updateArticleCache() {
    const articles = await article.findAll()
    cache.set(CacheKey.Articles, articles, config.EXPIRE_TIME)
    return articles
}
