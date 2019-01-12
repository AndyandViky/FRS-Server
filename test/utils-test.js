const { jwtSvc } = require('../service')
const { peoples } = require('../models')

module.exports = async (id) => {
    const user = await peoples.findById(id)
    const jwt = await jwtSvc.sign({ selfId: user.id, type: user.types })
    return jwt
}
