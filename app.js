global._ = require('underscore')
require('shelljs/global')
const express = require('express')
const fs = require('fs')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const config = require('./config')
const router = require('./router')
const expressValidator = require('express-validator')
const { customValidators } = require('./util')

const app = express()
const { cors, auth, queryParser, httplog } = require('./midware')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /static
app.use(expressValidator({ customValidators }))
app.use(logger('dev'))
app.use(queryParser)
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(express.static(path.join(__dirname, 'static')))
app.use(cors)
app.use(httplog)
// app.use(auth)
app.use(router)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use(({ code = -1, message, stack }, req, res, next) => { // eslint-disable-line 
    res.fail(code, message)
})

// some init actions
rm('-rf', config.QRCODE_FOLDER) // eslint-disable-line 
fs.mkdirSync(config.QRCODE_FOLDER)

app.listen(config.PORT.HTTP)
