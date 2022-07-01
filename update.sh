#!/bin/sh

# BorealisOS update script, used internally by BorealisOS to provide updates.

# Clone BorealisOS
curl -L https://github.com/PineappleIOnic/BorealisOS/tarball/main | tar -xz -C ~/.local/share/borealisOS/ --strip-components=1 --overwrite

# Restart Service
systemctl restart borealis