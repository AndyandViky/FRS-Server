const { common } = require('../util')
const { enums } = require('../models')

const { UserRank }  = enums

module.exports = {
    checkPassword(password1, password2) {
        return common.encryptInfo(password1) === password2
    },

    async checkAdmin(type) {
        return type === UserRank.Admin.value
    },

    async checkResident(type) {
        return type >= UserRank.Resident.value
    },
}
