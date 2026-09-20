'use strict';
'require view';
'require form';
'require uci';
'require fs';

return view.extend({
	load: function () {
		return Promise.all([
			uci.load('doodle'),
			L.resolveDefault(fs.list('/www/luci-static/doodle/background'), [])
		]);
	},

	render: function (data) {
		var bgFiles = (data[1] || []).filter(function(f) {
			return f.name && !f.name.startsWith('.') && /\.(jpe?g|png|gif|webp|mp4|webm)$/i.test(f.name);
		});
		var hasBg = bgFiles.length > 0;
		var bgName = hasBg ? bgFiles[0].name : null;

		var m, s, o;

		m = new form.Map('doodle', _('Doodle Theme'),
			_('Configure the appearance of the Doodle theme. Pastel doodle style, light only. Changes take effect after saving and refreshing the page.'));

		/* ── General ── */
		s = m.section(form.NamedSection, 'global', 'global', _('General'));
		s.anonymous = true;

		o = s.option(form.Flag, 'status_bar', _('Header status bar'),
			_('Show live system stats (CPU, RAM, network, uptime) in the header. Disable to reduce resource usage on low-end devices.'));
		o.default = '1';
		o.rmempty = false;

		o = s.option(form.ListValue, 'font_size', _('Base font size'),
			_('Scales all text in the theme. Larger values improve readability on high-DPI displays.'));
		o.value('13', _('Small (13px)'));
		o.value('14', _('Normal (14px)'));
		o.value('16', _('Large (16px)'));
		o.value('18', _('Extra Large (18px)'));
		o.default = '14';

		/* ── Colors ── */
		s = m.section(form.NamedSection, 'global', 'global', _('Accent Colors'));
		s.anonymous = true;

		o = s.option(form.Value, 'primary', _('Primary color'),
			_('Accent color used for active elements and links.'));
		o.default = '#ff8fac';
		o.placeholder = '#ff8fac';
		o.datatype = 'string';
		o.renderWidget = function(section_id, option_index, cfgvalue) {
			var el = form.Value.prototype.renderWidget.apply(this, arguments);
			var input = el.querySelector('input');
			if (input) {
				input.type = 'color';
				input.style.height = '2.5rem';
				input.style.cursor = 'pointer';
			}
			return el;
		};

		/* ── Background ── */
		s = m.section(form.NamedSection, 'global', 'global', _('Background'));
		s.anonymous = true;

		o = s.option(form.DummyValue, '_bg_info', _('Current background'));
		o.rawhtml = true;
		o.cfgvalue = function () {
			if (hasBg) {
				return '<span style="color:var(--color-success)">' +
					_('Active') + ': ' + bgName + '</span>';
			}
			return '<span style="color:var(--color-text-secondary)">' +
				_('No background set. Upload an image or video named "bg" (e.g. bg.jpg, bg.png, bg.mp4) to /www/luci-static/doodle/background/ via SCP.') +
				'</span>';
		};

		return m.render();
	}
});
