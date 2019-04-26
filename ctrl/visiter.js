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
        const people = peoples.findById(selfId, {
            attributes: ['types'],
        })
        if (people.types !== UserRank.Visitor.value) {
            return next(new Error('您不是访客'))
        }
        req.body.belong = selfId
        await visitorRecord.create(req.body)
        res.success()
    },
}
