const request = require('supertest')
require('should')
const app = require('../app')
const getJwt = require('./utils-test')

let token
let server
before(async () => {
    token = await getJwt(595)
    token = `Bearer ${token}`
    server = app.listen(8000)
})
describe('test web admin', () => {
    it('#test GET /admin', async () => {
        const res = await request(server)
            .get('/admin')
            .set('authorization', token)
        res.body.code.should.be.eql(1)
    })
})
