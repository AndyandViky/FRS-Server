/* ******************************************************************
 * extends targets here
 ****************************************************************** */
const express = require('express')

express.response.success = function (data, msg = '成功') {
    this.json({ code: 1, msg, data })
}

express.response.fail = function (code = -1, msg = '失败') {
    this.json({ code, msg })
}
