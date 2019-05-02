/**
 * 爬虫
 * 爬取大量文章
 */
const http = require('http')
const cheerio = require('cheerio')

const url = 'http://viky.wang/public/angel/#/angel/article'
http.get(url, (res) => {
    const chunks = []
    let size = 0
    res.on('data', (chunk) => {   // 监听事件 传输
        chunks.push(chunk)
        size += chunk.length
    })
    res.on('end', () => {  // 数据传输完
        const data = Buffer.concat(chunks, size)
        const html = data.toString()
        const $ = cheerio.load(html) // cheerio模块开始处理 DOM处理
        console.log(html)
        const articles = []
        $('.article_item').each(() => {
            console.log('====')
            const title = $(this).find('.right_article_name').html()
            console.log(title)
        })
    })
})
