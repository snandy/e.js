e.js解决了各浏览器的兼容性问题。如attachEvent IE6、7、8中handler上下文为window，事件对象为全局的event。
阻止事件传播方式，元素默认行为等也与标准浏览器不同，attachEvent添加多个handler时执行逆序等。修复了事件对象，使用符合w3c标准的统一的方式操作。

提供多种方式添加事件，可对事件handler的行为进行特殊控制。如仅执行一次，延迟执行，给其传非事件对象参数，数据对象等。

## 常见操作
+ 简单事件添加
	<pre>
	E.bind(el, 'click', function() {
		console.log('click')
	})
	</pre>

+ handler上下文为el
	<pre>
	E.bind(el, 'click', function() {
		console.log(this)
	})
	</pre>

+ 获取事件对象
	<pre>
    E.bind(el, 'click', function(e) {
        console.log(e.type)
    })
   </pre>

+ 获取事件源对象
	<pre>
	E.bind(el, 'click', function(e) {
		console.log(e.target)
	})
	</pre>
	
+ 阻止事件流传播
	<pre>
	E.bind(el, 'click', function(e) {
		e.stopPropagation()
	})
	</pre>
	
+ 阻止元素默认行为
	<pre>
	E.bind(el, 'click', function(e) {
		e.preventDefault()
	})	
	</pre>
	

## 批量添加
+ 空格间隔一次给多个事件添加
	<pre>
	E.bind(el, 'mouseover mouseout', function(e) {
		console.log(e.type)
	})
	</pre>
	
+ 第二个参数为对象类型时可批量添加事件
	<pre>
	E.bind(el, {
		mouseover: function() {
			console.log('over')
		},
		mouseout: function() {
			console.log('out')
		}
	})
	</pre>
	

## 事件处理程序的行为
+ 仅执行一次
	<pre>
	E.bind(el, 'click', {
		once: true,
		handler: function() {
			console.log('only once')
		}
	})
	</pre>
	
+ 延迟执行
	<pre>
	E.bind(el, 'click', {
		delay: 3000,
		handler: function() {
			console.log('Delay 3 seconds')
		}
	})
	</pre>
	
+ 改变默认执行上下文
	<pre>
	E.bind(el, 'click', {
		scope: document,
		handler: function() {
			console.log(this===document) // true
		}
	})
	</pre>
	
+ 停止事件流传播
	<pre>
	E.bind(el, 'click', {
		stopBubble: true,
		handler: function() {
			console.log('Stop event bubble')
		}
	})
	</pre>

+ 阻止频繁调用(resize, scroll)


+ 阻止元素默认行为
	<pre>
	E.bind(el, 'click', {
		prevent: true,
		handler: function() {
			console.log('Prevent the default behavior')
		}
	})
	</pre>

+ 停止事件流传播，阻止元素默认行为
	<pre>
	E.bind(el, 'click', {
		stop: true,
		handler: function() {
			console.log('Delay 3 seconds')
		}
	})
	</pre>
	
## 数据传递
+ 传参给事件处理程序
	<pre>
	E.bind(el, 'click', {
		args: [3, 5],
		handler: function(e, x, y) {
			console.log(x+y) // 8
		}
	})
	</pre>
	
+ 传数据给事件处理程序
	<pre>
	E.bind(el, 'click', {
		data: [3, 5],
		handler: function(e) {
			console.log(e.data)
		}
	})
	</pre>

