
var // 每个element上绑定的一个唯一属性，递增
	guid = 1,
	// 存放所有事件handler, 以guid为key, cache[1] = {}
	// cache[1] = {handle: evnetHandle, events: {}}, events = {click: [handler1, handler2, ..]}
	cache = {},
	
	w3c = !!window.addEventListener,
	
	addListener,
	
	removeListener

// utility functions -----------------------------------------------------------------------------
function each(arr, callback) {
	for (var i=0; i<arr.length; i++) {
		if ( callback(i, arr[i]) === true ) return
	}
}

function isEmpty(obj) {
	for (var a in obj) {
		return false
	}
	return true
}

addListener = w3c ?
	function(el, type, handler) { el.addEventListener(type, handler, false) } :
	function(el, type, handler) { el.attachEvent('on' + type, handler) }
	
removeListener = w3c ?
	function(el, type, handler) { el.removeEventListener(type, handler, false) } :
	function(el, type, handler) { el.detachEvent('on' + type, handler) }
	
// private functions -----------------------------------------------------------------------------
function eventHandler(elem, e) {
	// IE低版本事件对象作为全局的event存在
	var e      = e || event
		type   = e.type,
		id     = elem.guid,
		elData = cache[id],
		events = elData.events,
		handlers = events[type]
		
	for (var i=0, handler; handler = handlers[i++];) {
		handler.call(elem, e)
	}
}

function remove(elem, type, guid) {
	var elData = cache[guid],
		handle = elData.handle,
		events = elData.events
	
	// 从缓存中删除指定类型事件相关数据
	delete events[type]
	delete elData.elem
	delete elData.handle
	
	// DOM中事件取消注册
	removeListener(elem, type, handle)
	
	// events是空对象时，从cache中删除
	if ( isEmpty(events) ) {
		delete elData.events
		delete cache[guid]
	}
}

// public functions -----------------------------------------------------------------------------
// add event handler
function bind(elem, type, handler) {
	var id     = elem.guid = elem.guid || guid++,
		elData = cache[id] = cache[id] || {},
		events = elData.events,
		handle = elData.handle
	
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
	
	// 取指定类型事件(如click)的所有handlers, 如果有则是一个数组, 第一次是undefined则初始化为空数组
	// 也仅在handlers为undefined时注册事件, 即每种类型事件仅注册一次, 再次添加handler只是push到数组handlers中
	handlers  = events[type]
	if (!handlers) {
		handlers = events[type] = []
		addListener(elem, type, handle)
	}
	
	// 添加到数组
	handlers.push(handler)
	
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
			each(handlers, function(i, item) {
				if (item === handler) {
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
function trigger(elem, type) {
	if (elem.dispatchEvent) {
		var evt = document.createEvent('Event')
		evt.initEvent(type, true, true)
		elem.dispatchEvent(evt)
	} else {
		elem.fireEvent('on'+type)
	}
}
