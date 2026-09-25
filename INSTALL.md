# Installation Guide — luci-theme-doodle

Five ways to install, from easiest to most hands-on. Pick one.

> **Requirements:** OpenWrt **23.05 or newer**, about 200 KB free space
> on the router, and LuCI already installed. Older OpenWrt releases
> cannot use this theme (it needs the ucode template engine).

---

## Method 1 — Package feed (auto-update, recommended once published)

> ⚠️ This only works after the package feed is published to GitHub
> Pages. Until then, use Method 2 or 4.

**OpenWrt 24.10 and earlier (opkg):**

```sh
# One-time: trust the feed signing key
wget -O /etc/opkg/keys/456471a41001d24a \
  https://raw.githubusercontent.com/kobidarch/luci-theme-doodle/main/root/etc/opkg/keys/456471a41001d24a

echo "src/gz doodle https://kobidarch.github.io/luci-theme-doodle/packages" >> /etc/opkg/customfeeds.conf
opkg update
opkg install luci-theme-doodle
```

**OpenWrt 25.12+ (apk):**

```sh
# One-time: trust the feed signing key
wget -O /etc/apk/keys/doodle-apk.pem \
  https://raw.githubusercontent.com/kobidarch/luci-theme-doodle/main/root/etc/apk/keys/doodle-apk.pem

echo "https://kobidarch.github.io/luci-theme-doodle/apk/packages.adb" >> /etc/apk/repositories.d/customfeeds.list
apk update
apk add luci-theme-doodle
```

After this, updates arrive through the normal
**System → Software → Update lists** flow.

---

## Method 2 — Release file (simplest today)

1. Open
   [Releases](https://github.com/kobidarch/luci-theme-doodle/releases)
   and download the file for your firmware:
   - `.apk` for OpenWrt 25.12+
   - `.ipk` for OpenWrt 24.10 and earlier
2. Copy it to the router, e.g. `scp file root@router:/tmp/`
3. Install it:

```sh
# apk (25.12+)
apk add --allow-untrusted /tmp/luci-theme-doodle-*.apk

# opkg (24.10 and earlier)
opkg install /tmp/luci-theme-doodle_*.ipk
```

---

## Method 3 — OpenWrt build tree (firmware builders)

```sh
cd /path/to/openwrt
git clone https://github.com/kobidarch/luci-theme-doodle.git package/luci-theme-doodle
make package/luci-theme-doodle/compile V=s
```

Then include `luci-theme-doodle` in your image or install the
resulting package from `bin/packages/`.

---

## Method 4 — Manual copy (development)

Best for hacking on the theme — edit locally, re-copy, refresh.
No packaging involved:

```sh
THEME=/path/to/luci-theme-doodle
ROUTER=root@192.168.1.1   # change to your router

# Theme assets
scp -r $THEME/htdocs/luci-static/doodle/ $ROUTER:/www/luci-static/doodle/

# Menu / status / config-page logic
scp $THEME/htdocs/luci-static/resources/menu-doodle.js \
    $THEME/htdocs/luci-static/resources/status-doodle.js \
    $ROUTER:/www/luci-static/resources/
scp $THEME/htdocs/luci-static/resources/view/system/doodle.js \
    $ROUTER:/www/luci-static/resources/view/system/

# Server-side templates
scp -r $THEME/ucode/template/themes/doodle/ \
    $ROUTER:/usr/share/ucode/luci/template/themes/doodle/

# Config page registration + permissions
scp $THEME/root/usr/share/luci/menu.d/luci-theme-doodle.json \
    $ROUTER:/usr/share/luci/menu.d/
scp $THEME/root/usr/share/rpcd/acl.d/luci-theme-doodle.json \
    $ROUTER:/usr/share/rpcd/acl.d/

# Default config (only if you have none yet — never overwrites)
ssh $ROUTER "test -f /etc/config/doodle || printf \
  \"config global 'global'\n\toption primary '#ff8fac'\n\toption status_bar '1'\n\toption font_size '14'\n\toption speed_unit 'bits'\n\" \
  > /etc/config/doodle"

# Register the theme (does NOT switch you to it)
ssh $ROUTER "uci -q set luci.themes.Doodle=/luci-static/doodle && \
  uci commit luci && \
  rm -f /tmp/luci-indexcache /tmp/luci-modulecache && \
  /etc/init.d/rpcd reload"
```

To iterate on CSS: rebuild it locally
(`lessc less/cascade.less htdocs/luci-static/doodle/css/cascade.css`),
re-copy just that file, then hard-refresh the browser
(`Ctrl+Shift+R`) — no router restart needed.

---

## Method 5 — Build packages locally

```sh
bash build-pkg.sh   # produces dist/*.ipk
```

`.apk` output additionally needs Docker (see comments in the script).
Install the result using Method 2.

---

## Activating the theme

Installing never switches your UI by itself. To switch:

1. Open LuCI → **System → System → Language and Style**
2. Set **Design** to **Doodle**
3. **Save & Apply**

The login page switches over automatically once Doodle is active.

---

## Verifying the install

```sh
# Theme files present?
ls /www/luci-static/doodle/css/ /usr/share/ucode/luci/template/themes/doodle/

# Theme registered?
uci show luci.themes   # expect: luci.themes.Doodle='/luci-static/doodle'

# Currently active design?
uci get luci.main.mediaurlbase   # /luci-static/doodle means active
```

---

## Updating

- **Feed installs:** update lists and upgrade as usual.
- **Manual installs:** repeat Method 4 (your `/etc/config/doodle`
  is preserved — the copy step never overwrites it).
- After any update, clear the template cache so changes take effect:

```sh
rm -f /tmp/luci-indexcache /tmp/luci-modulecache
```

---

## Uninstalling

```sh
# apk
apk del luci-theme-doodle

# opkg
opkg remove luci-theme-doodle

# Manual installs — switch away first, then delete:
uci set luci.main.mediaurlbase=/luci-static/bootstrap
uci delete luci.themes.Doodle
uci commit luci
rm -rf /www/luci-static/doodle \
  /www/luci-static/resources/menu-doodle.js \
  /www/luci-static/resources/status-doodle.js \
  /www/luci-static/resources/view/system/doodle.js \
  /usr/share/ucode/luci/template/themes/doodle \
  /usr/share/luci/menu.d/luci-theme-doodle.json \
  /usr/share/rpcd/acl.d/luci-theme-doodle.json \
  /etc/config/doodle
rm -f /tmp/luci-indexcache /tmp/luci-modulecache
/etc/init.d/uhttpd restart
```

---

## Troubleshooting

**Doodle isn't in the Design list.**
The theme registered but LuCI cached the old menu. Run:

```sh
uci -q set luci.themes.Doodle=/luci-static/doodle
uci commit luci
rm -f /tmp/luci-indexcache /tmp/luci-modulecache
```

then reload the page.

**LuCI won't load after switching themes.**
Switch back to a stock theme over SSH — you never lose access:

```sh
uci set luci.main.mediaurlbase=/luci-static/bootstrap
uci commit luci
rm -f /tmp/luci-indexcache /tmp/luci-modulecache
/etc/init.d/uhttpd restart
```

**I edited CSS/JS but nothing changed.**
Two caches bite here: clear the router template cache (command
above) *and* hard-refresh the browser (`Ctrl+Shift+R`), otherwise
you're looking at the old stylesheet.

**Header status pill is empty / config page says permission denied.**
The rpcd ACL wasn't picked up. Re-copy the ACL json and reload:

```sh
/etc/init.d/rpcd reload
rm -f /tmp/luci-indexcache /tmp/luci-modulecache
```

**Custom background doesn't show.**
The file must be named exactly `bg` plus extension, e.g.
`/www/luci-static/doodle/background/bg.jpg`
(`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.mp4`, `.webm`).

**`opkg` vs `apk` — which am I on?**
`cat /etc/openwrt_release`. Release `25.12` and newer use `apk`
exclusively; `24.10` and older use `opkg`. `.ipk` files cannot be
installed on apk-only systems (and vice versa) — copy the files
with Method 4 instead.
