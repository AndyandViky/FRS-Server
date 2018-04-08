const { promisify } = require('util')
const nodemailer = require('nodemailer')
let smtpTransport = require('nodemailer-smtp-transport')
const config = require('../config')

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
    async sendEmail(recipient, subject, html) {
        await sendMail({
            from: config.EMAIL.USER,
            to: recipient,
            subject,
            html,
        })
    },
}
