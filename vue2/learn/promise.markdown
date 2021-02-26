### 手写promise
```javascript
class Promise{
    constructor(executor) {
        this.state = 'pending'
        this.value = undefined
        this.reason = undefined
        // 成功存放的数组
        this.onResolvedCallbacks = []
        // 失败存放法数组
        this.onRejectedCallbacks = [];
        // resolve函数
        let resolve = value => {
            if(this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
                // 一旦resolve执行，调用成功数组的函数
                this.onResolvedCallbacks.forEach(fn=>fn());
            }
        }
        // reject函数
        let reject = reason => {
            if (this.state === 'pending') {
              this.state = 'rejected';
              this.reason = reason;
              // 一旦reject执行，调用失败数组的函数
              this.onRejectedCallbacks.forEach(fn=>fn());
            }
        }
        try {
            executor(resolve,reject)
        } catch (err) {
            reject(err)
        }
    }
    then(onFulfilled,onRejected){
        // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        // onRejected如果不是函数，就忽略onRejected，直接扔出错误
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
        let promise2 = new Promise((resolve, reject) => {
          if (this.state === 'fulfilled') {
            // then是异步的，用setTimeout实现
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          };
          if (this.state === 'rejected') {
            // 异步
            setTimeout(() => {
              // 如果报错
              try {
                let x = onRejected(this.reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          };
          if (this.state === 'pending') {
            this.onResolvedCallbacks.push(() => {
              // 异步
              setTimeout(() => {
                try {
                  let x = onFulfilled(this.value);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0);
            });
            this.onRejectedCallbacks.push(() => {
              // 异步
              setTimeout(() => {
                try {
                  let x = onRejected(this.reason);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0)
            });
          };
        });
        // 返回promise，完成链式
        return promise2;
    }
}
// resolvePromise函数
function resolvePromise(promise2,x,resolve,reject){
    // 循环引用自身报错
    if(x == promise2) {
        // reject报错
        return reject(new TypeError('Chaining cycle detected for promise'));
    }
    // 防止多次调用
    let called
    // x不是null 且x是对象或者函数
    if(x != null && (typeof x =='object' || typeof x == 'function')){
        try{
            // A+规定，声明then = x的then方法
            let then = x.then;
            // 如果then是函数，就默认是promise了
            if(typeof then == 'function') {
                // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
                then.call(x, y => {
                    // 成功和失败只能调用一个
                    if (called) return;
                    called = true;
                    // resolve的结果依旧是promise 那就继续解析
                    resolvePromise(promise2, y, resolve, reject);
                }, err => {
                    // 成功和失败只能调用一个
                    if (called) return;
                    called = true;
                    reject(err);// 失败了就失败了
                })
            }else{
                resolve(x); // 直接成功即可
            }
        } catch (e) {
            // 也属于失败
            if (called) return;
            called = true;
            // 取then出错了那就不要在继续执行了
            reject(e); 
        }
    }else{
        resolve(x);
    }
}
```
