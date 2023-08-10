---
title: Focus is, of course, itself just another computation
date: 2023-01-31T18:19:00.000Z
featured_image: /media/uploads/focus.jpg
page_bg: hsl(199 52% 49%)
excerpt: I read something interesting about light field cameras recently which completely changed my perception of how light, physics, and cameras work.
---

> Focus is, of course, itself just another computation.

I came across this gem on a discussion about Lytro cameras the other day. Previously, somehow, it had become baked into my brain that focus was something fixed, and these Lytro cameras used some clever software to sharpen and blur various parts of the image. Because I was under the impression that the focus was some absolutely fixed concept, with rights and wrongs and choices made by photographers that were inherent somehow to the world they were capturing.

None of that is true.

You see these diagrams of how a lens works, and how the light all has to be very precisely refracted so it all eventually meets at a single point.

![A textbook illustration of focus](/media/uploads/1201152_1507635_ans_d884ccd6be8f4a129fd55dbd0a5e64f0.png)

But these are misleading… the reality is that those lines only show the light _coming from the object you want to focus on_. There is a lot of other light that is not represented on those diagrams. That light is focussing before or after the ‘F’ in the above diagram, but _all_ that light is passing through the lens.

![How things get 'out of focus'](/media/uploads/Camera-Lens-Focusing.jpg)

Because a lens bends light in a thoroughly predictable way, if you can capture the _angle_ of the light hitting the sensor, you can use a calculator to work out at what point that line would cross the principle axis (i.e.: at what focal length would this particular light beam be ‘in focus’).

For example, the below diagram shows an example of how knowing a light beam’s incidence and y-offset from the principle allows you to calculate the ideal focal distance for that particular light beam. Or at least, I think it does. I haven’t done trig for 20 years or so.

![Light field focussing](/media/uploads/lightfield.png)

Anyway, this comment completely blew my mind. I suddenly came to the realisation that a lens is just a mechanical calculator optimised for a specific purpose.

I wonder how many other ‘magic objects’ I don’t see the simplicity, elegance, and mathematics in.
