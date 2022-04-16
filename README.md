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

<h2>Notice</h2>
BorealisOS is not nearly ready for any general use. It currently doesn't even have a working plugin system.

The main goal right now is reverse engineering SteamOS and adding more features to BorealisOS.

Eventually BorealisOS will have a full plugin system with a UI library and theme support.

<h2>Installation</h2>
BorealisOS is currently under heavy development and is not suggested for general use.

__BorealisOS requires CEF Debugging to be enabled within the Developer settings__

If you still want to install BorealisOS, you can do so by running the following command:

```sh
curl -L https://github.com/PineappleIOnic/BorealisOS/raw/main/install.sh | sh
```

Once BorealisOS is installed it can be run by __SSHing into the device while gaming mode is running__ and running the `borealisOS` command.
This will hook steamOS and patch it to use BorealisOS. All changes are temporary and BorealisOS will rollback any changes on exit and reload steam.

## Developing
We recommend having [VSCode's Remote Explorer extension](https://code.visualstudio.com/docs/remote/ssh) for developing BorealisOS on SteamDeck hardware.

You can also develop on the PUBLIC-PAL build of Steam if you like to keep everything local or don't have a SteamDeck to develop on.
