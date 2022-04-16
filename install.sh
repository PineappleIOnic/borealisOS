#!/bin/sh

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
echo

# Clean Previous installation
rm -r ~/.local/share/borealisOS/

sed -i '/# Added by BorealisOS/d' ~/.bashrc

mkdir -p ~/.local/share/borealisOS

# Clone BorealisOS
curl -L https://github.com/PineappleIOnic/BorealisOS/tarball/main | tar -xz -C ~/.local/share/borealisOS/ --strip-components=1

# Install NodeJS
curl -L https://nodejs.org/dist/v16.14.2/node-v16.14.2-linux-x64.tar.xz --output ~/.local/share/borealisOS/node-v16.14.2-linux-x64.tar.xz

mkdir ~/.local/share/borealisOS/node
tar -xf ~/.local/share/borealisOS/node-v16.14.2-linux-x64.tar.xz -C ~/.local/share/borealisOS/node --strip-components=1

rm ~/.local/share/borealisOS/node-v16.14.2-linux-x64.tar.xz

# Install Dependencies
cd ~/.local/share/borealisOS
~/.local/share/borealisOS/node/bin/npm install

# Add borealisOS to terminal
mkdir -p ~/bin
touch ~/bin/borealisOS

echo "cd ~/.local/share/borealisOS/ && ~/.local/share/borealisOS/node/bin/node src/index.js" > ~/bin/borealisOS
chmod +x ~/bin/borealisOS

# Add to $PATH
echo "export PATH=\$PATH:~/bin # Added by BorealisOS" >> ~/.bashrc

echo "BorealisOS was successfully installed! You can now run BorealisOS by typing 'borealisOS' in your terminal while Gaming mode is active."
