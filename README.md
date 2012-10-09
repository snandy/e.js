# e.js

e.js解决了各浏览器的兼容性问题。如attachEvent IE6、7、8中handler上下文为window，事件对象为全局的event。
阻止事件传播方式，元素默认行为等也与标准浏览器不同，attachEvent添加多个handler时执行逆序等。修复了事件对象，使用符合w3c标准的统一的方式操作。

提供多种方式添加事件，可对事件handler的行为进行特殊控制。如仅执行一次、延迟执行、事件节流、给其传非事件对象参数、数据对象等。

## API

+ [E.bind/E.on](#常见操作)
+ [E.one](#仅执行一次)
+ [E.delay](#延迟执行)
+ [E.debounce](#阻止handler频繁调用)
+ [E.immediate](#类似debounce)
+ [E.throttle](#事件节流)
+ [E.unbind/E.un]('')
+ [E.trigger/E.fire]('')
+ [E.viewCache]('')
+ [E.destroy]('')


## 常见操作

	// 简单事件添加
	E.bind(el, 'click', function() {
		console.log('click')
	})

	// handler上下文为el
	E.bind(el, 'click', function() {
		console.log(this)
	})

	// 获取事件对象
	E.bind(el, 'click', function(e) {
		console.log(e.type)
	})

	// 获取事件源对象
	E.bind(el, 'click', function(e) {
		console.log(e.target)
	})
	
	// 阻止事件流传播
	E.bind(el, 'click', function(e) {
		e.stopPropagation()
	})
	
	// 阻止元素默认行为
	E.bind(el, 'click', function(e) {
		e.preventDefault()
	})
	

## 批量添加

	// 空格间隔一次给多个事件添加
	E.bind(el, 'mouseover mouseout', function(e) {
		console.log(e.type)
	})
	
	// 第二个参数为对象类型时可批量添加
	E.bind(el, {
		mouseover: function() {
			console.log('over')
		},
		mouseout: function() {
			console.log('out')
		}
	})
	
## 事件命名空间

	// 添加具有命名空间的事件
	E.bind(el, 'click.something', function() {
		alert('event namespace')
	})

	// 派发具有命名空间的事件
	E.trigger(el, 'click.something')

## 事件处理程序的行为

###### 仅执行一次
	E.one(el, 'click', function() {
		console.log('only once')
	})
	
###### 延迟执行
	E.delay(el, 'click', function() {
		console.log('Delay 3 seconds')
	}, 3000)

###### 阻止handler频繁调用
	// 如事件(resize, scroll, mousemove) 不足指定debounce时间时会clearTimeout上次的handler
	E.debounce(window, 'scroll', function() {
		console.log('test')
	}, 100)

###### 类似debounce
	// 不同在于handler会立刻执行(如click提交点击太快造成提交多次)
	E.immediate(el, 'click', function() {
		console.log('test')
	}, 1000)

###### 事件节流
	// 如事件(resize, scroll, mousemove) 当handler被频繁调用时如scroll，可强制指定调用间隔时间，比如100毫秒
	E.throttle(window, 'scroll', function() {
		console.log('test')
	}, 100)
	
###### 改变默认执行上下文
	E.bind(el, 'click', {
		context: document,
		handler: function() {
			console.log(this===document) // true
		}
	})
		
###### 阻止元素默认行为
	E.bind(el, 'click', {
		prevent: true,
		handler: function() {
			console.log('Prevent the default behavior')
		}
	})

###### 停止事件流传播
	E.bind(el, 'click', {
		stopBubble: true,
		handler: function() {
			console.log('Stop event bubble')
		}
	})
	
###### 停止事件流传播，阻止元素默认行为
	E.bind(el, 'click', {
		stop: true,
		handler: function() {
			console.log('All stop')
		}
	})
	
## 数据传递

	// 传参给事件处理程序
	E.bind(el, 'click', {
		args: [3, 5],
		handler: function(e, x, y) {
			console.log(x+y) // 8
		}
	})
	
	// 传数据给事件处理程序
	E.bind(el, 'click', {
		data: [3, 5],
		handler: function(e) {
			console.log(e.data)
		}
	})

