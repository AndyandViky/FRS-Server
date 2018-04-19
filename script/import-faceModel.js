const fs = require('fs')
const path = require('path')

const { users, peoples, attachment } = require('../models')
const { faceSvc } = require('../service')
const gm = require('gm')

const imageMagick = gm.subClass({ imageMagick: true })

// `const filePath = path.resolve('/home/yanglin/yl/c++/arcsoft-arcface/face-api/static/images/face')

// fileDisplay(filePath)`
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(paths) {
    // 根据文件路径读取文件，返回文件列表%
    fs.readdir(paths, async (err, files) => {
        if (err) {
            console.warn(err)
        } else {
            // 遍历读取到的文件列表
            let count = 238
            for (const filename of files) {
                const filedir = path.join(paths, filename)
                const whData = {
                    Rwidth: 0,
                    Rheight: 0,
                }
                await changeImage(filedir, whData)
                await addImage(filedir, whData, count)
                count++
            }
        }
    })
}

module.exports = fileDisplay

function changeImage(filedir, whDatat) {
    return new Promise((resolve, reject) => {
        imageMagick(filedir).size((err, value) => {
            let rate
            if (value.width > value.height) {
                rate = 640 / value.width
                whDatat.Rwidth = 640
                whDatat.Rheight = Math.floor(value.height * rate)
            } else {
                rate = 640 / value.height
                whDatat.Rheight = 640
                whDatat.Rwidth = Math.floor(value.width * rate)
            }
            resolve('')
        })
    })
}
function addImage(filedir, whDatat, count) {
    return new Promise((resolve, reject) => {
        imageMagick(filedir)
            .resize(whDatat.Rwidth, whDatat.Rheight, '!')
            .autoOrient()
            .write(filedir, async (err) => {
                // 创建peoples
                const people = await peoples.create({
                    name: `face${count}`,
                    age: 20,
                    email: `email${count}`,
                    password: `password${count}`,
                    gender: count % 2 === 0 ? 0 : 1,
                    adress_id: 1,
                    types: 2,
                    is_active: 1,
                })
                // 创建users
                await users.create({
                    people_id: people.id,
                    is_verify: 1,
                    self_password: `self${count}`,
                })
                const attr = await attachment.create({
                    people_id: people.id,
                    path: filedir.substring(46),
                    width: whDatat.Rwidth,
                    height: whDatat.Rheight,
                })
                // 上传人脸模型
                const result = await faceSvc.addModel({
                    id: people.id,
                    imageId: attr.id,
                    isActived: 1,
                })
                if (result.code === 1) {
                    resolve('')
                }
                resolve('')
            })
    })
}
