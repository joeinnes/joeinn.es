---
layout: blog
title: NotesVac
draft: false
date: 2025-02-01T00:00:00
date_updated: 2025-02-01T00:00:00
featured_image: /media/uploads/Screenshot 2025-01-30 at 13-42-06 NotesVac.png
page_bg: '#3787c0'
excerpt: 'Soft launch of my first 2025 project launch: NotesVac, an AI-enhanced companion for your handwritten notes.'
---
[NotesVac](https://notesvac.vercel.app) is built on an idea I had some time ago.

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

## My Favourite Feature

My favourite feature is actually a very late addition: a quick search function. Pressing <kbd>⌘</kbd> <kbd>S</kbd> jumps straight to the 'search' bar. This has the secondary purpose of hijacking the browser's default behaviour of 'saving' the webpage to your desktop, which is a blocking function, and interrupts the user's typing, which is very annoying. 

There _is_ a trade-off here, because a user who is distractedly just tapping <kbd>⌘</kbd> <kbd>S</kbd> to save their note will find that their cursor jumps to the search bar, and they can't keep adding to their note.

## My Favourite Piece of Code

![await db?.transaction\\\(\\\).execute\\\(async \\\(trx\\\) => {   const transcription = await trx     .insertInto\\\('transcription'\\\)     .values\\\({       content: res?.text,       keywords: res?.keywords || '',       summary: res?.summary || '',       id: crypto.randomUUID\\\(\\\),       image_hash: hash,       image: imagePreview,       is_deleted: false,     }\\\)     .returning\\\('id'\\\)     .executeTakeFirstOrThrow\\\(\\\)   return await trx     .insertInto\\\('note_transcription'\\\)     .values\\\({       note_id: note.id,       transcription_id: transcription.id,     }\\\)     .returningAll\\\(\\\)     .executeTakeFirst\\\(\\\) }\\\)](/media/uploads/carbon.png)

Why is this my favourite piece of code? It's a pretty simple snippet. But it's the first time I've ever really tried to use database transactions, and this seemed to be the perfect example. What it's doing here is just inserting a row into a table, getting the id associated with the newly inserted row, and adding that as the foreign key in a join table. Previously I've always trusted ORMs/DB tools to do this for me (normally you can insert with the relations already added), so it's the first time I've taken care of it myself.

## What DIDN'T I build out/what are the next steps for this project?

Realistically, I'm not likely to come back to this for a while. The handwriting recognition is decent, but still leaves a bit to be desired. I am sure that this will improve with time, and I'll add a new option for the new AI model.

I really wanted to build an 'RAG' type tool, which would allow for 'chatting with your notes', but my progress through the literature there wasn't great, and on top of that, I realised that I wanted my chats to also be able to edit notes, which was a huge additional chunk of work. I decided not to do it, in order to be able to ship _something_ in January, rather than abandoning this to my graveyard of broken, unfinished projects.

There was also a feature I wanted to add which allows you to use a single physical page to correspond to multiple virtual notes. The prompt includes the separator I was planning on using for this, but the logic needed again seemed like it would push me over what I could manage in January. Most of the groundwork is already there for this feature - the join table means many-to-many is already possible, there are even UI affordances for managing linked transcriptions, but there was just too much planning to do (if you create two notes, which one do you display? what if a transcription is deleted? what if a note is associated with a transcription and gets deleted? what if you have a transcription before the note is saved? what if you try to import an transcription into an existing note, but the transcription is two 'notes' worth of content?).

NotesVac is available at https://notesvac.vercel.app.
