---
title: Why Accessibility Matters, Even When You Think It Doesn't
date: 2016-05-09T14:50:00.000Z
date_updated: 2018-03-03T15:51:59.000Z
---

When designing for the web, accessibility is often forgotten, and this is a bad thing. It’s bad because it means that users with screen readers and the like are not able to use your site.

This is unprofessional, and may even be legally classed as discrimination. There is precedent for companies being sued (and losing) for not making their website accessible. The [Wall Street Journal](http://blogs.wsj.com/law/2016/03/25/court-orders-company-to-make-website-accessible-to-the-blind/) have published a story in the past few weeksin which a judge ruled that Colorado Bag’n Baggage needed to change their website, and pay $4,000 damages to a blind man for failing to make their website. In addition, The company have been instructed to pay the plaintiff’s legal fees, expected to be more than $100,000.

If that’s not reason enough for you, there’s another, off-label (pun intended) use for Aria attributes you may not have thought of.

I work for a company that contracts for another company, who pay for a service delivered by a third party. Their website is not under my control, nor under the control of the company I work for directly, but I have to use it every day. If we want to make usability enhancements, or change the default behaviour, there’s a significant cost implication, and no-one wants to be left with the bill at the end of the day.

That said, the website leaves a lot to be desired. One of the functionalities the website offers is a monitoring screen for incoming chats in a variety of languages. These languages are displayed in small ‘windows’.

Whenever the page is refreshed, the windows (actually divs) all tile on top of each other in the top right hand corner. There is also a small memory leak which means that the page needs to be refreshed around once every four to six hours.

This shouldn’t be a problem, because this view is not really meant to be a dashboard. However in my office, we have this view on a large screen, displaying all of the incoming chats to ensure we pick them up in time.

Our chat managers organise the windows in a specific order, so that the language of the incoming chat is visible instantly. So, rather than incurring a large bill for making the modifications on the site itself, and running the risk of the vendor coming back and saying ‘wont-fix’, I decided to write a small Chrome extension that will move each window to the desired location.

At first, I thought this would be easy, as each window has a unique ID. I tried simply typing the following into the browser console.

```js
document.getElementById(#divId).style.cssText = "position: absolute; left: 0; top: 0;";
```

It worked beautifully. The targetted div (the incoming English chats) flew up to the top left hand corner of the screen.

So I refreshed, and tried the code again. Nothing happened. It appears this ID is not just unique per language queue, it is unique per session. So that idea went down the drain.

I hunted around, looking for anything I could use to target the chat windows. All of them had the same class applied, so I tried to iterate through each element, and apply the styles based on that.

This worked, but I couldn’t choose the order of the windows. We could have lived with this, but I wanted the extension to respect the order our chat managers had agreed on, so this wasn’t an acceptable solution. To make matters worse, the order of the elements seemed to change every time the page refreshed.

Eventually, I spotted the following attached to the div:

```html
aria-label="Chat with the Service Desk"
```

Each language was labelled with the prompt a user would receive when they wanted to chat to us. I could work with that.

I quickly wrote up a couple of objects to index the styles and the languages, and then wrote this:

```js
document.querySelector("[aria-label='" + langIds[lang] + "']").style.cssText = lookupStyles[lang];
```

After iterating through the languages, all of the windows snapped into place exactly as desired.

So when you’re thinking about making your site accessible, don’t just think about the straightforward stuff. Adding accessibility to your site gives others the opportunity to hook in to your software in ways you might never have considered.
