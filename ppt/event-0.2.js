
var // 每个element上绑定的一个唯一属性，递增
	guid = 1,
	
	guidStr = '__guid__',
	
	// 存放所有事件handler, 以guid为key, cache[1] = {}
	// cache[1] = {handle: evnetHandle, events: {}}, events = {click: [handler1, handler2, ..]}
	cache = {}

// utility functions -----------------------------------------------------------------------------
function each(arr, callback) {
	for (var i=0; i<arr.length; i++) {
		if ( callback(arr[i], i) === true ) return
	}
}

function isEmpty(obj) {
	for (var a in obj) {
		return false
	}
	return true
}

// private functions -----------------------------------------------------------------------------
function eventHandler(e) {
	e = e || event
	
	var type   = e.type,
		id     = this[guidStr],
		elData = cache[id],
		events = elData.events,
		handlers = events[type]
	
	for (var i=0, handler; handler = handlers[i++];) {
		handler.call(this, e)
	}
}

function remove(elem, type, guid) {
	var elData = cache[guid],
		handle = elData.handle,
		events = elData.events
		
	delete events[type]
	
	if (elem.removeEventListener) {
		elem.removeEventListener(type, handle, false)
	} else {
		elem.detachEvent('on'+type, handle)
	}
	
	if ( isEmpty(events) ) {
		delete cache[guid]
	}
}

// public functions -----------------------------------------------------------------------------
// add event handler
function bind(elem, type, handler) {
	var id     = elem[guidStr] = elem[guidStr] || guid++,
		elData = cache[id] = cache[id] || {},
		events = elData.events,
		handle = elData.handle
	
	if (!events) {
		elData.events = events = {}
	}
	
	if (!handle) {
		elData.handle = handle = function(e) {
			eventHandler.call(handle.elem, e)
		}
	}
	
	handle.elem = elem
	handlers = events[type]
		
	if (!handlers) {
		handlers = events[type] = []
		if (elem.addEventListener) {
			elem.addEventListener(type, handle, false)
		} else {
			elem.attachEvent('on'+type, handle)
		}
	}
	
	handlers.push(handler)
	elem = null
}

// remove event handler
function unbind(elem, type, handler) {
	var id = elem[guidStr]
	
	if (!id) return
	
	var elData   = cache[id],
		events   = elData.events,
		handlers = events[type],
		length   = arguments.length
	
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
			each(handlers, function(item, i) {
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
