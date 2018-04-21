const { validhelper } = require('../util')

const Type = {
    String: { name: 'String', func: 'isString' },
    Number: { name: 'Number', func: 'isNumeric' },
    Decimal: { name: 'Decimal', func: 'isDecimal' },
    Boolean: { name: 'Boolean', func: 'isBoolean' },
    Url: { name: 'Url', func: 'isURL' },
    Hash: { name: 'Hash', func: 'isHash' },
    Phone: { name: 'Phone', func: 'isPhone' },
    IdCardNO: { name: 'IdCardNO', func: 'isIdCardNO' },
    ObjectId: { name: 'ObjectId', func: 'isMongoId' },
    Stamp: { name: 'Stamp', func: 'isStamp' },
    UnixStamp: { name: 'UnixStamp', func: 'isUnixStamp' },
    StringArray: { name: '[String]', func: 'isStringArray' },
}

module.exports = {

    login: [
        ['email', Type.String, false],
        ['phone', Type.Phone, false],
        ['password', Type.String, true],
    ],

    register: [
        ['type', Type.Number, true],
        ['email', Type.String, true],
        ['name', Type.String, true],
        ['phone', Type.Phone, true],
        ['password', Type.String, true],
        ['confirmPwd', Type.String, true],
        ['gender', Type.Number, true],
        ['house_number', Type.Number, true],
        ['adress_id', Type.Number, true],
    ],

    changeUserInfo: [
        ['email', Type.String, true],
        ['name', Type.String, true],
        ['phone', Type.Phone, true],
        ['gender', Type.Number, true],
        ['age', Type.Number, true],
    ],

    actived: [
        ['token', Type.String, true],
    ],

    updatePwd: [
        ['oldPwd', Type.String, true],
        ['newPwd', Type.String, true],
        ['confirmPwd', Type.String, true],
    ],

    activeModel: [
        ['modelId', Type.Number, true],
    ],

    getCameraRecords: [
        ['pageNo', Type.Number, true],
        ['pageSize', Type.Number, true],
        ['type', Type.Number, false],
        ['userId', Type.Number, false],
    ],

    addBug: [
        ['title', Type.String, true],
        ['content', Type.String, true],
        ['path', Type.String, false],
    ],

    getArticles: [
        ['pageNo', Type.Number, true],
        ['pageSize', Type.Number, true],
        ['status', Type.Number, false],
    ],

    getArticle: [
        ['articleId', Type.Number, true],
    ],

    getVisitors: [
        ['pageNo', Type.Number, true],
        ['pageSize', Type.Number, true],
        ['status', Type.Number, false],
        ['userId', Type.Number, false],
    ],

    openDoor: [
        ['selfPwd', Type.Number, true],
    ],

    residentVerify: [
        ['phone', Type.Phone, true],
        ['card_id', Type.IdCardNO, true],
        ['identity_pic', Type.String, true],
        ['card_front', Type.String, true],
        ['card_opposite', Type.String, true],
    ],

    approveVisitor: [
        ['visitorId', Type.Number, true],
    ],

    registerVisitor: [
        ['name', Type.String, true],
        ['gender', Type.Number, true],
        ['age', Type.Number, true],
        ['phone', Type.Phone, true],
        ['deadline', Type.Number, true],
        ['belong', Type.Number, true],
        ['reason', Type.String, true],
        ['facePath', Type.String, true],
        ['adress_id', Type.Number, true],
    ],

    getNoticeList: [
        ['pageNo', Type.Number, true],
        ['pageSize', Type.Number, true],
        ['status', Type.Number, false],
        ['userId', Type.Number, false],
    ],

    updateStatus: [
        ['noticeId', Type.Number, true],
    ],

    removeNotice: [
        ['noticeId', Type.Number, true],
    ],

    addLike: [
        ['questionId', Type.Number, true],
    ],

    // 访客
    applyVisite: [
        ['belong', Type.Number, true],
        ['deadline', Type.Number, true],
        ['pass_time', Type.Number, true],
        ['reason', Type.String, true],
    ],

    // 管理员
    approveResident: [
        ['userId', Type.Number, true],
    ],

    operatedBug: [
        ['bugId', Type.Number, true],
        ['result', Type.String, true],
    ],

    getBugs: [
        ['pageNo', Type.Number, true],
        ['pageSize', Type.Number, true],
        ['userId', Type.Number, false],
    ],

    getBug: [
        ['bugId', Type.Number, true],
    ],

    deleteBug: [
        ['bugId', Type.Number, true],
    ],

    addArticle: [
        ['title', Type.String, true],
        ['content', Type.String, true],
        ['status', Type.Number, true],
        ['tag', Type.String, false],
        ['category', Type.String, false],
    ],

    changeArticle: [
        ['title', Type.String, true],
        ['content', Type.String, true],
        ['status', Type.Number, true],
        ['tag', Type.String, false],
        ['category', Type.String, false],
    ],

    deleteArticle: [
        ['articleId', Type.Number, true],
    ],

    getResidents: [
        ['pageNo', Type.Number, true],
        ['pageSize', Type.Number, true],
    ],

    openCamera: [
        ['cameraNum', Type.Number, true],
    ],

    closeCamera: [
        ['cameraNum', Type.Number, true],
    ],

    /**
     * validation helper
     */
    validateParams(req, next, fields) {
        fields.forEach(([field, type, required]) => {
            if (required) {
                validhelper.assertEmptyOne(req, field, 1005)
            }
            if (req.query[field] || req.body[field]) {
                validhelper.assertType(req, field, 1005, type)
            }
        })
        handleResult(req, next)
    },
}

function handleResult(req, next) {
    req.getValidationResult().then(result => {
        if (result.isEmpty()) return next()

        const arr = result.array()[0].msg.split('@@')
        const err = new Error(arr[1])
        err.code = parseInt(arr[0], 10)
        return next(err)
    })
}
