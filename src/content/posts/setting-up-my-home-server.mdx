---
title: Setting Up My Home Server
date: 2015-08-02T09:57:00.000Z
date_updated: 2018-03-03T10:57:37.000Z
---

So, I’ve got an old laptop kicking around, and I decided to spend an afternoon making it into a home server.

#### Choosing an OS

The Windows key on the bottom has run dry, so I’ve decided to spin up [Xubuntu](http://xubuntu.org/getxubuntu/) on it. I want a graphical interface because it will make managing it much easier, but I don’t want to sacrifice too much disk space or speed to it. I set the torrent to download, and headed over to get [UNetbootin](http://unetbootin.github.io) to burn the ISO to a USB stick. As I’m running on a Mac, UNetbootin has a few weird quirks — the favourites links on the Finder don’t work, and there’s no retina support, so it’s ugly, but it does the job, you just have to locate the file manually by traversing the whole directory tree.

UNetbootin can’t set active flags or write the MBR, so the next steps are to unmount the disk and then run a few terminal commands:

```bash
fdisk -e /dev/rdiskX
```

Where X is the number of the disk. Ignore the error message here, and then type the following, hitting enter at the end of each line:

```fdisk
f 1
write
exit
```

Then, download the Syslinux binaries from [Kernel.org](https://www.kernel.org/pub/linux/utils/boot/syslinux/). You need the mr.bin file, which should be hiding under `bios/mbr/mbr.bin`. Once you’ve located it, do the following, replacing the X with the disk number again (you may also have to unmount the drive again):

```bash
sudo dd conv=notrunc bs=440 count=1 if=bios/mbr/mbr.bin of=/dev/diskX
```

Then follow the instructions on UNetbootin to burn the ISO file to an external drive. The whole process should only take a few minutes.

#### Installing the OS

I booted up the old laptop from the USB stick by setting it to the first priority in the BIOS. Then, choose the option to **Install Xubuntu**. The laptop booted cleanly into a desktop, and the installer launched immediately. I opted to do my own partition configuration, because I want to have the OS separated from data partitions. When it prompts for ‘Installation type’, choose ‘Something else’. I gave 10GB for the OS itself, 4GB swap, and the rest I formatted as XFS and mounted it at /mnt/data1 (eventually, I will have /mnt/data as pooled storage).

I name all of my computers after ships from Iain M. Banks’s Culture series, this one is no exception. Given the repurposing of the laptop as a server, I decided on `ReformedNiceGuy` as the hostname.

I chose to connect the laptop to the internet immediately and allow it to automatically update itself as it installed. The installation took about 30 minutes, including the downloaded updates. I restarted the computer, and hit a snag. Grub loaded, but Xubuntu wouldn’t — there was just a black screen. I’ve had a few problems with this laptop before, so tried running the grub command with `nomodeset`, and it booted like a charm, so I added this to the `GRUB\_CMDLINE\_LINUX_DEFAULT` line in the `/etc/default/grub` file, and ran `sudo update-grub`.

#### Configuring the OS

Once I logged in, there were (surprisingly, as I thought it would have installed them already) a few updates available. I ran them, and set the OS to automatically install updates.

Next up, I wanted to keep power consumption (and so fan spin-up and noise) low, so I ran `sudo apt-get install cpufrequtils` to install a CPU governor, and then ran:

```bash
sudo sed -i 's/^GOVERNOR=.\*/GOVERNOR="powersave"/' /etc/init.d/cpufrequtils
```

This command will tell the OS to always use powersave mode. This should help with my overheating problem too.

Next up is to allow file sharing. Because I opted for Xubuntu, it’s not baked in. There are a few ways to fix this, but I decided to just install Nautilus and use that instead. The command you need is:

```bash
sudo apt-get install nautilus nautilus-share
```

Once done, I opened a Nautilus window from the command prompt (`sudo nautilus`), navigated to the root directory, and right clicked on `mnt` and chose ‘Local Network Share’, at which point, I was prompted to install Samba and a few other dependencies, and restart the session.

I opted to restart the computer completely instead, and I was able to read files, but couldn’t create.

I set the permissions on the `/mnt` directory and its children to 777, and logged out and back in. Bingo! It works!

Next up, I decided to set up pooled drives.

#### Pooling drive space with mhddfs

This was pretty simple. I installed mhddfs with `sudo apt-get install mhddfs`, and then created a directory for the data: `/mnt/data`.

I ran the following command:

```bash
mhddfs /mnt/data1,/mnt/data2 /mnt/data -o allow_other
```

and shared the `data` directory. It works beautifully.

I decided to mount my portable USB drive to /mnt/data2, but you can set up any directory there. I can see 721GB of free space on the drive, which is nice, and about what I was expecting. Over wireless, files are taking a couple of seconds longer to load, but nothing dreadful, and I plan on plugging directly into the router once I’m happy with the setup.

#### Installing a media server

I wanted to run a media streaming server on this machine too, so I downloaded and installed [Plex](http://plex.tv). I ran the following command to start it:

```bash
sudo service plexmediaserver start
```

It was then accessible on my home network at [http://reformedniceguy:32400/web](http://reformedniceguy:32400/web,). I configured the server according to Plex’s instructions.

When Plex was indexing the files, it ended up overheating, and the laptop shut itself down (not very gracefully, I might add), so I tried running adding `acpi_osi=Linux thermal.off=1` to grub, and I installed [TLP](http://www.webupd8.org/2014/10/advanced-power-management-tool-tlp-06.html). I also set the governor to powersave with the following command:

```bash
sudo cpufreq-set -g powersave
```

And that’s it. It’s up and running. I just had to configure Plex a bit. Total time taken was around 4–5 hours, including waiting for reboots, updates, etc.

But I have to start again, because none of my attempts to mitigate the overheating were actually successful, so I’m going to have to use my old Windows 8 Pro product key, and see if I can get that to work.
