#!/bin/sh

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "This script needs to run as root, please try again with sudo."
    exit
fi

echo "Uninstalling BorealisOS..."

readonlyfs="$(steamos-readonly status)" 

if [[ $readonlyfs =~ "enabled" ]]; then
    echo "Note: Uninstaller will temporarily disable readonly on the SteamOS file system to remove the borealisOS service."
    steamos-readonly disable
fi

rm -r ~/.local/share/borealisOS/

sed -i '/# Added by BorealisOS/d' ~/.bashrc

systemctl stop borealis 2> /dev/null
systemctl disable borealis 2> /dev/null
rm -f /etc/systemd/system/borealis.service

rm ~/bin/borealisOS

if [[ $readonlyfs =~ "enabled" ]]; then
    steamos-readonly enable
fi