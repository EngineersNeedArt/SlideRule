// ==============================================================================================================
// SlideRule.js
// ==============================================================================================================

class SlideRule {
	
	constructor (DOMselector, magnitude, span, smallestPowerOfTen, callback, enabled) {
		this.domSelector = DOMselector;
		this.magnitude = magnitude;
		this.span = span;
		this.smallestPowerOfTen = smallestPowerOfTen;
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
		svg.setAttribute ('height', 60);
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
		svgRect.setAttribute ('height', 60);
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
			this.createScale (this.ruleGroup, start, start + this.span, 60, true, true, i === (this.magnitude - 1));
			start += this.span;
		}
		
		// Add labels.
		var labelGroup = document.createElementNS ('http://www.w3.org/2000/svg', 'g');
		labelGroup.setAttribute ("fill", "blue");
		labelGroup.setAttribute ("font-size", "18");
		labelGroup.setAttribute ("font-family", "sans-serif");
		labelGroup.setAttribute ("font-weight", "semi-bold");
		start = 0.5;
		for (i = 0; i < this.magnitude; i++) {
			this.appendLabel (labelGroup, start, 31, Math.pow (10, this.smallestPowerOfTen + i));
			start += this.span;
		}
		this.ruleGroup.append (labelGroup);
		
		// Create cursor.
		const containerRect = document.querySelector ('.slider__data').getBoundingClientRect ();
		const x = containerRect.width / 2;
		this.createCursor (svg, x + 0.5, 60);
	}
	
	createScale (group, left, right, height, onTop, onBottom, finalRule) {
		var length = 20;
		if (onTop) {
			this.appendTick (group, left, 0, length, "black");
		}
		if (onBottom) {
			this.appendTick (group, left, height - length, height, "black");
		}
		
		var i;
		for (i = 1; i < 90; i++) {
			if ((i > 40) && ((i % 2) === 1)) {
				continue;
			}
			var x = Math.round(left + Math.log10 (1 + (i / 10)) * (right - left));
			var color;
			if ((i % 10) == 0) {
				length = 20;
				color = "rgb(64,64,256)";
			} else if (i > 40) {
				length = 12;
				color = "rgb(128,128,256)";
			} else {
				length = 8;
				color = "rgb(128,128,256)";
			}
			if (onTop) {
				this.appendTick (group, x, 0, length, color);
			}
			if (onBottom) {
				this.appendTick (group, x, height - length, height, color);
			}
		}
		
		if (finalRule) {
			length = 20;
			if (onTop) {
				this.appendTick (group, right, 0, length, "black");
			}
			if (onBottom) {
				this.appendTick (group, right, height - length, height, "black");
			}
		}
	}
	
	createCursor (group, x, height) {
		this.appendTick (group, x, 0, height, "red");
	}
	
	appendTick (group, x, top, bottom, color) {
		var newLine = document.createElementNS ('http://www.w3.org/2000/svg','line');
		newLine.setAttribute ('x1', x);
		newLine.setAttribute ('y1',top);
		newLine.setAttribute ('x2', x);
		newLine.setAttribute ('y2', bottom);
		newLine.setAttribute ("stroke", color)
		group.append (newLine);
	}
	
	appendVerticalPill (group, x, top, bottom, radius, color) {
		var newPath = document.createElementNS ('http://www.w3.org/2000/svg','path');
		const controlD = Math.floor (0.55191502449351 * radius * 100) / 100;
		const controlDComplement = radius - controlD;
		const separation = (bottom - top) - (radius * 2);
		newPath.setAttribute ('d', "M " + x + " " + top + 
				"c " + controlD + " 0 " + radius + " " + controlDComplement + " " + radius + " " + radius + 
				"v " + separation + 
				"c 0 " + controlD + " " + -controlDComplement + " " + radius + " " + -radius + " " + radius + 
				"c " + -controlD + " 0 " + -radius + " " + -controlDComplement + " " + -radius + " " + -radius + 
				"v " + -separation + 
				"c 0 " + -controlD + " " + controlDComplement + " " + -radius + " " + radius + " " + -radius);
		newPath.setAttribute ("fill", color)
		group.append (newPath);
	}
	
	appendLabel (group, x, y, text) {
		var newText = document.createElementNS ('http://www.w3.org/2000/svg','text');
		newText.setAttribute ('x', x);
		newText.setAttribute ('y', y);
		newText.setAttribute ("dominant-baseline", "middle");
		newText.setAttribute ("text-anchor", "middle");
		var textNode = document.createTextNode (text);
		newText.appendChild (textNode);
		group.append (newText);
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
		return this.value * Math.pow (10, this.smallestPowerOfTen);
	}
	
	setCursorValue (val) {
		var newValue = val / Math.pow (10, this.smallestPowerOfTen);
		
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
