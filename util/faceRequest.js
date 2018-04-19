const request = require('request')

module.exports = {
    async post(url, data = {}) {
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'POST',
                json: true,
                headers: {
                    'content-type': 'application/json',
                    Authorization: '123',
                },
                body: data,
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body)
                } else reject(body)
            })
        })
    },

    async get(url, data = {}) {
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'GET',
                json: true,
                headers: {
                    'content-type': 'application/json',
                    Authorization: '123',
                },
                body: data,
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body)
                } else reject(body)
            })
        })
    },

    async put(url, data = {}) {
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'PUT',
                json: true,
                headers: {
                    'content-type': 'application/json',
                    Authorization: '123',
                },
                body: data,
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body)
                } else reject(body)
            })
        })
    },

    async delete(url, data = {}) {
        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'DELETE',
                json: true,
                headers: {
                    'content-type': 'application/json',
                    Authorization: '123',
                },
                body: data,
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body)
                } else reject(body)
            })
        })
    },
}
