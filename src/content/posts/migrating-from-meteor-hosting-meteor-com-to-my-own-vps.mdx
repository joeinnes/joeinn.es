---
title: Migrating from Meteor Hosting (.meteor.com) to my own VPS
date: 2016-03-13T15:40:00.000Z
date_updated: 2018-03-03T15:40:31.000Z
---

Sad news — the free and simple hosting provided by Meteor is coming to an end (as do all things), and so if you want to keep your apps, you need to migrate them to another host.

I followed the steps below with a brand new Digital Ocean droplet, but this should work with any VPS you have access to. If you don’t have access to a VPS, check out [this article](https://medium.com/@joe.innes/choosing-a-vps-provider-fc4b3a7630bd). You’ll also need to configure SSH access using a key, but that’s not too complicated. Google-fu will help you.

#### Deploying the app

The first step is to get the most recent version of the app itself — I _know_ you’re using source control, so that won’t be a problem. Right?

```bash
git clone <your-repo>
```

Now, you’re going to use a tool called Meteor Up. The most recent version is actually available as mupx. Install it and then you can initiate a new Meteor Up project.

```bash
sudo npm install -g mupx
mupx init
```

Meteor Up needs to use a settings file for Meteor, so if you have any custom entries in a `settings.json` file or something like that, you’ll need to migrate your entries into the new `settings.json` file that mupx has created.

Now, open up `mup.json`, and modify the file based on the comments. The most basic modifications are:

servers.host — enter your VPS’s IP address
servers.username — normally ‘root’ will be fine here, depending on how your server is configured.
servers.password — per best practice, you should probably comment this out and use the ‘pem’ line instead
servers.pem — uncomment this line, and change it to “~/.ssh/id_rsa.decrypted”. Note that you will need to add a comma at the end of this line too.
appName — enter a one word name for your app. This will be used on the VPS as the name of docker container, so make it clear. Write this down on a piece of paper!
app — the path to the app (on your local machine)
env.ROOT_URL — this will be used to set up the web server, make sure you set this correctly to a domain that you own, and that is pointing at the VPS.

If you need some help registering a domain name, check out [this article](https://medium.com/@joe.innes/registering-a-domain-name-ef7a0feb5892).

You’re almost ready to deploy now — you just need an unencrypted version of your SSH key. Run the following command:

```bash
openssl rsa -in ~/.ssh/id_rsa -out ~/.ssh/id_rsa.decrypted
```

You should be prompted for your passphrase, and then you’re good to go! Obviously, make sure this key never gets out into the wild.

Your next step is to configure the server. While this sounds like a painstaking process, Meteor Up takes care of it all for you — just run the following command.

```bash
mupx setup
```

This shouldn’t take very long, and will install everything on your server, apart from the application itself.

Now for the fun bit — deploying your app. It’s as simple as:

```bash
mupx deploy
```

Now your app will be up and running on the new web host, accessible at the root URL you provided in the mup.json file.

#### Migrating the data

When you access the app, you might notice that you’ve lost all of the data in it. If this bothers you, the process for migrating the data over is a little more involved, but not too difficult.

First of all, make sure that you have Mongo installed on your computer (in case you don’t want Mongo, all you really need is the mongodump executable).

Next, from your Meteor app’s directory run the following command.

```bash
meteor mongo <your-app.meteor.com> --url
```

You’ll get back a reply that looks like this:

```bash
mongodb://client-id:password@server:27017/app_name_meteor_com
```

You need to extract the information above, and run the command below, using the data:

```bash
./mongodump -h <server> --port 27017 --username <client-id> --password <password> -d <app_name_meteor_com>
```

These two commands have to be run within a minute of each other according to the Internet, or they may not work (although I had no problems).

This will create a folder called ‘dump’ in your current working directory. You’ll need to copy this up onto your server. You can choose the location it will be uploaded to on the server yourself, but I just put it in /root/dump. It won’t be staying for long anyway.

```bash
scp -r dump root@<yourServer>:dump
```

Next up, you need to ssh into your server. Now, you’re going to copy the dump into your MongoDB container, and then open a shell inside that container to import the database. It’s all getting a little inception-y.

```bash
docker cp dump mongodb:/dump
docker exec -it mongodb bash
```

Now, you’re inside the docker container, we need to remove the database that was automatically created for the app you deployed, and then you just need to import the database dump.

First step is to remove the empty database. We’re going to load up Mongo, access the database, and drop the one we don’t want. Follow the commands below:

```mongo
mongo
show dbs;
```

You should see three databases — local, test, and the third one, named after your app. This name is important, write it on a piece of paper.

Now, use your database, and drop it.

```mongo
use <myDb>;
db.dropDatabase();
```

Your app will stop working, but we have one step left to go — restoring the database from the .meteor.com hosted app.

If you’ve been paying attention, you should have two pieces of information written down on a piece of paper. The first is the Meteor app name. The second is the dumped database name. We need to restore the dumped database with the name of the Meteor app.

Run the following command:

```bash
mongorestore -d <yourAppName> dump/<appName_meteor_com>
```

In case you just restore the database as it is, your Meteor app won’t know where to find it.

Once you’ve done that, you should be good to go. Access your app at the new location, and you should see no difference in comparison to the meteor.com version — except it should be a bit faster, and won’t be subject to spin downs.
