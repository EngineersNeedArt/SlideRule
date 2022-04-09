// ==============================================================================================================
// SlideRule.js
// ==============================================================================================================

class SlideRule {
	
	constructor (DOMselector, magnitude, span, multiplier, callback, enabled) {
		this.domSelector = DOMselector;
		this.magnitude = magnitude;
		this.span = span;
		this.multiplier = multiplier;
		this.callback = callback;
		this.enabled = enabled;
		this.container = document.querySelector (DOMselector);
		this.ruleGroup = null;
		this.mouseDown = false;
		this.startX = 0;
		this.xOffset = 0;
		this.value = 1;
		this.draw ();
	}
	
	draw () {
		// SVG container.
		const svgContainer = document.createElement ('div');
		svgContainer.classList.add ('slider__data');
		const svg = document.createElementNS ('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute ('height', 80);
		svg.setAttribute ('width', (this.span * this.magnitude) + 1);
		svg.setAttribute ('display', 'block');
		svgContainer.appendChild (svg);
		this.container.appendChild (svgContainer);
		
		// Create rule.
		this.createRule (svg);
		
		// Event listeners.
		svgContainer.addEventListener ('mousedown', this.mouseTouchStart.bind (this), false);
		svgContainer.addEventListener ('touchstart', this.mouseTouchStart.bind (this), false);
		svgContainer.addEventListener ('mousemove', this.mouseTouchMove.bind (this), false);
		svgContainer.addEventListener ('touchmove', this.mouseTouchMove.bind (this), false);
		window.addEventListener ('mouseup', this.mouseTouchEnd.bind (this), false);
		window.addEventListener ('touchend', this.mouseTouchEnd.bind (this), false);
	}
	
	createRule (svg) {
		// Create a parent group to hold scale, cursor.
		this.ruleGroup = document.createElementNS ('http://www.w3.org/2000/svg', 'g');
		this.ruleGroup.setAttribute ('transform', 'translate(0 0)');
		svg.appendChild (this.ruleGroup);
		
		var svgRect = document.createElementNS ('http://www.w3.org/2000/svg', 'rect');
		svgRect.setAttribute ('x', 0);
		svgRect.setAttribute ('y', 0);
		svgRect.setAttribute ('width', (this.span * this.magnitude) + 1);
		svgRect.setAttribute ('height', 80);
		if (this.enabled) {
			svgRect.setAttribute ('fill', 'white');
		} else {
			svgRect.setAttribute ('fill', '#FFFFBB')
		}
		this.ruleGroup.appendChild (svgRect);
		
		// Create scale.
		var start = 0.5;
		var i;
		for (i = 0; i < this.magnitude; i++) {
			this.createScale (this.ruleGroup, start, start + this.span, 80);
			start += this.span;
		}
		
		// Create cursor.
		const containerRect = document.querySelector ('.slider__data').getBoundingClientRect ();
		const x = containerRect.width / 2;
		this.createCursor (svg, x + 0.5, 80);
	}
	
	createScale (group, left, right, height) {
		this.appendTick (group, left, 10, height - 10, "black");
		
		var i;
		for (i = 1; i < 90; i++) {
			if ((i > 40) && ((i % 2) === 1)) {
				continue;
			}
			var x = Math.round(left + Math.log10 (1 + (i / 10)) * (right - left));
			var top, bottom;
			var color;
			if ((i % 10) == 0) {
				top = 10;
				bottom = height - 10;
				color = "rgb(64,64,256)";
			} else if (i > 40) {
				top = 25;
				bottom = height - 25;
				color = "rgb(128,128,256)";
			} else {
				top = 30;
				bottom = height - 30;
				color = "rgb(128,128,256)";
			}
			this.appendTick (group, x, top, bottom, color);
		}
	
		this.appendTick (group, right, 10, height - 10, "black");
	}
	
	createCursor (group, x, height) {
		this.appendTick (group, x, 0, height, "red");
	}
	
	appendTick (group, x, top, bottom, color) {
		var newLine = document.createElementNS ('http://www.w3.org/2000/svg','line');
		newLine.setAttribute ('id','line2');
		newLine.setAttribute ('x1', x);
		newLine.setAttribute ('y1',top);
		newLine.setAttribute ('x2', x);
		newLine.setAttribute ('y2', bottom);
		newLine.setAttribute ("stroke", color)
		group.append (newLine);
	}
	
	getRelativeMouseCoordinates (e) {
		const containerRect = document.querySelector ('.slider__data').getBoundingClientRect ();
		const x = e.clientX - containerRect.left;
		const y = e.clientY - containerRect.top;
		return { x, y };
	}
	
	validOffset (offset) {
		const containerRect = document.querySelector ('.slider__data').getBoundingClientRect ();
		const center = containerRect.width / 2;
		if (offset > center) {
			return center;
		} else if (offset < (center - (this.span * this.magnitude))) {
			return center - (this.span * this.magnitude);
		}
		
		return offset
	}
	
	mouseTouchStart (e) {
		if ((this.mouseDown) || (this.enabled === false)) {
			return;
		}
		const containerRect = document.querySelector ('.slider__data').getBoundingClientRect ();
		this.center = containerRect.width / 2;
		this.mouseDown = true;
		this.startX = e.clientX;
		this.startValue = this.value;
		this.callback (this.value);
	}
	
	mouseTouchMove (e) {
		if ((!this.mouseDown) || (this.enabled === false)) {
			return;
		}
		
		e.preventDefault ();
		
		var valueDelta = e.clientX - this.startX;
		var offset = this.center - Math.round (Math.log10 (this.startValue) * this.span) + valueDelta;
		offset = this.validOffset (offset);
		var translateString = 'translate(' + offset + ' 0)';
		this.ruleGroup.setAttribute ('transform', translateString);
		this.value = Math.pow (10, (this.center - offset) / this.span);
		this.callback (this.value);
	}
	
	mouseTouchEnd (e) {
		if ((!this.mouseDown) || (this.enabled === false)) {
			return;
		}
		// const relativeMouse = this.getRelativeMouseCoordinates (e);
		// this.xOffset = this.validOffset (this.xOffset + (relativeMouse.x - this.startX));
		this.mouseDown = false;
		// this.callback (this.cursorValue ());
	}
	
	cursorValue () {
		return this.value * this.multiplier;
	}
	
	setCursorValue (val) {
		var newValue = val / this.multiplier;
		
		if ((newValue > 0)  && (Math.log10 (newValue) <= this.magnitude)) {
			const containerRect = document.querySelector ('.slider__data').getBoundingClientRect ();
			const center = containerRect.width / 2;
			var offset = center - Math.round (Math.log10 (newValue) * this.span);
			this.xOffset = offset;
			var translateString = 'translate(' + offset + ' 0)';
			this.ruleGroup.setAttribute ('transform', translateString);
			this.value = newValue;
		}
	}
}
