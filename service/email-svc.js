const { promisify } = require('util')
const nodemailer = require('nodemailer')
let smtpTransport = require('nodemailer-smtp-transport')
const config = require('../config')

// 填入基础的邮箱信息
smtpTransport = nodemailer.createTransport(smtpTransport({
    service: config.EMAIL.SERVICE,
    port: 465,
    host: 'smtp.qq.com',
    auth: {
        user: config.EMAIL.USER,
        pass: config.EMAIL.PASSWORD,
    },
}))
const sendMail = promisify(smtpTransport.sendMail).bind(smtpTransport)
module.exports = {
    /**
     * @param {*} recipient 接收者
     * @param {*} subject 主题
     * @param {*} text 内容
     */
    async sendEmail(recipient, subject, text) {
        await sendMail({
            from: config.EMAIL.USER,
            to: recipient,
            subject,
            text,
        })
    },
}
