const { peoples, enums } = require('../models')

const { UserRank } = enums

module.exports = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    // verify
    const typeBox = {
        admin: UserRank.Admin.value,
        resident: UserRank.Resident.value,
        visitor: UserRank.Visitor.value,
    }
    const types = req.baseUrl.substring(1)
    const type = typeBox[types]
    const user = await peoples.findById(req.auth.selfId, {
        attributes: ['types'],
    })
    if (user.types < type) {
        return next(new Error('您没有访问权限'))
    }
    next()
}
