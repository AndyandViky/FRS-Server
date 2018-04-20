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
    const count = await peoples.count({
        where: { id: req.auth.selfId, types: type },
    })
    if (count === 0) {
        return next(new Error('您没有访问权限'))
    }
    next()
}
