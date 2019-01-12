const { jwtSvc } = require('../service')
const { peoples } = require('../models')

/**
 * 测试相关
 */
module.exports = {

    /**
     * 传入selfId计算jwt
     */
    async getJwt(req, res) {
        const user = await peoples.findById(req.query.selfId)
        const jwt = await jwtSvc.sign({ selfId: user.id, type: user.types })
        res.success(jwt)
    },
}
