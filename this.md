#### 什么是this指针？

`this`就是一个对象。不同情况下 `this`指向的不同，有以下几种情况：

- 对象调用，`this` 指向该对象（谁调用 this 就指向谁）。

  ```javascript
  var obj = {
      name:'张三',
      age: '21',
      print: function(){
          console.log(this)
          console.log(this.name + ':' + this.age)
      }
  }
  
  // 通过对象的方式调用函数
  obj.print();        // this 指向 obj
  ```

- 直接调用的函数，`this`指向的是全局 `window`对象。

  ```javascript
  function print(){
  	console.log(this);
  }
  // 全局调用函数
  print();   // this 指向 window
  ```

- 通过 `new`的方式，`this`永远指向新创建的对象。

  ```javascript
  function Person(name, age){
      this.name = name;
      this.age = age;
      console.log(this);
  }
  
  var a = new Person('张三',22);  // this = > a
  ```

- 箭头函数中的`this`

  由于箭头函数中没有单独的`this`值，箭头函数的`this`与声明所在的上下文相同，也就是说调用箭头函数的时候，不会隐式调用`this`参数，而是从定义是的函数继承上下文。

  ```javascript
  const obj = {
      a:()=>{
          console.log(this);
      }
  }
  // 对象调用箭头函数
  obj.a(); // window
  ```

  

  #### 如何改变this指向？

  我们可以通过调用函数的 `call、apply、bind` 来改变 `this`的指向。

  ```javascript
  var obj = {
      name:'张三',
      age:'22',
      adress:'江苏省南京市'
  }
  
  function print(){
      console.log(this);       // 打印 this 的指向
      console.log(arguments);  // 打印传递的参数
  }
  
  // 通过 call 改变 this 指向
  print.call(obj,1,2,3);   
  
  // 通过 apply 改变 this 指向
  print.apply(obj,[1,2,3]);
  
  // 通过 bind 改变 this 的指向
  let fn = print.bind(obj,1,2,3);
  fn();
  ```

  **共同点：**

  - 三者都能改变 `this`指向，且第一个传递的参数都是 `this`指向的对象。

  - 三者都采用的后续传参的形式。

  **不同点：**

  - `call` 的传参是单个传递的（试了下数组，也是可以的），而 `apply` 后续传递的参数是**数组形式（传单个值会报错）**，而 `bind` 没有规定，传递值和数组都可以。
  - `call` 和 `apply` 函数的执行是直接执行的，而 `bind` 函数会返回一个函数，然后我们想要调用的时候才会执行。

  > 扩展：如果我们使用上边的方法改变箭头函数的 this 指针，会发生什么情况呢？能否进行改变呢？

  由于箭头函数没有自己的 `this` 指针，通过 `call()` 或 `apply()` 方法调用一个函数时，只能传递参数（不能绑定  `this`），他们的第一个参数会被忽略。

  

  

