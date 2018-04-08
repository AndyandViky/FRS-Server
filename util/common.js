const moment = require('moment')
const crypto = require('crypto')

moment.locale('zh-cn')

// 格式化时间
exports.formatDate = function (date, friendly) {
    date = moment(date)

    if (friendly) {
        return date.fromNow()
    }
    return date.format('YYYY-MM-DD HH:mm')
}

Date.prototype.Format = function (fmt) { // author: meizz
    const o = {
        'M+': this.getMonth() + 1, // 月份
        'd+': this.getDate(), // 日
        'h+': this.getHours(), // 小时
        'm+': this.getMinutes(), // 分
        's+': this.getSeconds(), // 秒
        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
        S: this.getMilliseconds(), // 毫秒
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length))
    for (const k in o) { if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length))) }
    return fmt
}
/**
     * 生成随机字符串
     * @param  {[type]} len [description]
     * @return {[type]}     [description]
     */
exports.randomString = function (len, type = 'string') {
    len = len || 32
    let $chars = ''
    if (type !== 'string') {
        $chars = '1234567890'
    } else {
        $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1*** */
    }
    const maxPos = $chars.length
    let pwd = ''
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
}

exports.encryptInfo = function (content) {
    const sha1 = crypto.createHash('sha1')
    sha1.update(content)
    return sha1.digest('hex')
}
