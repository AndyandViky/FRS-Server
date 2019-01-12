const admins = require('../ctrl/admin')

test('adds 1 + 2 to equal 3', () => {
    // expect.assertions(1) // 它能确保在异步的测试用例中，有一个断言会在回调函数中被执行
    expect(1 + 2).toBe(3)
})
