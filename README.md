e.js解决了各浏览器的兼容性问题。如attachEvent IE6、7、8中handler上下文为window，事件对象为全局的event。
阻止事件传播方式，元素默认行为等也与标准浏览器不同，attachEvent添加多个handler时执行逆序等。修复了事件对象，使用符合w3c标准的统一的方式操作。

提供多种方式添加事件，可对事件handler的行为进行特殊控制。如仅执行一次、延迟执行、事件节流、给其传非事件对象参数、数据对象等。

## API
### 添加事件E.bind, 别名E.on
	<pre>
	E.bind(elem, type, handler)
	</pre>
	
### 删除事件E.unbind, 别名E.un
	<pre>
	E.unbind(elem, type, handler)
	</pre>

### 派发事件E.trigger, 别名E.fire
	<pre>
	E.trigger(elem, type)
	</pre>

### 打印guid, cache. 可查看内部细节如guid表示添加事件的元素个数
	<pre>
	E.viewCache()
	</pre>
	
### 销毁所有的事件handler, 如在页面unload时. (谨慎操作)
	<pre>
	E.destroy()
	</pre>	


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
	
+ 第二个参数为对象类型时可批量添加
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
	
## 事件命名空间
+ 添加具有命名空间的事件
	<pre>
	E.bind(el, 'click.something', function() {
		alert('event namespace')
	})
	</pre>

+ 派发具有命名空间的事件
	<pre>
	E.trigger(el, 'click.something')
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

+ 阻止handler频繁调用(resize, scroll, mousemove) 不足指定debounce时间时会clearTimeout上次的handler
	<pre>
	E.bind(window, 'scroll', {
		debounce: 100,
		handler: function() {
			console.log('test')
		}
	})
	</pre>

+ 与上面类似, 不同在于handler会立刻执行(如click提交点击太快造成提交多次)
	<pre>
	E.bind(window, 'scroll', {
		immediate: 1000,
		handler: function() {
			console.log('test')
		}
	})
	</pre>

+ 事件节流(resize, scroll, mousemove) 当handler被频繁调用时如scroll，可强制指定调用间隔时间，比如100毫秒
	<pre>
	E.bind(window, 'scroll', {
		throttle: 100,
		handler: function() {
			console.log('test')
		}
	})
	</pre>
	
+ 改变默认执行上下文
	<pre>
	E.bind(el, 'click', {
		context: document,
		handler: function() {
			console.log(this===document) // true
		}
	})
	</pre>
		
+ 阻止元素默认行为
	<pre>
	E.bind(el, 'click', {
		prevent: true,
		handler: function() {
			console.log('Prevent the default behavior')
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
	
+ 停止事件流传播，阻止元素默认行为
	<pre>
	E.bind(el, 'click', {
		stop: true,
		handler: function() {
			console.log('All stop')
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

