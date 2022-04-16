<p align="center">
<img width="75px" src="./assets/lambda.png" align="center"></img>
</p>
<h1 align="center">BorealisOS</h1>
<p align="center">A SteamOS 3.0 plugin and customisation framework built using NodeJS.</p>

<p align="center">Note: Very early progress, only use if you know what you are doing.</p>

<br>
<br>

<details>
<summary>
<h2>DISCLAIMER (READ ME!)</h22>
</summary>

```
BorealisOS is a plugin manager that gives (currently) unrestricted access to SteamOS's JavaScript instance. 

Valve binds all SteamOS system functions to this JavaScript instance. Treat installing BorealisOS plugins like installing 
apps that require administrator rights because they quite literally can perform administrator actions without you even 
knowing.

Make sure you review all plugins you install and DO NOT install any plugins you do not inherently trust. Anything with
obfuscation or not very readable code is a big red flag. It would take not even 20 lines of JavaScript to steal your
account token and factory reset the device.

We are not responsible for any device damage caused by using BorealisOS.
```

</details>

<h2>Installation</h2>
BorealisOS is currently only usable for advanced users with both their steamOS system parition unlocked and SSH enabled and setup.

You will also need to enable developer mode on your SteamDeck and enable it's CEF Debugging option in the developer settings.

As we continue development these two requirements will eventually be removed.

BorealisOS is currently early days and requires you to unlock your system partition using:
```
sudo steamos-readonly disable
```
then to install NodeJS, we currently recommend using [n](https://github.com/tj/n)
```
curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
bash n lts
```
Also install git:
```
sudo pacman -S git
```

Next clone the BorealisOS repository
```
git clone https://github.com/PineappleIOnic/borealisOS.git
```

Then change directory to borealisOS and install it's dependencies
```
cd borealisOS
npm install
```
finally to launch BorealisOS run:
```
node src/index.js
```
This will hook steamOS and patch the required files installing BorealisOS. This is temporary and all patches will be removed on either closure of BorealisOS or restarting the steam client.

## Developing
We recommend having [VSCode's Remote Explorer extension](https://code.visualstudio.com/docs/remote/ssh) for developing BorealisOS on SteamDeck hardware.

You can also develop on the PUBLIC-PAL build of Steam if you like to keep everything local or don't have a SteamDeck to develop on.
