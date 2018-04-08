const { attachment, enums } = require('../models')
const multiparty = require('multiparty')

const { UploadPath } = enums

module.exports = {
    /**
     * 上传附件
     */
    async uploadImage(req, res) {
        const { type } = req.body
        const imagePath = {
            auth: UploadPath.Auth.value,
            bug: UploadPath.Bug.value,
        }
        const { selfId } = req.auth
        const form = new multiparty.Form()
        form.uploadDir = imagePath[type]
        form.parse(req, async (err, fields, files) => {
            const paths = files.file[0].path
            await attachment.create({
                people_id: selfId,
                paths,
            })
            res.success({ paths })
        })
    },

    /**
     * 上传文件
     */
    async uploadFile(req, res) {

    },
}
