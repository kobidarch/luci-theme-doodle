"use strict";
"require view";
"require form";
"require uci";
"require fs";
"require ui";

return view.extend({
  load: function () {
    return Promise.all([
      uci.load("doodle"),
      L.resolveDefault(fs.list("/www/luci-static/doodle/background"), []),
    ]);
  },

  render: function (data) {
    var bgFiles = (data[1] || []).filter(function (f) {
      return (
        f.name &&
        !f.name.startsWith(".") &&
        /\.(jpe?g|png|gif|webp|mp4|webm)$/i.test(f.name)
      );
    });
    var hasBg = bgFiles.length > 0;
    var bgName = hasBg ? bgFiles[0].name : null;

    var m, s, o;

    m = new form.Map(
      "doodle",
      _("Doodle Theme"),
      _(
        "Configure the appearance of the Doodle theme. Pastel doodle style, light only. Changes take effect after saving and refreshing the page.",
      ),
    );

    /* ── General ── */
    s = m.section(form.NamedSection, "global", "global", _("General"));
    s.anonymous = true;

    o = s.option(
      form.Flag,
      "status_bar",
      _("Header status bar"),
      _(
        "Show live system stats (CPU, RAM, network, uptime) in the header. Disable to reduce resource usage on low-end devices.",
      ),
    );
    o.default = "1";
    o.rmempty = false;

    o = s.option(
      form.ListValue,
      "font_size",
      _("Base font size"),
      _(
        "Scales all text in the theme. Larger values improve readability on high-DPI displays.",
      ),
    );
    o.value("13", _("Small (13px)"));
    o.value("14", _("Normal (14px)"));
    o.value("16", _("Large (16px)"));
    o.value("18", _("Extra Large (18px)"));
    o.default = "14";

    o = s.option(
      form.Value,
      "device_name",
      _("Device name"),
      _(
        "Display name shown in the sidebar brand and on the login page. Leave empty to use the system hostname.",
      ),
    );
    o.placeholder = _("System hostname");
    o.datatype = "string";
    o.rmempty = true;

    o = s.option(
      form.ListValue,
      "speed_unit",
      _("Speed unit"),
      _(
        "Display live network throughput in bits per second or bytes per second.",
      ),
    );
    o.value("bits", _("Bits (Mbps)"));
    o.value("bytes", _("Bytes (MB/s)"));
    o.default = "bits";

    /* ── Colors ── */
    s = m.section(form.NamedSection, "global", "global", _("Accent Colors"));
    s.anonymous = true;

    o = s.option(
      form.Value,
      "primary",
      _("Primary color"),
      _("Accent color used for active elements and links."),
    );
    o.default = "#ff8fac";
    o.placeholder = "#ff8fac";
    o.datatype = "string";
    o.renderWidget = function (section_id, option_index, cfgvalue) {
      var el = form.Value.prototype.renderWidget.apply(this, arguments);
      var input = el.querySelector("input");
      if (input) {
        input.type = "color";
        input.style.height = "2.5rem";
        input.style.cursor = "pointer";
      }
      return el;
    };

    /* ── Background ── */
    s = m.section(form.NamedSection, "global", "global", _("Background"));
    s.anonymous = true;

    o = s.option(form.DummyValue, "_bg_info", _("Current background"));
    o.rawhtml = true;
    o.cfgvalue = function () {
      if (hasBg) {
        return (
          '<span style="color:var(--color-success)">' +
          _("Active") +
          ": " +
          bgName +
          "</span>"
        );
      }
      return (
        '<span style="color:var(--color-text-secondary)">' +
        _("No background set. Use the upload button below.") +
        "</span>"
      );
    };

    o = s.option(
      form.Button,
      "_bg_upload",
      _("Upload background"),
      _(
        "Choose an image (JPG, PNG, GIF, WebP) or video (MP4, WebM) from this computer. It replaces the current background immediately — no save needed.",
      ),
    );
    o.inputtitle = _("Choose file…");
    o.inputstyle = "add";
    o.onclick = function () {
      var allowed = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "webm"];
      var tmp = "/tmp/doodle-bg-upload";
      var dir = "/www/luci-static/doodle/background";
      return ui.uploadFile(tmp).then(function (reply) {
        var name = reply && reply.name ? String(reply.name) : "";
        var ext = name.toLowerCase().split(".").pop();
        if (allowed.indexOf(ext) < 0) {
          return fs.remove(tmp).then(
            function () {
              ui.addNotification(null, E("p", _("Unsupported file type. Use JPG, PNG, GIF, WebP, MP4 or WebM.")));
            },
            function () {
              ui.addNotification(null, E("p", _("Unsupported file type. Use JPG, PNG, GIF, WebP, MP4 or WebM.")));
            },
          );
        }
        var dest = dir + "/bg." + ext;
        return fs.list(dir).then(function (files) {
          var tasks = [];
          (files || []).forEach(function (f) {
            var p = dir + "/" + f.name;
            if (f.name && f.name.charAt(0) !== "." && /^bg\./.test(f.name) && p !== dest)
              tasks.push(fs.remove(p));
          });
          return Promise.all(tasks);
        }).then(function () {
          return fs.exec("/bin/mv", [tmp, dest]);
        }).then(function (res) {
          if (res && res.code !== 0)
            throw new Error(((res.stderr || _("move failed") ) + "").trim());
          ui.addNotification(null, E("p", _("Background updated to ") + name));
          window.location.reload();
        });
      }).catch(function (e) {
        if (e && /cancelled/i.test(e.message || "")) return;
        ui.addNotification(null, E("p", _("Could not install background: ") + ((e && e.message) || e)));
      });
    };

    o = s.option(form.Button, "_bg_remove", _("Remove background"), _(
      "Delete the custom background and return to the default dotted paper. Takes effect immediately.",
    ));
    o.inputtitle = _("Remove");
    o.inputstyle = "remove";
    o.onclick = function () {
      var dir = "/www/luci-static/doodle/background";
      return fs.list(dir).then(function (files) {
        var tasks = [];
        (files || []).forEach(function (f) {
          if (f.name && f.name.charAt(0) !== "." && /^bg\./.test(f.name))
            tasks.push(fs.remove(dir + "/" + f.name));
        });
        if (!tasks.length) {
          ui.addNotification(null, E("p", _("No custom background to remove.")));
          return;
        }
        return Promise.all(tasks).then(function () {
          ui.addNotification(null, E("p", _("Background removed.")));
          window.location.reload();
        });
      }).catch(function (e) {
        ui.addNotification(null, E("p", _("Could not remove background: ") + ((e && e.message) || e)));
      });
    };

    return m.render();
  },
});
