
const { peoples } = require('../models')
const { common } = require('../util')

async function initPwd() {
    await peoples.update({
        password: common.encryptInfo('123456'),
    }, {
        where: {
            phone: '17805850721',
        },
    })
}
(async () => {
    await initPwd()
})()
