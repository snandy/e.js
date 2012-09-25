/**
 * @snandy
 * 
 * 功能点：
 * 1, 统一elem作为事件handler执行上下文（attachEvent this是window）
 * 2, 统一事件对象作为handler第一个参数传入（attachEvent作为全局对象event）
 * 3, 统一多个handler执行顺序（attachEvent逆序）
 * 4, 解决事件对象兼容性（与W3C统一）
 * 5, handler执行模式配置: once/delay/debounce/throttle/context/stop/prevent/stopBubble
 * 6, handler传额外参数（非事件对象）
 * 7, 事件对象加data属性
 * 8, type支持以空格添加多个事件，如'mouseover mouseout'
 * 9, 第二个参数type为对象类型时批量添加
 * 10, handler执行模式once、delay等实现方式更改
 * 11, viewCache查看guid, cache. 可查看内部细节如guid表示添加事件的元素个数
 * 
 * 
 * 
 * 重构点：
 * 1, 勿重复检测浏览器
 * 2, 代码尽量不出现横向滚动条
 * 3, 接口bind, unbind, trigger各加别名on, un, fire
 * 4, AMD的支持
 * 
 */

~function(window, document) {
	
// variables -------------------------------------------------------------------------------------
var // 每个element上绑定的一个唯一属性，递增
	guid = 1,
	// 存放所有事件handler, 以guid为key, cache[1] = {}
	// cache[1] = {handle: evnetHandle, events: {}}, events = {click: [handler1, handler2, ..]}
	cache = {},
	// 优先使用标准API
	w3c = !!window.addEventListener,
	
	trigger, util,	toString = Object.prototype.toString

// utility functions -----------------------------------------------------------------------------
util = {
	each: function(arr, callback) {
		for (var i=0; i<arr.length; i++) {
			if ( callback(i, arr[i]) === true ) return
		}
	},
	isEmpty: function(obj) {
		for (var a in obj) {
			return false
		}
		return true
	},
	isFunction: function(obj) {
		return toString.call(obj) == '[object Function]'
	},
	isObject: function(obj) {
		return obj === Object(obj)
	},
	once: function(func) {
		var run, memo
		return function() {
			if (run) return memo
			run = true
			return memo = func.apply(this, arguments)
		}
	},
	delay: function(func, wait) {
		return function() {
			var context = this, args = arguments
			setTimeout(function() {
				func.apply(context, args)
			}, wait)
		}
	},
	debounce: function(func, wait, immediate) {
		var timeout
		return function() {
			var context = this, args = arguments
			later = function() {
				timeout = null
				if (!immediate) func.apply(context, args)
			}
			var callNow = immediate && !timeout
			clearTimeout(timeout)
			timeout = setTimeout(later, wait)
			if (callNow) func.apply(context, args)
		}
	},
	throttle: function(func, wait) {
		var context, args, timeout, throttling, more, result
		var whenDone = util.debounce(function(){ more = throttling = false }, wait)
		return function() {
			context = this, args = arguments
			var later = function() {
				timeout = null
				if (more) {
					func.apply(context, args)
				}
				whenDone()
			}
			if (!timeout) {
				timeout = setTimeout(later, wait)
			}
			if (throttling) {
				more = true
			} else {
				result = func.apply(context, args)
			}
			whenDone()
			throttling = true
			return result
		}
	},
	addListener: function() {
		if (w3c) {
			return function(el, type, handler) { el.addEventListener(type, handler, false) } 
		} else {
			return function(el, type, handler) { el.attachEvent('on' + type, handler) }
		}
	}(),
	removeListener: function() {
		if (w3c) {
			return function(el, type, handler) { el.removeEventListener(type, handler, false) }
		} else {
			return function(el, type, handler) { el.detachEvent('on' + type, handler) }
		}
	}()
}

// private functions ---------------------------------------------------------------------------
function returnFalse() {
	return false
}
function returnTrue() {
	return true
}
function now() {
	return (new Date).getTime()
}
function eventHandler(elem, e) {
	var e      = fix(e || event),
		type   = e.type,
		id     = elem.guid,
		elData = cache[id],
		events = elData.events,
		handlers = events[type]
		
	for (var i=0, handlerObj; handlerObj = handlers[i++];) {
		callback(elem, type, e, handlerObj)
	}
}
function callback(elem, type, e, handlerObj) {
	var args      = handlerObj.args,
		stop      = handlerObj.stop,
		data      = handlerObj.data,
		handler   = handlerObj.handler,
		prevent   = handlerObj.prevent,
		context   = handlerObj.context || elem,
		stopBubble = handlerObj.stopBubble
	
	// 如果数组第一个元素不是事件对象，将事件对象插入到数组第一个位置; 如果是则用新的事件对象替换
	if (args[0] && args[0].type === e.type) {
		args.shift()
		args.unshift(e)
	} else {
		args.unshift(e)
	}
	
	if (stop) {
		e.preventDefault()
		e.stopPropagation()
	}
	
	if (prevent) {
		e.preventDefault()
	}
	
	if (data) {
		e.data = data
	}
	
	if (stopBubble) {
		e.stopPropagation()
	}
	
	handler.apply(context, args)
}
// handlerObj class
function Handler(config) {
	this.handler   = config.handler
	this.once      = config.once
	this.delay     = config.delay
	this.debounce  = config.debounce
	this.immediate = config.immediate
	this.throttle  = config.throttle
	this.context   = config.context
	this.stop      = config.stop
	this.prevent   = config.prevent
	this.stopBubble = config.stopBubble
	this.args       = config.args || []
	this.data       = config.data
}
// 删除事件的注册，从缓存中去除
function remove(elem, type, guid) {
	var elData = cache[guid],
		handle = elData.handle,
		events = elData.events
	
	// 从缓存中删除指定类型事件相关数据
	delete events[type]
	delete elData.elem
	delete elData.handle
	
	// DOM中事件取消注册
	util.removeListener(elem, type, handle)
	// events是空对象时，从cache中删除
	if ( util.isEmpty(events) ) {
		delete elData.events
		delete cache[guid]
	}
}
// custom event class
function Event(event) {
	this.originalEvent = event
	this.type          = event.type
	this.timeStamp     = now()
}
Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue
		var e = this.originalEvent
		if (e.preventDefault) {
			e.preventDefault()
		}
		e.returnValue = false
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue
		var e = this.originalEvent
		if (e.stopPropagation) {
			e.stopPropagation()
		}
		e.cancelBubble = true
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue
		this.stopPropagation()
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};
// fix evnet object
function fix(e) {
	var i, prop, props = [], originalEvent = e
	
	props = props.concat('altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey'.split(' '))
	props = props.concat('currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey'.split(' '))
	props = props.concat('newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget'.split(' '))
	props = props.concat('screenX screenY shiftKey srcElement target toElement view wheelDelta which'.split(' '))
	
	e = new Event(originalEvent)
	for (i=props.length; i;) {
		prop = props[--i]
		e[prop] = originalEvent[prop]
	}
	
	if (!e.target) {
		e.target = e.srcElement || document
	}
	if (e.target.nodeType === 3) {
		e.target = e.target.parentNode
	}
	if (!e.relatedTarget && e.fromElement) {
		e.relatedTarget = e.fromElement === e.target ? e.toElement : e.fromElement
	}
	if (e.pageX == null && e.clientX != null) {
		var doc = document.documentElement, body = document.body
		e.pageX = e.clientX + 
			(doc && doc.scrollLeft || body && body.scrollLeft || 0) - 
			(doc && doc.clientLeft || body && body.clientLeft || 0)
		e.pageY = e.clientY + 
			(doc && doc.scrollTop  || body && body.scrollTop  || 0) - 
			(doc && doc.clientTop  || body && body.clientTop  || 0)
	}
	if (!e.which && ((e.charCode || e.charCode === 0) ? e.charCode : e.keyCode)) {
		e.which = e.charCode || e.keyCode
	}
	if (!e.metaKey && e.ctrlKey) {
		e.metaKey = e.ctrlKey
	}
	if (!e.which && e.button !== undefined) {
		e.which = (e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ))
	}
	
	return e
}

// public functions -----------------------------------------------------------------------------
// add event handler
function bind(elem, type, handler) {
	var id     = elem.guid = elem.guid || guid++,
		elData = cache[id] = cache[id] || {},
		events = elData.events,
		handle = elData.handle,
		handlerObj, eventType, i=0, arrType
	
	// 批量添加, 递归
	if ( util.isObject(type) ) {
		for (eventType in type) {
			bind(elem, eventType, type[eventType])
		}
		return
	} else {
		arrType = type.split(' ')
	}
	
	// handle parameter handler
	if ( util.isFunction(handler) ) {
		handlerObj = new Handler({handler: handler})
	} else {
		if ( !util.isFunction(handler.handler) ) return
		handlerObj = new Handler(handler)
	}
	
	handler = handlerObj.handler
	
	// once 仅执行一次
	if (handlerObj.once) {
		handlerObj.handler = util.once(handler)
	}
	
	// delay延迟执行
	if (handlerObj.delay) {
		handlerObj.handler = util.delay(handler, handlerObj.delay)
	}
	
	// debounce防弹跳
	if (handlerObj.debounce) {
		handlerObj.handler = util.debounce(handler, handlerObj.debounce)
	}
	
	// immediate 执行后立即延迟指定时间，如避免重复提交
	if (handlerObj.immediate) {
		handlerObj.handler = util.debounce(handler, handlerObj.immediate, true)
	}
	
	// throttle 事件节流
	if (handlerObj.throttle) {
		handlerObj.handler = util.throttle(handler, handlerObj.throttle)
	}
	
	// 初始化events
	if (!events) {
		elData.events = events = {}
	}
	
	// 初始化handle
	if (!handle) {
		elData.handle = handle = function(e) {
			eventHandler(elData.elem, e)
		}
	}
	
	// elem暂存到handle
	elData.elem = elem
	
	while ( eventType=arrType[i++] ) {
		// 取指定类型事件(如click)的所有handlers, 如果有则是一个数组, 第一次是undefined则初始化为空数组
		// 也仅在handlers为undefined时注册事件, 即每种类型事件仅注册一次, 再次添加handler只是push到数组handlers中
		handlers  = events[eventType]
		if (!handlers) {
			handlers = events[eventType] = []
			util.addListener(elem, eventType, handle)
		}
		// 添加到数组
		handlers.push(handlerObj)
	}
	
	// 避免IE低版本内存泄露
	elem = null
}

// remove event handler
function unbind(elem, type, handler) {
	var id       = elem.guid,
		elData   = id && cache[id],
		events   = elData && elData.events,
		handlers = events && events[type],
		length   = arguments.length
	
	if (!id || !elData || !events) return
	
	switch (length) {
		case 1 :
			for (var type in events) {
				remove(elem, type, id)
			}
			break
		case 2 :
			remove(elem, type, id)
			break
		case 3 :
			util.each(handlers, function(i, handlerObj) {
				if (handlerObj.handler === handler) {
					handlers.splice(i, 1)
					return true
				}
			})
			if (handlers.length === 0) {
				remove(elem, type, id)
			}
			break
	}
}

// fire event
trigger = w3c ?
	function(el, type) {
		try {
			var event = document.createEvent('Event')
			event.initEvent(type,true,true)
			el.dispatchEvent(event)
		}catch(e){}
	} :
	function(el, type) {
		try {
			el.fireEvent('on'+type)
		}catch(e){}
	}

var E = {
	on: bind,
	bind: bind,
	un: unbind,
	unbind: unbind,
	fire: trigger,
	trigger: trigger,
	viewCache: function() {
		if (window.console) {
			console.log('guid: ' + guid)
			console.log(cache)
		}
	},
	destroy: function() {
		for (var num in cache) {
			var elData = cache[num], elem = elData.elem
			unbind(elem)
		}
		guid = 1
	}
}
	
if (typeof define === 'function' && define.amd) {
	define('E', [], function () { return E } )
} else {
	window.E = E
}

}(this, this.document);