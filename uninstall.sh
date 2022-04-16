#!/bin/sh

echo "Uninstalling BorealisOS..."

rm -r ~/.local/share/borealisOS/

sed -i '/# Added by BorealisOS/d' ~/.bashrc

mkdir -p ~/.local/share/borealisOS

rm ~/bin/borealisOS