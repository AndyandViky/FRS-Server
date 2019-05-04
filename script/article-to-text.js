/**
 * 拉取所有文章并转为文本
 */

const fs = require('fs')
const os = require('os')
const readline = require('readline')
const cheerio = require('cheerio')
const { cache } = require('../util')
const { CacheKey } = require('../models').enums

const fWriteName = './articles.txt'// 准备要写的文件

async function toText() {
    const articles = await cache.getByPromise(CacheKey.Articles)
    const fWrite = fs.createWriteStream(fWriteName)
    for (let i = 0; i < articles.length; i++) {
        const item = articles[i]
        const html = item.content
        html.replace()
        const $ = cheerio.load(html)
        $('a').each(function () {
            $(this).remove()
        })
        $('link').each(function () {
            $(this).remove()
        })
        $('code').each(function () {
            $(this).remove()
        })
        $('img').each(function () {
            $(this).remove()
        })
        $('head').each(function () {
            $(this).remove()
        })
        $('meta').each(function () {
            $(this).remove()
        })
        $('script').each(function () {
            $(this).remove()
        })
        $('title').each(function () {
            $(this).remove()
        })
        $('video').each(function () {
            $(this).remove()
        })
        // 剔除<a>, <image>, <code>, <link>标签
        let text = $.text().trim()
        text = deleteStr(text, '版权声明')
        text = text.replace(/\r\n/g, ' ')
        text = `${JSON.stringify(item.id)}@@@${JSON.stringify(item.title)}@@@${JSON.stringify(text)}`
        try {
            fWrite.write(text + os.EOL)
        } catch (err) {
            continue
        }
    }
    console.log('写入完毕！')
    return 0
}

function deleteStr(text, str) {
    const index = text.indexOf(str)
    if (index !== -1) {
        let j = index
        for (; j < text.length; j++) {
            if (text[j] === '\n') break
        }
        text = text.substring(0, index) + text.substring(j)
    }
    return text
}

(async () => {
    toText()
})()
