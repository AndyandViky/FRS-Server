*何时需要写单元测试*
1. 逻辑复杂的 
2. 容易出错的 
3. 不易理解的，即使是自己过段时间也会遗忘的，看不懂自己的代码，单元测试代码有助于理解代码的功能和需求 
4. 公共代码。比如自定义的所有http请求都会经过的拦截器；工具类等。 
5. 核心业务代码。一个产品里最核心最有业务价值的代码应该要有较高的单元测试覆盖率。