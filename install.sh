#!/bin/sh

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "This script needs to run as root, please try again with sudo."
    exit
fi

readonlyfs="$(steamos-readonly status)" 

echo "  ____                       _ _      ____   _____ ";
echo " |  _ \                     | (_)    / __ \ / ____|";
echo " | |_) | ___  _ __ ___  __ _| |_ ___| |  | | (___  ";
echo " |  _ < / _ \| '__/ _ \/ _\` | | / __| |  | |\___ \ ";
echo " | |_) | (_) | | |  __/ (_| | | \__ \ |__| |____) |";
echo " |____/ \___/|_|  \___|\__,_|_|_|___/\____/|_____/ ";
echo "                                                   ";
echo "A SteamOS 3.0 plugin and customisation framework built using NodeJS. ";
echo
echo

if [[ ! $readonlyfs =~ "enabled" ]]; then
    echo "WARNING: This installer will temporarily mount the steamOS filesystem as write to install the service, it will be remounted as read-only after the installation is finished."
fi

if [[ $readonlyfs =~ "enabled" ]]; then
    steamos-readonly disable
fi

# Clean Previous installation
rm -r /home/deck/.local/share/borealisOS 2> /dev/null

sed -i '/# Added by BorealisOS/d' ~/.bashrc

mkdir -p /home/deck/.local/share/borealisOS

systemctl stop borealis 2> /dev/null
systemctl disable borealis 2> /dev/null
rm -f /etc/systemd/system/borealis.service

# Clone BorealisOS
curl -L https://github.com/borealisOS/borealisOS/tarball/main | tar -xz -C /home/deck/.local/share/borealisOS --strip-components=1

# Install NodeJS
curl -L https://nodejs.org/dist/v16.14.2/node-v16.14.2-linux-x64.tar.xz --output /home/deck/.local/share/borealisOS/node-v16.14.2-linux-x64.tar.xz

mkdir /home/deck/.local/share/borealisOS/node
tar -xf /home/deck/.local/share/borealisOS/node-v16.14.2-linux-x64.tar.xz -C /home/deck/.local/share/borealisOS/node --strip-components=1

rm /home/deck/.local/share/borealisOS/node-v16.14.2-linux-x64.tar.xz

# Install Dependencies
cd /home/deck/.local/share/borealisOS
/home/deck/.local/share/borealisOS/node/bin/npm install

# Add borealisOS to terminal
mkdir -p ~/bin
touch ~/bin/borealisOS

# Because script runs as root, the deck user will not be allowed to access configuration files.
# This fixes those permissions.
chown -R deck:deck /home/deck/.local/share/borealisOS

# Install Service Files
cp -r /home/deck/.local/share/borealisOS/borealis.service /etc/systemd/system/

echo "cd /home/deck/.local/share/borealisOS && /home/deck/.local/share/borealisOS/node/bin/node src/index.js" > ~/bin/borealisOS
chmod +x ~/bin/borealisOS

sudo systemctl enable borealis
sudo systemctl start borealis

# Add to $PATH
echo "export PATH=\$PATH:~/bin # Added by BorealisOS" >> ~/.bashrc

if [[ $readonlyfs =~ "enabled" ]]; then
    steamos-readonly enable
fi


echo "BorealisOS was successfully installed! Reload into gaming mode to see the changes."
