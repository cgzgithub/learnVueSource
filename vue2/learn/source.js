// new的模拟实现
/* 1、一个继承自构造函数的的prototype的新对象被创建
   2、使用指定的参数调用构造函数，并将this绑定到新创建的对象
   3、由构造函数返回的对象就是 new 表达式的结果。如果构造函数没有显式返回一个对象，则使用步骤1创建的对象。
*/
function myNew(Fn,...args) {
    var obj = Object.create(Fn.prototype)
    var res = Fn.apply(obj,args)
    return res instanceof Object ? res : obj
}
// instanceof实现原理
/* 1、判断a的__proto__是否等于b的prototype
   2、如果步骤一不等于则继续找a.__proto__.__proto__直到null为止
*/
function myInstanceof(a,b) {
    let Con = b.prototype
    a = a.__proto__
    while(true){
        if(a === Con) {
            return true
        }
        if(a === null) {
            return false
        }
        a = a.__proto__
    }
}
// call的模拟实现
Function.prototype.myCall = function(obj){
    let context = obj || window
    let args = [...arguments].slice(1)
    context.fn = this
    let res = arguments.length > 1 ? context.fn(...args) : context.fn()
    delete context.fn
    return res
}
// apply的模拟实现
Function.prototype.myApply = function(obj){
    let context = obj || window
    context.fn = this
    let res = arguments[1] ? context.fn(...arguments[1]) : context.fn()
    delete context.fn
    return res
}
// bind的模拟实现
Function.prototype.myBind = function(obj){
    let self =  this
    let args1 = [...arguments].slice(1)
    let fNOP = function(){}
    let fBound = function(){
        let args = [...arguments].concat(args1)
        return self.apply(this instanceof fNOP ? this : obj, args)
    }
    fNOP.prototype = this.prototype
    fBound.prototype = new fNOP()
    return fBound
}
// 函数柯里化
// 柯里化是将一个多参数函数转换成多个单参数函数，也就是将一个 n 元函数转换成 n 个一元函数。
function myCurry(fn){
    let args1 = [...arguments].slice(1)
    let len = fn.length
    return function(){
        let args = [...arguments].concat(args1)
        if(args.length < len){
            return myCurry.call(this,fn,args)
        }else{
            return fn.apply(this,args)
        }
    }
}
// 偏函数
// 局部应用则是固定一个函数的一个或者多个参数，也就是将一个 n 元函数转换成一个 n - x 元函数。
function partial(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        var newArgs = args.concat([].slice.call(arguments));
        return fn.apply(this, newArgs);
    };
};
// 防抖
function debounce (fn,delay,immediate) {
    let timer = null
    return function(){
        let context = this
        let args = [...arguments]
        if(timer) {
            clearTimeout(timer)
        }
        // 第一次立即执行
        if(immediate && !timer) {
            fn.apply(context,args)
        }
        timer = setTimeout(function(){
            fn.apply(context,args)
        },delay)
    }
}
// 节流
function throttle(fn,delay) {
    // previous 是上一次执行 fn 的时间
    // timer 是定时器
    let previous = 0,
    timer = null
    return function(){
        let context = this
        let args = [...arguments]
        // 获取当前时间，转换成时间戳，单位毫秒
        let now = +new Date()
        // 判断上次触发的时间和本次触发的时间差是否小于时间间隔
        // 如果小于，则为本次触发操作设立一个新的定时器
        // 定时器时间结束后执行函数 fn 
        if(now - previous < delay) {
            if(timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(function(){
                previous = now // 更新执行 fn 的时间
                fn.apply(context,args)
            },delay)
        }else{
            // 第一次执行
            // 或者时间间隔超出了设定的时间间隔，执行函数 fn
            previous = now
            fn.apply(context.args)
        }
    }
}