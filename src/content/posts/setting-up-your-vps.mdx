---
title: Setting Up Your VPS
date: 2014-04-08T09:34:00.000Z
date_updated: 2018-03-03T10:34:26.000Z
---

So now you have a server in the cloud. Nice! But at the moment, it’s not doing anything. It’s connected to the internet, sure, but it’s not actually ready for you to do anything with yet. In order to do that, you’re going to need to get used to the command line. If you’re on a Mac or Linux, SSH is built into your system, but if you’re on Windows, you’ll need to download an SSH client. I recommend [PuTTY](http://www.putty.org/), but the choice is up to you. The only difference between PuTTY and the Mac/Linux SSH clients is that you will need to launch PuTTY separately to log in to your server, while Mac and Linux users can simply type ssh and they will be able to connect.

Once you’re ready, type the command below on Mac/Linux or try to establish a connection via PuTTY. You will be asked for a username and password. Use root as the username, and the root password you wrote down earlier to log in to the server.

```bash
ssh <server-ip>
```

Once you’re in, you’ll see a line ending in a `$`, and a place for you to type.

The first thing we need to do is change your password. Type:

```bash
passwd
```

You will be prompted to change your root password. This helps to secure your server.

Next, make sure everything is up-to-date. Check for updates and install them by typing the two commands below:

```bash
apt-get update
apt-get upgrade
```

Now your server is up-to-date, it’s time to set up a LAMP stack on it. LAMP stands for Linux, Apache, MySQL, PHP. There are alternative stacks available, but this is the most common configuration. You may not wish to use all of the features of the stack at the moment, but if you continue developing stuff, and want to try new stuff out, this is more or less the minimum you will need.

### Apache

Apache is an enterprise grade web server, and you can install it with just a few keystrokes. Type:

```bash
apt-get install apache2
```

You will then have to press `Y` to confirm you want to install all of its dependencies, and Apache will install itself.

You can test Apache has installed correctly by navigating to your IP address, and you should see a page with the text “**It works!**”.

### MySQL

MySQL is a database system. You can install it by typing:

```bash
apt-get install mysql-server
```

You will have to press `Y` again. As part of the installation, you will be asked to set a password for the root user. This is important, make a note of this too. Once the installer has finished, it’s time to secure it a bit. Type:

```bash
mysql_secure_installation
```

Then press enter and answer yes to all questions except the first one. This will help tidy up some of the less secure default settings.

### PHP

PHP is a server-side language that allows you to run most web apps. To install it, type:

```bash
apt-get install php5 php-pear php5-mysql
```

This will install the MySQL dependencies so that web apps can talk to your databases too. Now to test it, type the following:

```php
echo "<?php phpinfo(); ?>" > /var/www/html/info.php
```

Then you can check PHP has installed correctly by visiting [http://your-server-ip/info.php](http://your-server-ip/info.php)

_Note: you will almost certainly have to install and enable additional PHP modules later if you want to do anything interesting, but this is more or less the bare minimum. You may also find you have a different document root depending on the exact setup of your server. This is the default, though._

### Security

Next, you should set up a new user without root privileges. You can do this by typing:

```bash
adduser <username>
```

You can choose the user name. Fill in a new password, and as much info as you want to add about the user.

Don’t log out just yet, because you want to make your life easier by allowing you to switch to root temporarily to run commands. Do this by typing

```bash
visudo
```

and then adding a line at the bottom that says

```sudoers
<username> ALL=(ALL:ALL) ALL
```

Then hit `Ctrl+X`, and then press `Y` and `enter` to save the file.

Still logged in as root, type:

```bash
nano /etc/ssh/sshd_config
```

Check for the line that starts with `PermitRootLogin`, and change it to

```
PermitRootLogin no
```

Now type:

```bash
reload ssh
exit
```

You can now log back into your server using your own username and password, and perform any actions requiring root access by typing `sudo` in front of the command.
