const multiparty = require('multiparty')
const gm = require('gm')
const { attachment, enums } = require('../models')
const config = require('../config')

const { UploadPath } = enums

module.exports = {
    /**
     * 上传附件
     */
    async uploadImage(req, res, next) {
        const { selfId } = req.auth
        const form = new multiparty.Form()
        form.uploadDir = UploadPath.Attachment.value
        form.parse(req, async (err, fields, files) => {
            const paths = files.file[0].path
            config.DATACATCHCOUNT += files.file[0].size
            const imageMagick = gm.subClass({ imageMagick: true })
            imageMagick(paths).size(async (err, value) => {
                console.log(err)
                if (err) return next(new Error('获取失败, 请重新上传'))
                let Rwidth
                let Rheight
                let rate
                if (value.width > value.height) {
                    rate = 640 / value.width
                    Rwidth = 640
                    Rheight = Math.floor(value.height * rate)
                } else {
                    rate = 640 / value.height
                    Rheight = 640
                    Rwidth = Math.floor(value.width * rate)
                }
                imageMagick(paths)
                    .resize(Rwidth, Rheight, '!')
                    .autoOrient()
                    .write(paths, async (err) => {
                        const attr = await attachment.create({
                            people_id: selfId,
                            path: paths,
                            width: Rwidth,
                            height: Rheight,
                        })
                        res.success({ id: attr.id, path: paths })
                    })
            })
        })
    },

    /**
     * 上传文件
     */
    async uploadFile(req, res) {

    },
}
