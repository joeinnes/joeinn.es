---
title: Team Are Online
date: 2020-09-22T17:48:00.000Z
date_updated: 2020-09-22T22:03:34.000Z
---

> **Goal:** Enable teams to work remotely more effectively by displaying a 'status' which can be set easily

### Stack

Back End Platform: [OctoberCMS](http://octobercms.com/), running on a Ubuntu 20.04 server (Linux, Apache, SQLite PostgreSQL, PHP)

Front-end: [~~Water.css~~](https://watercss.kognise.dev/) [Picnic.css](https://picnicss.com/)

### Basic Technical Overview

A custom plugin will add two new models: 'Projects' and 'States', as well as extending the user model (from [RainLab.User](https://octobercms.com/plugin/rainlab-user), which in itself extends the backend user) to add references to these two new models. A user belongs to one project and one state at a time.

Admins can create new projects and states from the backend. Users can log in using a username and password, and they will see a set of buttons where they can indicate their current state (the 'states' from the backend).

Below this, they see a list of logged in users who are part of the same project as they are, and their states.

### Extra Features

Users can set a profile picture/avatar - if they choose not to specify one, an avatar will be generated for them by [RoboHash](https://robohash.org/), a cool service which converts a hash of any data into a unique looking robot

- Options to update name, email address, and password
- Displays 'time since' so users can see _when_ someone changed their state
- SSL encryption through [LetsEncrypt](https://restic.net/)
- Daily, Weekly and Monthly backups with [Restic](https://restic.net/) (and a shell script to dump the data from Postgres)
- Certain users can be flagged with a different background colour (eg: leads, etc.)
- A 'god mode' exists, where an admin can monitor all users active on the application from a single view

### Challenges/Learning Points

- Although theoretically SQLite and Postgres have similar SQL dialects, migrating between the two is actually quite difficult. In particular, auto-incrementing primary keys are not migrated properly, and new sequences need to be created
- Initially I started by simply extending the user model in my own plugin, and overriding forms etc in page partials. It made more sense (and so I eventually refactored) to override forms in my plugin
- Although OctoberCMS migrations are very helpful, I rolled back the migration in which I added custom colours, and when I reapplied it, the data was (unsurprisingly) lost. Fortunately this feature had not been used heavily, so I decided not to restore the backup (which would have reset everyone's state to how at was at midnight) and instead manually correct the lost data
- The site was eventually implemented using AJAX polling, which is not ideal for an app which should really be realtime. This is a possible enhancement for the future, to implement a WebSockets transport layer to handle messaging to and from clients. This could also allow for fewer network requests and database queries to run, which would significantly improve the scalability of the app.

Even though the application is not advertised anywhere or publicly linked, I still see significant numbers of what I assume to be attempted botnet attacks, targeting:

- /wp-login.php
- /administrator/index.php
- /wp-admin
- /wp-admin/install.php
- /wp-content/plugins/wp-file-manager/lib/php/connector.minimal.php
- /wp-content/plugins/wp-file-manager/lib/files/xxx.php

These last two I believe to be linked to a [vulnerability recently discovered](https://arstechnica.com/information-technology/2020/09/hackers-are-exploiting-a-critical-flaw-affecting-350000-wordpress-sites/) in wp-file-manager, a WordPress plugin. This shows that although security through obscurity is not really security, and it's unlikely I would have been using this plug-in had I developed this app on WordPress, attackers are specifically hunting for WordPress sites with known exploits.

### Code snippets

### Add new sequences

# Create function to set up new sequences as appropriate

```sql
CREATE OR REPLACE FUNCTION serialise*id(table_name TEXT,
column_name TEXT) RETURNS INTEGER AS $$
DECLARE
start_with INTEGER;
sequence_name TEXT;
BEGIN
sequence_name := table_name || '*' || column_name || '\_seq';
EXECUTE 'SELECT coalesce(max(' || column_name || '), 0) + 1 FROM ' ||
table_name
INTO start_with;EXECUTE 'CREATE SEQUENCE IF NOT EXISTS ' || sequence_name ||
' START WITH ' || start_with ||
' OWNED BY ' || table_name || '.' || column_name;
EXECUTE 'ALTER TABLE ' || table_name || ' ALTER COLUMN ' || column_na
me ||
' SET DEFAULT nextVal(''' || sequence_name || ''')';
RETURN start_with;
END;

$$
LANGUAGE plpgsql VOLATILE;

do
$$

declare
l_rec record;
begin
for l_rec in (select table_schema, table_name, column_name
from information_schema.columns
where column_name = 'id' and table_name <> 'sessions') lo
op
perform serialise_id(l_rec.table_name, 'id');
end loop;
end;

$$
LANGUAGE plpgsql;
$$
```
