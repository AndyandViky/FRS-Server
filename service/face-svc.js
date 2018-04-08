const { faceRequest } = require('../util')
const config = require('../config')

module.exports = {
    async addModel(data) {
        const url = `${config.BE_DOMAIN}/models`
        const result = await faceRequest.post(url, data)
        return result
    },

    async checkModel(data) {
        const url = `${config.BE_DOMAIN}/check/feature`
        const result = await faceRequest.get(url, data)
        return result
    },

    async updateSecondModel(data) {
        const url = `${config.BE_DOMAIN}/secondModel`
        const result = await faceRequest.put(url, data)
        return result
    },

    async getCamera() {
        const url = `${config.BE_DOMAIN}/cameras`
        const result = await faceRequest.get(url)
        return result
    },

    async closeCameras() {
        const url = `${config.BE_DOMAIN}/close/cameras`
        const result = await faceRequest.put(url)
        return result
    },

    async closeCamera(data) {
        const url = `${config.BE_DOMAIN}/close/camera`
        const result = await faceRequest.put(url, data)
        return result
    },

    async openCamera(data) {
        const url = `${config.BE_DOMAIN}/camera`
        const result = await faceRequest.put(url, data)
        return result
    },
}
