const { peoples, enums } = require('../models')
const config = require('../config')

const { UserRank } = enums

module.exports = async (req, res, next) => {
    if (isNoAuthPath(req.path) || req.method === 'OPTIONS') {
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

/**
 * no auth files or paths
 * @param   {string} path    req url
 * @returns {boolean}
 */
function isNoAuthPath(path) {
    return config.NO_AUTH_PATHS.includes(path) || config.NO_AUTH_REG.test(path)
}
