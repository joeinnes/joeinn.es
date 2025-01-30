---
layout: blog
title: NotesVac
draft: false
date: 2025-02-01T00:00:00
date_updated: 2025-02-01T00:00:00
featured_image: ''
page_bg: ''
excerpt: 'Soft launch of my first 2025 project launch: NotesVac, an AI-enhanced companion for your handwritten notes.'
---
NotesVac is built on an idea I had some time ago.

A few years ago I bought a RocketBook, which is basically a reusable notebook, where you can clean the pages and start again. I loved my RocketBook itself, but I always felt as though the handwriting transcription that came from the RocketBook service was below par, and ultimately I gave up on using it. But then I came across https://paperwebsite.com/, which basically runs transcription on the handwriting, and then throws that to GPT-3 (https://news.ycombinator.com/item?id=29194969 - may have been updated since).

I wanted to build an app which bridged the two: use the best-in-class OCR on my handwritten bullet journal.

I built a barely-functioning version of this app some time ago, but this is a ground-up rewrite which doesn’t share anything beyond the name and the idea with the original.

## Stuff I learned while I was building

- I used an SQLite WASM library called SQLocal to bring SQLite to the browser (itself a layer over SQLite WASM), and it’s persisted to OPFS. I like this as an idea, but I’m missing some of the stuff I’d need to pick this as my top choice again (primarily sync)

- I used Kysely and it’s very user friendly. I very much enjoyed Kysely as a query builder and for sure will use it again.

- I learned how to use Structured Outputs when calling the OpenAI API, and discovered that it’s possible to pass a JSON schema into the API and it will return data in a structured format. This made my life much easier.

- I learned about running WebGPU code (to enable LLMs in-browser), but eventually decided not to build that out because the WebGPU APIs are not available in every browser, and every download of the weights is literally **gigabytes** of data.

- I mostly used the Sailboat and HyperUI component libraries for Tailwind, which made front-end styling super simple and I think it looks pretty good.

- I spent a LOT of time researching Local First while I was building NotesVac. I feel like there’s still a lot to learn, but the simplicity of no logins and just… start typing on your computer to make notes is great.

## My Favourite Feature

My favourite feature is actually a very late addition: a quick search function. Pressing <kbd>⌘</kbd> <kbd>S</kbd> jumps straight to the 'search' bar. This has the secondary purpose of hijacking the browser's default behaviour of 'saving' the webpage as an HTML archive
