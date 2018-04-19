const {
    peoples,
    enums,
    visitorRecord,

} = require('../models')

const { UserRank } = enums

module.exports = {
    /**
     * 访客申请访问
     */
    async applyVisite(req, res, next) {
        const { selfId } = req.auth
        const people = peoples.findOne({
            where: { id: selfId },
        })
        if (people.type !== UserRank.Visitor.value) {
            return next(new Error('您不是访客'))
        }
        await visitorRecord.create(req.body)
        res.success()
    },
}
