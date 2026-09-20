# luci-theme-doodle

A pastel doodle theme for OpenWrt LuCI — opaque paper cards, thick ink
borders, hard offset shadows, and a candy palette.

![OpenWrt](https://img.shields.io/badge/OpenWrt-23.05%2B-brightgreen.svg)
![Version](https://img.shields.io/badge/version-1.0.2-orange.svg)
![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)

## Screenshots

| Overview | Login |
|----------|-------|
| ![Overview](screenshots/overview.png) | ![Login](screenshots/login.png) |

## What it looks like

- **Doodle cards** — paper background, `3px` ink borders, `5px 5px 0`
  offset shadows, big `22px` radii
- **Pastel palette** — pink `#ffc9d9`, mint `#bdead9`, sky `#b6e2f7`,
  butter `#ffe6a0`, lavender `#ddccfb`, peach `#ffd7ba`, coral `#ffb2a6`
- **Doodle type** — [Baloo 2](https://fonts.google.com/specimen/Baloo+2)
  for headings and buttons, [Nunito](https://fonts.google.com/specimen/Nunito)
  for body (Google Fonts with system fallback, works offline too)
- **Doodle controls** — pastel buttons that lift on hover and press in on
  click, ink-bordered inputs with hard-shadow focus, butter table headers,
  blob-shaped alerts, pill badges and toggles

## Layout

The classic LuCI shell, doodled:

- Fixed full-width **64px topbar** — pill page title, live status pill
  (CPU · RAM · WAN throughput · uptime), hamburger on mobile
- Fixed **250px sidebar** — pastel icon circles, hard-shadow active state,
  collapses to a slide-out drawer under `1024px`
- Secondary **sub-nav strip** — CBI tab menus move up under the header
- Full LuCI coverage: sections, tables, forms, dropdowns, modals,
  tooltips, progress bars, package manager, firewall zones, interface
  boxes, realtime graphs, login page

## Theming

- **Light only** — Dark mode will come in the near future. 
- **Accent color** — `primary` (default `#ff8fac`), adjustable via UCI
- **Base font size** — adjustable via UCI (handy on high-DPI displays)
- **Status pill** — can be disabled on low-end devices
- **Custom backgrounds** — drop a `bg.*` file into
  `htdocs/luci-static/doodle/background/` (`.jpg`, `.png`, `.gif`,
  `.webp`, `.mp4`, `.webm`)

## Installation

> First time here? Follow the full
> [Installation Guide](INSTALL.md) — five methods, verification
> steps, and troubleshooting.

After installation, pick **Doodle** under
**System → System → Language and Style**.

### From the package feed (auto-update)

**OpenWrt 24.10 and earlier (opkg):**

```sh
echo "src/gz doodle https://kobidarch.github.io/luci-theme-doodle/packages" >> /etc/opkg/customfeeds.conf
opkg update
opkg install luci-theme-doodle
```

**OpenWrt 25.12+ (apk):**

```sh
echo "https://kobidarch.github.io/luci-theme-doodle/apk/packages.adb" >> /etc/apk/repositories.d/customfeeds.list
apk update
apk add luci-theme-doodle
```

### From a release file (manual)

Grab the latest file from
[Releases](https://github.com/kobidarch/luci-theme-doodle/releases):

- **apk**: `apk add --allow-untrusted luci-theme-doodle-*.apk`
- **opkg**: `opkg install luci-theme-doodle_*.ipk`

### From source (OpenWrt build tree)

```sh
cd /path/to/openwrt
git clone https://github.com/kobidarch/luci-theme-doodle.git package/luci-theme-doodle
make package/luci-theme-doodle/compile V=s
```

### Manual install (development)

```sh
# Copy theme files to the router
scp -r htdocs/luci-static/doodle/ root@router:/www/luci-static/doodle/
scp htdocs/luci-static/resources/menu-doodle.js \
    htdocs/luci-static/resources/status-doodle.js \
    root@router:/www/luci-static/resources/
scp htdocs/luci-static/resources/view/system/doodle.js \
    root@router:/www/luci-static/resources/view/system/
scp -r ucode/template/themes/doodle/ \
    root@router:/usr/share/ucode/luci/template/themes/doodle/

# Register and activate
ssh root@router "uci set luci.themes.Doodle=/luci-static/doodle && \
  uci set luci.main.mediaurlbase=/luci-static/doodle && \
  uci commit luci && rm -f /tmp/luci-indexcache /tmp/luci-modulecache"
```

Or build installable packages locally:

```sh
bash build-pkg.sh   # produces dist/*.ipk (apk needs Docker, see script)
```

## Configuration

`/etc/config/doodle` on the router:

```
config global 'global'
	option primary '#ff8fac'
	option status_bar '1'
	option font_size '14'
```

| Option | Default | Description |
|--------|---------|-------------|
| `primary` | `#ff8fac` | Accent color for links and active elements |
| `status_bar` | `1` | `1` shows live stats in the header, `0` hides them |
| `font_size` | `14` | Base font size in px (`13`, `14`, `16`, `18`) |

A **Doodle Theme Config** page is also available under
**System** in LuCI itself.

## Development

### Prerequisites

- Node.js with the Less compiler: `npm install less`

### Building the CSS

```sh
lessc less/cascade.less htdocs/luci-static/doodle/css/cascade.css
lessc less/dark.less htdocs/luci-static/doodle/css/dark.css
```

(`dark.css` is an intentional near-empty stub — the theme is light only,
but the file is kept so older installs referencing it keep working.
Compiled output must contain zero `backdrop-filter`.)

### Project structure

```
luci-theme-doodle/
├── Makefile                              # OpenWrt package build
├── build-pkg.sh                          # Local .ipk/.apk builder
├── htdocs/luci-static/
│   ├── doodle/
│   │   ├── css/                          # Compiled CSS
│   │   ├── img/                          # doodle-logo.svg
│   │   └── background/                   # User wallpapers (bg.jpg, …)
│   └── resources/
│       ├── menu-doodle.js                # Sidebar / header / tab renderer
│       ├── status-doodle.js              # Header live stats
│       └── view/system/doodle.js         # Theme config page
├── less/                                 # LESS sources (pure doodle)
│   ├── cascade.less                      # Master import
│   ├── variables.less                    # Pastel tokens, ink, radii, type
│   ├── normalize.less                    # Reset + fonts
│   ├── doodle.less                       # Mixins: cards, buttons, inputs
│   ├── layout.less                       # Topbar, sidebar, sub-nav, content
│   ├── components.less                   # CBI forms, tables, alerts, modals
│   ├── sysauth.less                      # Login page
│   ├── page-fix.less                     # Per-view overrides
│   ├── responsive.less                   # Mobile breakpoints
│   └── dark.less                         # Disabled (stub, see above)
├── ucode/template/themes/doodle/         # Server-side templates
│   ├── header.ut                         # Head + sidebar + topbar
│   ├── footer.ut                         # Footer + scripts
│   ├── sysauth.ut                        # Login page
│   └── version                           # Theme version
├── root/                                 # Installed to the device root
│   ├── etc/config/doodle                 # Default UCI config
│   ├── etc/uci-defaults/                 # First-boot registration
│   ├── usr/share/luci/menu.d/            # Config page entry
│   └── usr/share/rpcd/acl.d/             # ACL permissions
├── po/templates/doodle.pot               # Translation template
└── screenshots/                          # Theme screenshots
```

### Design tokens

Everything lives in `less/variables.less`: `--ink`, `--paper`,
`--paper-2`, `--bg`, the seven pastels (each with a `--*-deep` partner),
`--stroke: 3px`, `--shadow-sm/md/lg/xl`, radii `22/16/12px`,
`--font-display: 'Baloo 2'`, `--font-sans: 'Nunito'`.
Reusable pieces live in `less/doodle.less`: `.doodle-card()`,
`.doodle-btn()`, `.doodle-input()`, `.doodle-blob()`.

### Heading hierarchy

- Full-width pastel **strips** — section titles
- **Mint badges** — sub-headings inside sections
- **Butter strips** — table headers

### Version bump checklist

1. `ucode/template/themes/doodle/version`
2. `README.md` — version badge above

## Compatibility

- OpenWrt **23.05+** (ucode `.ut` templates)
- Any modern Chrome, Firefox, or Safari
- No dependencies — pure CSS plus vanilla LuCI JS

## Credits

- Layout architecture descended from
  [luci-theme-glass](https://github.com/rchen14b/luci-theme-glass) and
  [luci-theme-argon](https://github.com/jerrykuku/luci-theme-argon)
- Type: Baloo 2 and Nunito (Google Fonts, OFL licensed)

## License

[GPL-3.0](LICENSE)
