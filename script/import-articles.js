/**
 * 爬虫
 * 爬取大量文章
 */
const cheerio = require('cheerio')
const request = require('request')
const articleModel = require('../models').article

// request.setCharacterEncoding('utf-8')
async function getHtml(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body)
            } else {
                request(url, (err, res, data) => {
                    if (!err && res.statusCode === 200) {
                        resolve(data)
                    } else {
                        console.log('两次获取失败！')
                        reject(err)
                    }
                })
            }
        })
    })
}
// csdn爬虫
// 按照类别修改以下url即可
const url = 'https://www.csdn.net/'
const articles = []
async function csdnReptile() {
    const indexPage = await getHtml(url)
    const $ = cheerio.load(indexPage)
    const navUrl = []
    $('.nav_com>ul>li').each(function () {
        const nav = $(this).find('a').attr('href')
        if (/^\/nav*/.test(nav) && nav !== '/nav/game' && nav !== '/nav/watchers') {
            navUrl.push(nav)
        }
    })

    let count = 0
    if (count === 0) {
        const articleUrls = await getCsdnNavByApi(navUrl[count].substring(5), 40)
        await getcsdnArticleDetail(articleUrls)
        count++
    }
    const timer = setInterval(async () => {
        if (count++ === navUrl.length) {
            clearInterval(timer)
            return 0
        }
        // 开始爬取
        // const articleUrls = await getCsdnNavByPage(navUrl[count - 1].substring(1))
        const articleUrls = await getCsdnNavByApi(navUrl[count - 1].substring(5), 40)
        await getcsdnArticleDetail(articleUrls)
    }, 2000 * 60)
}

function sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
/**
 * 直接获取api文章url
 */
async function getCsdnNavByApi(nav, count) {
    const apiUrl = `https://www.csdn.net/api/articles?type=more&category=${nav}`
    const articleUrls = []
    const date1 = Date.now()
    console.log(date1)
    for (let i = 0; i < count; i++) {
        await sleep(500)
        let data = await getHtml(apiUrl)
        data = JSON.parse(data)
        data.articles.map((item) => {
            if (checkIsLive(item.id)) {
                console.log(item.url)
                articleUrls.push(item.url)
            }
        })
        console.log('===========')
    }
    const date2 = Date.now()
    console.log(`获取一轮api花费${date2 - date1}`)
    return articleUrls
}

/**
 * 通过页面获取文章url
 */
async function getCsdnNavByPage(nav) {
    const navPage = await getHtml(url + nav)
    const $ = cheerio.load(navPage)
    const articleUrls = []
    $('#feedlist_id>li').each(function () {
        const articleUrl = $(this).find('.title>h2>a').attr('href')
        const title = $(this).find('.title>h2>a').text().trim()
        const articleId = articleUrl.split('/')[articleUrl.split('/').length - 1]
        if (articleUrl && title.indexOf('游戏') === -1 && checkIsLive(articleId)) {
            articleUrls.push(articleUrl)
        }
    })
    return articleUrls
}

/**
 *  获取文章详情
 * @param {*} articleUrls
 */
async function getcsdnArticleDetail(articleUrls) {
    const article = {}
    article.category = '普通文章'
    article.status = 1
    article.tag = '新闻,动态'
    let count = 0
    const timer = setInterval(async () => {
        if (count++ === articleUrls.length) {
            clearInterval(timer)
        }
        const item = articleUrls[count - 1]
        const articlePage = await getHtml(item)
        article.articleId = item.split('/')[item.split('/').length - 1]
        const $ = cheerio.load(articlePage, { ecodeEntities: false })
        article.title = $('.title-article').text().trim()
        const content = $('.baidu_pl').html()
        article.content = `<!DOCTYPE html><html><head></head><body>${content}</body></html>`
        articles.push(article)
        articleModel.create(article)
    }, 200)
}

/**
 * 检测当前文章是否已经存在
 * @param {*} articleId
 */
function checkIsLive(articleId) {
    const isLive = articles.find((item) => {
        return item.articleId === articleId
    })
    if (isLive === undefined) return true
    return false
}
(async () => {
    await csdnReptile()
    // const date1 = Date.now()
    // const articleUrls = await getCsdnNavByApi('web', 40)
    // await getcsdnArticleDetail(articleUrls)
    // const date2 = Date.now()
    // console.log(`========${date2 - date1}`)
})()
// articles = [{
//     articleId: '88745331',
//     url: 'https://blog.csdn.net/xzy_thu/article/details/88745334',
// }]
// const isLive = articles.find((item) => {
//     const articleId = item.url.split('/')[item.url.split('/').length - 1]
//     // console.log(item.articleId === articleId)
//     return item.articleId === articleId
// })
// console.log(isLive)
