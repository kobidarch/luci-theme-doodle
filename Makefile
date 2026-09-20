#
# Copyright (C) 2024-2026 luci-theme-doodle contributors
#
# This is free software, licensed under the GNU General Public License v3.0.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Doodle - Pastel doodle theme for LuCI (opaque, ink borders, hard shadows)
LUCI_DEPENDS:=
PKG_VERSION:=$(shell cat $(CURDIR)/ucode/template/themes/doodle/version | tr -d '[:space:]')
PKG_RELEASE:=1

# Disable CSS minification to preserve doodle hard-shadow styling
CONFIG_LUCI_CSSTIDY:=

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
