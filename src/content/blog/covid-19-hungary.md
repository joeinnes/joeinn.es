---
title: COVID-19 Hungary
date: 2020-03-11T22:45:19.000Z
date_updated: 2020-03-13T20:04:07.000Z
featured_image: /media/uploads/covid-hungary.jpeg
---

So, I built an app for the COVID-19 'pandemic' - it's hosted at [covid19.budapestpulse.com](https://covid19.budapestpulse.com) by Glitch - check it out!

**Tech info:**

- It's a Node.js/Express app
- It fetches data the koronavirus.gov.hu site, and parses it to read out key data points
- It saves that to an NEDB database with a time stamp
- If there's a database entry within the past 30 mins, then the app will read that, rather than refetching the data
