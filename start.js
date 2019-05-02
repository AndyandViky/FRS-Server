// start
const app = require('./app')
const config = require('./config')

app.listen(config.PORT.HTTP)

// 初始化
const { systemConfig } = require('./models')

function initSystemConfig() {
    systemConfig.update({
        isOpen: 1,
        isUpdate: 1,
    }, {
        where: { id: 1 },
    })
}
initSystemConfig()
