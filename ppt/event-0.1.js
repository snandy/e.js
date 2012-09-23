function bind(elem, type, handler) {
	if (elem.addEventListener) {
		elem.addEventListener(type, handler, false)
	} else {
		elem.attachEvent('on'+type, handler)
	}
}

function unbind(elem, type, handler) {
	if (elem.removeEventListener) {
		elem.removeEventListener(type, handler, false)
	} else {
		elem.detachEvent('on'+type, handler)
	}
}

function trigger(elem, type) {
	if (elem.dispatchEvent) {
		var evt = document.createEvent('Event')
		evt.initEvent(type, true, true)
		elem.dispatchEvent(evt)
	} else {
		elem.fireEvent('on'+type)
	}
}
