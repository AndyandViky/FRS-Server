const { common } = require('../util')
const { peoples, enums } = require('../models')

const { DataStatus, UserRank }  = enums

module.exports = {
    checkPassword(password1, password2) {
        return common.encryptInfo(password1) === password2
    },

    async checkAdmin(id) {
        const user = await peoples.findOne({
            where: { id, is_active: DataStatus.Actived.value },
            attributes: ['types'],
        })
        return !!(user && user.type === UserRank.Admin.value)
    },
}
