const { sequelize } = require('../util')
const Sequelize = require('sequelize')

module.exports = {
    admin: require('./admin')(sequelize, Sequelize),
    adress: require('./adress')(sequelize, Sequelize),
    answer: require('./answer')(sequelize, Sequelize),
    article: require('./article')(sequelize, Sequelize),
    attachment: require('./attachment')(sequelize, Sequelize),
    bug: require('./bug')(sequelize, Sequelize),
    cameraConfig: require('./camera_config')(sequelize, Sequelize),
    cameraRecord: require('./camera_record')(sequelize, Sequelize),
    category: require('./category')(sequelize, Sequelize),
    config: require('./config')(sequelize, Sequelize),
    faceData: require('./face_data')(sequelize, Sequelize),
    notice: require('./notice')(sequelize, Sequelize),
    peoples: require('./peoples')(sequelize, Sequelize),
    property: require('./property')(sequelize, Sequelize),
    question: require('./question')(sequelize, Sequelize),
    tags: require('./tags')(sequelize, Sequelize),
    users: require('./users')(sequelize, Sequelize),
    visitorRecord: require('./visitor_record')(sequelize, Sequelize),
    visitor: require('./visitor')(sequelize, Sequelize),
    enums: require('./enum'),
}
