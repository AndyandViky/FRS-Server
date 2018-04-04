const { jwtSvc } = require('../service')

/**
 * 测试相关
 */
module.exports = {

    /**
     * 传入selfId计算jwt
     */
    async getJwt(req, res) {
        const jwt = await jwtSvc.sign({ selfId: req.query.selfId })
        res.success(jwt)
    },
}
