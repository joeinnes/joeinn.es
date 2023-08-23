---
layout: blog
title: Drinks App
draft: true
date: 2023-08-22T09:57:00.000Z
date_updated: 2023-08-22T09:57:00.000Z
featured_image: /media/uploads/IMG_7895.jpeg
page_bg: radial-gradient(at 50% 0%, rgba(14 165 233 / 0.18) 0px, transparent 75%), radial-gradient(at 100% 0%, rgba(75 36 74/ 0.18) 0px, transparent 50%) rgb(17, 24, 39);
---
I made a mini-app to help track how much I've had to drink, and how long it will take before my body processes the alcohol. Check it out at https://drinks.innes.hu

# What is it?
An installable Progressive Web App, which allows you to record drinks you've had, and based on publicly available algorithms, estimates your current blood alcohol content, the time it will take to reach 0, and the time it will take to reach a predefined target.

# Why did you make it?
Historically, I've always enjoyed drinking beer, and sometimes I've found myself on the wrong side of 'just one more', and ended up quite drunk when I intended only to get a little tipsy. It has become more and more important to make sure this doesn't happen since my son was born, and I need to remain at least *compus mentis* in case I need to take care of him. At my own wedding, I implemented a simple rule: 1 drink per hour. It was successful, but it felt as though there must be a better, more accurate way to track my alcohol consumption. I searched the app store and found an app called 'Turnt', which was quite good, but hasn't been updated in a while and missed some key features. In particular, I wanted:

- the ability to add custom drinks (percentage and volume)
- visibility on whether one more drink would take me over the limit
- estimated time until 'safe'[^1]

# How did you make it?
SvelteKit and Skeleton/Tailwind made it very easy. I was able to build out a working prototype in just a few hours. The app takes advantage of the device's local storage to store all the drinks a person has had, and then uses the Widmark formula to estimate current blood alcohol content. Using DayJS to add times and display dates made things simpler.

The app is very low on complexity as it has no backend component, which made it particularly suitable for hosting on Vercel, which allows (as far as I can tell) unlimited small personal projects. However, it would be easy enough to build the site and publish on any static hosting.

The code is freely available on https://github.com/joeinnes/drinks.

# What special considerations did you have?
- Obviously, alcohol abuse and drink driving are very serious problems. It was important to build the app in a way that reminds the user of their personal responsibility to stay within their own limits and avoid being a tool which can be used to enable problematic drinking. I added a splash screen which users have to agree to, and a small warning at the bottom to remind users not to exceed their limits.
- Privacy is also an important consideration. All data is stored locally on the device, and nothing is sent from the user's device. [^2]
- Different people process alcohol differently. In particular, weight and gender are significant factors in how quickly your body processes alcohol. These are accounted for by the Widmark formula, but this information needs to be captured from the user.
- I wanted to be able to see whether the next drink will push me over my personal limit or not. I did this by making the buttons either yellow (you're OK now, but this drink would push you over the limit) or red (you're already over the limit).

# What limitations are there?
As privacy is a key consideration, the user is limited to a single installation, and they cannot access their details on another device. They are also likely to find that using the app in a browser rather than installed will show different data, as local storage is sandboxed for PWAs. 

Also, when the drinks are added, the 'current BAC' is hardcoded into the saved entry. This means that if a drink is deleted later, any drinks marked after the deleted drink but before the drink's deletion will have the incorrect number saved for the BAC at the start of the drink.

It's very easy to delete a drink, and impossible to restore it. In case a user accidentally deletes a drink, and re-adds it, then the BAC will be calculated only from the current time. This is also a problem if the user forgets to log the drink immediately.

The app will only persist data in line with the platform's policies. Local Storage can be quite limited in this respect. I was not able to find any concrete information on this, but iOS particularly considers PWA storage to be non-critical. Not using the app for some time, logging huge amounts of drinks, or low storage space on the device might result in data being deleted. This won't be fixed unless someone asks for it to be implemented, as the app is primarily intended to be used during a single 'session' which is not normally likely to exceed a period of several hours, and it would require a fair bit of work to implement. There also seems to be a consensus that **real** persistent data is not possible with a PWA without a backend, which would add a huge amount of complexity and privacy concerns that at the moment I can just avoid handling all together by storing the information only on the user's own device.

# Plans for the next version?
- Ask the user for the key details (gender and weight) before the app starts working. By default it is configured for an 85kg male, which will underestimate BAC for females or males who weigh less than 85kg.
- Some people may prefer to use stone or pounds to input their weight. These are easily convertible, so perhaps these options could also be offered to users.
- Set up 'favourite' drinks - saved custom drinks with predefined volumes and percentages, and offer these buttons to users rather than requiring them to add a custom drink every time.
- Add 'get help' links for people who are struggling with alcohol addiction, and links to taxi companies for those who may be considering whether they might be 'safe to drive'[^3]
- Add the functionality to recalculate 'starting BAC' when a drink is deleted.
- Add the functionality to set a date/time for a drink, so users can log drinks they forgot to log immediately, or restore drinks they deleted accidentally.
- Add a 'confirm' prompt to every drink deletion, not just the reset button.

[^1]: Note that here I don't mean 'safe to drive'. I live in a country with zero tolerance, and live by the rule of 11 hours from bottle to throttle. Here, I mean below a predefined threshold, which is configured by default as the drink-drive limit in England because it's as good a place to draw the line as any, although this is also customisable by the user. For example if a user prefers 0.05% to the standard 0.08%, that's something they can set up in the options.

[^2]: Exception here is IP address/user agent/etc., which are kept in Vercel's server logs—there's nothing personally sensitive in there, such as how many drinks, if the user has ever used the app, if the user has read the disclaimer, etc.

[^3]: As mentioned above, there's no absolute number where someone is 'safe to drive'. Any amount of alcohol will impair you both physically (slower reaction speeds, worse co-ordination) and mentally (poorer judgement).
