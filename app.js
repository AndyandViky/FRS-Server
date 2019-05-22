global._ = require('underscore')
require('shelljs/global')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const { admin, user, resident, visitor } = require('./router')
const { customValidators } = require('./util')

const app = express()
const { cors, auth, queryParser, httplog, userAuth } = require('./midware')

// uncomment after placing your favicon in /static
app.use(expressValidator({ customValidators }))
app.use(logger('dev'))
app.use(queryParser)
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static('public'))
app.use(cors)
app.use(httplog)
app.use(auth)
app.use(user)
app.use('/resident', userAuth, resident)
app.use('/admin', userAuth, admin)
app.use('/visitor', userAuth, visitor)

require('./task')

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(({ code = -1, message, stack }, req, res, next) => { // eslint-disable-line 
    res.fail(code, message)
})

module.exports = app
