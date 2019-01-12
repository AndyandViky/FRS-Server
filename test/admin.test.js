const request = require('supertest')
require('should')
const app = require('../app')
const getJwt = require('./utils-test')

let token
let server
const baseUrl = '/admin'
before(async () => {
    token = await getJwt(595)
    token = `Bearer ${token}`
    server = app.listen(8000)
})
describe('test web admin', () => {
    it('#test GET /admin', async () => {
        const res = await request(server)
            .get(baseUrl)
            .set('authorization', token)
        res.body.code.should.be.eql(1)
    })
    describe('test getUsers', () => {
        const baseUrl1 = `${baseUrl}/users?pageNo=${1}&pageSize=${10}`
        it('#test GET type 2', async () => {
            const res = await request(server)
                .get(`${baseUrl1}&types=${2}`)
                .set('authorization', token)
            res.body.code.should.be.eql(1)
        })
        it('#test GET types 3', async () => {
            const res = await request(server)
                .get(`${baseUrl1}&types=${3}`)
                .set('authorization', token)
            res.body.code.should.be.eql(1)
        })
        it('#test GET types 4', async () => {
            const res = await request(server)
                .get(`${baseUrl1}&types=${4}`)
                .set('authorization', token)
            res.body.code.should.be.eql(1)
        })
        it('#test GET search', async () => {
            const search = {
                searcName: '小王',
            }
            const res = await request(server)
                .get(`${baseUrl1}&types=${1}&${search}`)
                .set('authorization', token)
            res.body.code.should.be.eql(1)
        })
    })
})
