const { sequelize } = require('../util')
const Sequelize = require('sequelize')

const admin = require('./admin')(sequelize, Sequelize)
const adress = require('./adress')(sequelize, Sequelize)
const answer = require('./answer')(sequelize, Sequelize)
const article = require('./article')(sequelize, Sequelize)
const attachment = require('./attachment')(sequelize, Sequelize)
const bug = require('./bug')(sequelize, Sequelize)
const cameraConfig = require('./camera_config')(sequelize, Sequelize)
const cameraRecord = require('./camera_record')(sequelize, Sequelize)
const category = require('./category')(sequelize, Sequelize)
const config = require('./config')(sequelize, Sequelize)
const faceData = require('./face_data')(sequelize, Sequelize)
const notice = require('./notice')(sequelize, Sequelize)
const peoples = require('./peoples')(sequelize, Sequelize)
const property = require('./property')(sequelize, Sequelize)
const question = require('./question')(sequelize, Sequelize)
const tags = require('./tags')(sequelize, Sequelize)
const users = require('./users')(sequelize, Sequelize)
const visitorRecord = require('./visitor_record')(sequelize, Sequelize)
const visitor = require('./visitor')(sequelize, Sequelize)
const questionLike = require('./question_like')(sequelize, Sequelize)

visitorRecord.belongsTo(peoples, { foreignKey: 'visitor_id' })

peoples.hasOne(users, { foreignKey: 'people_id' })
users.belongsTo(peoples, { foreignKey: 'people_id' })

peoples.hasOne(admin, { foreignKey: 'people_id' })
admin.belongsTo(peoples, { foreignKey: 'people_id' })

peoples.hasMany(cameraRecord, { foreignKey: 'id' })
cameraRecord.belongsTo(peoples, { foreignKey: 'people_id' })

question.hasMany(answer, { foreignKey: 'question_id' })
question.belongsTo(peoples, { foreignKey: 'people_id' })
answer.belongsTo(question, { foreignKey: 'question_id' })
answer.belongsTo(peoples, { foreignKey: 'people_id' })
peoples.hasMany(question, { foreignKey: 'id' })

peoples.belongsTo(adress, { foreignKey: 'adress_id' })
adress.hasMany(peoples, { foreignKey: 'id' })

module.exports = {
    admin,
    adress,
    answer,
    article,
    attachment,
    bug,
    cameraConfig,
    cameraRecord,
    category,
    config,
    faceData,
    notice,
    peoples,
    property,
    question,
    tags,
    users,
    visitorRecord,
    visitor,
    questionLike,
    enums: require('./enum'),
}
