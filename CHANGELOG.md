# Changelog

## 1.1.6-r2

Mostly cleanup.

- nftables: removed the box around the whole fw4 table. The chain cards keep
  their borders, and the table title doesn't have that doubled bottom edge
  anymore.
- Diagnostics: the command output box was drawing its own border inside the
  card. Removed it, so the card border is the only one left.
- opkg: the feed key was saved under the wrong name. opkg looks keys up by
  fingerprint, so it has to be `71a41001d24a5ce1`. The docs use that name now,
  and there's a troubleshooting note for anyone who still has the old one.
- README and release notes get the one-time key step again. That step had gone
  missing in 1.1.6.

The `.apk` is signed with the Doodle APK key, and the opkg feed is signed with
the opkg key.
