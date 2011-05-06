/*
---
script: Kubrick.js
description: A simple color picker

authors:
  - Chi Wai Lau (http://tabqwerty.com)
  - Steven Wittens (http://acko.net)

license:
  - MIT-style license

requires:
  core/1.2.4:   '*'

provides:
  - Kubrick
...
*/

var Kubrick = new Class({
	
	Implements: [Events, Options],
	
	options: {
		autohide: true,
		color: '#fff'
	},
	
	initialize: function(element, options) {
		this.element = document.id(element);
		this.setOptions(options);
		this.setup();

		this.setColor(this.options.color);
		this.updateDisplay();
	},
	
	setup: function() {
		/*
		<div class="kubrick">
			<div class="color"></div>
			<div class="wheel"></div>
			<div class="overlay"></div>
			<div class="h-marker marker"></div>
			<div class="sl-marker marker"></div>
		</div>
		*/
		
		this.radius = 84;
		this.square = 100;
		this.width = 194;
		this.halfWidth = this.width/2;
		
		this.colour = new Element('div', {
			'class': 'color'
		});
		
		this.wheel = new Element('div', {
			'class': 'wheel'
		}).addEvent('mousedown', this.wheelStart.bind(this));
		
		this.overlay = new Element('div', {
			'class': 'overlay'
		}).addEvent('mousedown', this.overlayStart.bind(this));
		
		this.colourCursor = new Element('div', {
			'class': 'h-marker marker'
		});
		
		this.wheelCursor = new Element('div', {
			'class': 'sl-marker marker'
		});
		
		this.colourPicker = new Element('div', {
			'class': 'kubrick'
		}).adopt(this.colour, this.wheel, this.overlay, this.colourCursor, this.wheelCursor);
		
		this.element.addEvent('keyup', this.keyup.bind(this));
		document.body.addEvent('mouseup', this.mouseup.bind(this));
		
		if (this.options.autohide) {
			this.element.addEvent('focus', this.show.bind(this));
			document.body.addEvent('mousedown', this.hide.bind(this));
		} else {
			this.show();
		}
	},
	
	show: function(e) {
		this.colourPicker.inject(this.element, 'after');
	},
	
	hide: function(e) {
		var target = e.target;
		if (target != this.element && target != this.colourPicker && !this.colourPicker.contains(target))
			this.colourPicker.dispose();
	},
	
	wheelStart: function(e) {
		this.wheelPosition = this.wheel.getPosition();
		this.wheel.addEvent('mousemove', this.wheelMove.bind(this));
		this.wheelMove(e);
	},
	
	wheelMove: function(e) {
		var x = e.page.x-this.wheelPosition.x-this.halfWidth;
		var y = e.page.y-this.wheelPosition.y-this.halfWidth;
		var hue = Math.atan2(x, -y)/6.28;
		if (hue < 0) hue += 1;
		this.setHSL([hue, this.hsl[1], this.hsl[2]]);
	},
	
	overlayStart: function(e) {
		this.overlayPosition = this.overlay.getPosition();
		this.overlay.addEvent('mousemove', this.overlayMove.bind(this));
		this.overlayMove(e);
	},
	
	overlayMove: function(e) {
		var x = e.page.x-this.overlayPosition.x;
		var y = e.page.y-this.overlayPosition.y;
		var sat = 1 - x/this.square;
		var lum = 1 - y/this.square;
		this.setHSL([this.hsl[0], sat, lum]);
	},
	
	mouseup: function(e) {
		this.wheel.removeEvents('mousemove', 'mouseup');
		this.overlay.removeEvents('mousemove', 'mouseup');
	},
	
	keyup: function(e) {
		this.setColor(e.target.value);
	},
	
	updateDisplay: function() {
		var angle = this.hsl[0] * 6.28;
		this.colourCursor.setStyles({
			left: Math.round(Math.sin(angle) * this.radius + this.width / 2),
			top: Math.round(-Math.cos(angle) * this.radius + this.width / 2)
		});
		
		this.wheelCursor.setStyles({
			left: Math.round(this.square * (0.5 - this.hsl[1]) + this.width / 2),
			top: Math.round(this.square * (0.5 - this.hsl[2]) + this.width / 2)
		});
		
		this.colour.setStyle('background-color', this.pack(this.HSLToRGB([this.hsl[0], 1, 0.5])));
		
		this.element.setStyles({
			'background-color': this.color,
			'color': this.hsl[2] > 0.5 ? '#000' : '#fff'
		});

		this.element.set('value', this.color);
		
		this.fireEvent('colorChange', this.color);
	},
	
	pack: function(rgb) {
		var r = Math.round(rgb[0] * 255);
		var g = Math.round(rgb[1] * 255);
		var b = Math.round(rgb[2] * 255);
		return '#' +
						(r < 16 ? '0' : '') + r.toString(16) +
						(g < 16 ? '0' : '') + g.toString(16) +
						(b < 16 ? '0' : '') + b.toString(16);
	},
	
	unpack: function(color) {
		if (color.length == 7) {
			return [parseInt('0x' + color.substring(1, 3), 16) / 255,
							parseInt('0x' + color.substring(3, 5), 16) / 255,
							parseInt('0x' + color.substring(5, 7), 16) / 255];
		}
		else if (color.length == 4) {
			return [parseInt('0x' + color.substring(1, 2), 16) / 15,
							parseInt('0x' + color.substring(2, 3), 16) / 15,
							parseInt('0x' + color.substring(3, 4), 16) / 15];
		}
	},

	RGBToHSL: function(rgb) {
		var min, max, delta, h, s, l;
		var r = rgb[0], g = rgb[1], b = rgb[2];
		min = Math.min(r, g, b);
		max = Math.max(r, g, b);
		delta = max - min;
		l = (min + max) / 2;
		s = 0;
		if (l > 0 && l < 1) {
			s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
		}
		h = 0;
		if (delta > 0) {
			if (max == r && max != g) h += (g - b) / delta;
			if (max == g && max != b) h += (2 + (b - r) / delta);
			if (max == b && max != r) h += (4 + (r - g) / delta);
			h /= 6;
		}
		return [h, s, l];
	},

	HSLToRGB: function(hsl) {
		var m1, m2, r, g, b;
		var h = hsl[0], s = hsl[1], l = hsl[2];
		m2 = (l <= 0.5) ? l * (s + 1) : l + s - l*s;
		m1 = l * 2 - m2;
		return [this.HueToGRB(m1, m2, h+0.33333),
						this.HueToGRB(m1, m2, h),
						this.HueToGRB(m1, m2, h-0.33333)];
	},
	
	HueToGRB: function (m1, m2, h) {
		h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
		if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
		if (h * 2 < 1) return m2;
		if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
		return m1;
	},
	
	setHSL: function(hsl) {
		this.hsl = hsl;
		this.rgb = this.HSLToRGB(hsl);
		this.color = this.pack(this.rgb);
		this.updateDisplay();
		return this;
	},
	
	setColor: function(color) {
		if (!color) color = this.options.color;
		var unpack = this.unpack(color);
		if (this.color != color && unpack) {
			this.color = color;
			this.rgb = unpack;
			this.hsl = this.RGBToHSL(this.rgb);
			this.updateDisplay();
		}
		return this;
	}
});