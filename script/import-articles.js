// ps: delete from article where id Not In (select min_id from (Select min(id) as min_id From article Group By title) as a);去除数据库中重复的数据
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
const loopCount = 5
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
        const articleUrls = await getCsdnNavByApi(navUrl[count].substring(5), loopCount)
        await getcsdnArticleDetail(articleUrls)
        count++
    }
    const timer = setInterval(async () => {
        if (count++ === navUrl.length) {
            clearInterval(timer)
            console.log(`拉取结束，文章一共有${articles.length}条`)
            return 0
        }
        // 开始爬取
        // const articleUrls = await getCsdnNavByPage(navUrl[count - 1].substring(1))
        const articleUrls = await getCsdnNavByApi(navUrl[count - 1].substring(5), loopCount)
        await getcsdnArticleDetail(articleUrls)
    }, 2000 * 40)
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
    const articleUrls = []
    const date1 = Date.now()
    for (let j = 0; j < count; j++) {
        const time = Date.now()
        const apiUrl = `https://www.csdn.net/api/articles?type=more&category=${nav}&shown_offset=${time}`
        console.log(time)
        for (let i = 0; i < count; i++) {
            await sleep(500)
            let data = await getHtml(apiUrl)
            data = JSON.parse(data)
            data.articles.map((item) => {
                console.log(item.title)
                articleUrls.push(item.url)
            })
            console.log('===========')
        }
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
        if (articleUrl && title.indexOf('游戏') === -1 && checkIsLive(title)) {
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
function checkIsLive(title) {
    const isLive = articles.find((item) => {
        return item.title === title
    })
    if (isLive === undefined) return true
    return false
}
(async () => {
    // await csdnReptile()
    // await biibRepetile()
    await guokrRepetile()
    return 0
})()

/**
 * http://www.biib.cn/文章爬取
 */
async function biibRepetile() {
    const bUrl = 'http://www.biib.cn/du/index/'
    let count = 0
    const timer = setInterval(async () => {
        if (count++ === 12) {
            clearInterval(timer)
            console.log('爬取结束')
            return 0
        }
        const tbUrl = `${bUrl + count}.html`
        const articleListPage = await getHtml(tbUrl)
        const $ = cheerio.load(articleListPage)
        const articleUrls = []
        $('.arc-item').each(function () {
            const articleUrl = $(this).find('.arc-right>h4>a').attr('href')
            articleUrls.push(`http://www.biib.cn${articleUrl}`)
        })
        await getBArticleDetail(articleUrls)
    }, 15000)
}

async function getBArticleDetail(urls) {
    let count = 0
    const timer = setInterval(async () => {
        const article = {}
        article.category = '普通文章'
        article.status = 1
        article.tag = '新闻,动态'
        if (count++ === urls.length) {
            clearInterval(timer)
            return 0
        }
        const articlePage = await getHtml(urls[count - 1])
        const $ = cheerio.load(articlePage)
        $('audio').each(function () {
            $(this).remove()
        })
        $('img').each(function () {
            const src = $(this).attr('src')
            $(this).attr('src', `http://www.biib.cn${src}`)
        })
        article.title = $('.arc-title').text().trim()
        const content = $('.article-body').html()
        article.content = `<!DOCTYPE html><html><head></head><body><div>${content}</div></body></html>`
        await articleModel.create(article)
    }, 500)
}

/**
 * 果壳新闻
 * https://www.guokr.com/article/437000/#   - 451749
 * 451749 - 437000
 */
async function guokrRepetile() {
    const gUrl = 'https://www.guokr.com/article/4'
    let count = 0
    const initPage = 37000
    const timer = setInterval(async () => {
        if (count++ === 14750) {
            clearInterval(timer)
            console.log('爬取结束')
            return 0
        }
        const tgUrl = `${gUrl + (initPage + (count - 1))}/#`
        try {
            const articlePage = await getHtml(tgUrl)
            const $ = cheerio.load(articlePage)
            const article = {}
            article.category = '普通文章'
            article.status = 1
            article.tag = '新闻,动态'
            $('audio').each(function () {
                $(this).remove()
            })
            article.title = $('#articleTitle').text().trim()
            const content = $('#articleContent').html()
            if (article.title === '') {
                console.log('isnone')
            } else {
                article.content = `<!DOCTYPE html><html><head></head><body>${content}</body></html>`
                await articleModel.create(article)
            }
        } catch (err) {
            console.log('出错了')
        }
    }, 200)
}
