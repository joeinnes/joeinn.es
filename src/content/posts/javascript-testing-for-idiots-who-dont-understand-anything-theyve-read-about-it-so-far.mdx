---
title: Javascript Testing For Idiots Who Don’t Understand Anything They’ve Read About It So Far
date: 2016-09-20T15:00:00.000Z
date_updated: 2018-03-03T16:00:45.000Z
---

So, I’ve heard a lot about ‘testing’, and why it’s a great thing, and I’m fully on board. I’ve read all the ‘_red, green, refactor’_, I understand the main principles behind Test Driven Development, and I’ve wanted to start for months.

But, I’ve never been able to wade through the hipster coffee shop menu of tools that will help me to do my tests. I tried to write my own ‘testing’ module, and it looked a bit like this:

```
export default function(fn, arg, expected) {
  return fn(arg) === expected;
}
```

This was great, because I could write the following:

```
import Test from ‘./Test.js’;

function helloWorld(name) {
  return "Hello " + name;
}

var passing = Test(helloWorld, "Joe", "Hello Joe");
if (passing) {
  console.log('All tests passing!');
} else {
  console.log('One or more tests failed :(');
}
```

I was very happy, because I’d written my own test. Then I realised that this would be no good for testing my great random number generator. So I iterated. Instead of passing in an expected **value**, I’d pass in a second function to check the result of the first! Obviously I’d have to pass in the arguments provided to the first function as well…

```
export default function(fn, arg, expected) {
  let result = fn(arg);
  let passing = expected(result, arg);
}
```

Now, I could do the following:

```
import Test from ‘./Test.js’;

function getRandomNumber(max) {
  return Math.floor((Math.random() * max) + 1);
}

function isMyNumberRandom(number, max) {
  if (isNaN(number)) {
return false;
  } else if (isNaN(parseFloat(number))) {
return false;
  } else if (!isFinite(number)) {
return false;
  } else if (number > max) {
return false;
  }
  return true;
}

var passing = Test(getRandomNumber, 5, isMyNumberRandom);
if (passing) {
  console.log('All tests passing!');
} else {
  console.log('One or more tests failed :(');
}
```

Even better! So now, I can write one function to produce a value, and another to check that the value is what I want it to be! Then I wrote a function that took two arguments. Suddenly, I needed to rewrite my “Test” function again, and decided that there must be a better way.

### What is out there?

There’s very little out there in terms of documentation or beginner tutorials for someone who wants to get started testing. There are a few tutorials, but they jump from step zero to step ten without really explaining what they’re doing.

**The testing frameworks out there are just more advanced versions of what I wrote above.**

OK, so they might have exciting names like Mocha, and Chai, and Jasmine, but basically, all of them are just clever implementations of the above, with a lot of the hard work done for you.

### How do I get started?

That’s up to you, but I’ll let you know how I started: I cheated. I used Facebook’s _create-react-app_ script to generate a client side app with everything pre-configured.

```bash
npm install -g create-react-app
alias crap=create-react-app # This step is not strictly required...
crap MyApp
cd MyApp
```

Now you can run

```bash
npm test
```

and it will show you that you have one, passing test. You can open up the `App.test.js` file to work out what is your passing test, and you’ll see the following:

```
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
```

So what is this actually doing? The block of imports is showing us everything we need to run these tests (in this environment). We need React, obviously. We also need ReactDOM so React can interact with the DOM. Then finally, we need your component (which may have any number of its own imports).

Notice what we’re **not** importing:

- special ‘test’ modules
- ‘assertion libraries’ (whatever they are)
- mocks, stubs, spies
- any kind of virtual browser to run the tests.

These are already part of the implementation, all you need to do is write your tests, not configure the testing tools.

Let’s take a look in a bit more detail at the second part:

```
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
```

So, in the first line of this, we’re pretending to write real English, rather than code. This is fairly normal for tests, and helps to show what tests are failing later on. We then start an arrow function for your test. The test creates a div, and renders the component into it.

This type of test is known as a smoke test, a term which was originally used in plumbing — you’d light a fire underneath a pipe, and then watch for smoke leaking out of the system. The term was also used later (and it’s not clear whether there’s any direct relationship between the two uses) for testing electronics — plug it in, switch it on, and if smoke comes out, something went wrong. Whatever the root of this term in software development, what it basically means is an incredibly simple test to confirm that everything’s running more or less as expected, without having to do any careful analysis.

Although this is a great first test, I’m not actually a big fan of this as a demonstration, because this is more or less the only ‘test’ you’ll ever write like this. In loose terms, as far as I can work out, this whole thing is wrapped in a ‘try’ block, and if an error is thrown, the test fails, but you can’t really do anything clever with it apart from check for exceptions thrown by your app (which you’ll see in the console anyway).

### Test Driven Development — For Real

So, the first step in TDD is to write a failing test. Well, theoretically. The first step really is to decide what you want to **achieve**. To keep things nice and simple, and to get started, I’m going to write a simple component which renders a card with a title.

So the first thing I’m going to need is a Card component. Remember the TDD mantra — red, green, refactor — so the first thing I need is a failing test. It’s up to you how you organise your tests, but so far I’ve been doing it as one ‘test’ file per component, so I created a new test file: Card.test.js

#### Red

In it, I imported React and the React DOM, as well as my component.

```
import React from 'react';
import ReactDOM from 'react-dom';
import Card from './Card';
```

OK, so, now I’ve got everything I need to start testing, so I’ll just write the same test as I had before (except with the ‘Card’ component). I’m actually going to add a wrapper around the whole thing which will show me what I’m testing — this is important when your tests have logical ‘categories’, like components.

```
describe('a card', () => {
  it('renders without crashing', () => {
const div = document.createElement('div');
ReactDOM.render(<Card />, div);
  });
});
```

So, I run the test and sure enough, I get one passing test (for the app component) and one failing test (for the card component).

We can move on now and start writing code.

#### Green

You’re not reading this article because you want to learn React, so I’m going to assume you know how to write a simple component. The trick to ‘getting to green’ is to write the **minimum** amount of code possible to pass the test. Don’t get all fancy with state initialisation, or click handlers, or anything — your test only covers the existence of the component — so just write the simplest render function you can imagine:

```
render() {
  return <div></div>
}
```

Run your tests again — both are now passing!

#### Refactor

Well, there’s not really much that needs refactoring here, this is the simplest possible code, so let’s write a new test.

#### Red

First, let’s think about what functionality we want — we want a title to be displayed on our card in an h2 tag. Furthermore, we want to be able to pass in this title as part of a ‘data’ prop.

At the moment, we don’t have the libraries we need to actually read the component, so we’re going to use AirBnB’s enzyme utilities. First up, let’s install it:

```bash
npm install --save-dev enzyme
```

Enzyme has LOTS of utilities, and I have no idea what they all do, but the one I want is ‘shallow’, which will allow me to render a single component and check it for stuff. Here, I’m going to import it, and describe the test.

```
import { shallow } from 'enzyme';

describe('a card', () => {
  it('renders without crashing', () => { ... });
  it('displays a title when this is passed to it', () => {

  });
});
```

I haven’t actually written any test code yet, so if I run this test, it’ll report as passing. Although this is an extreme example, it demonstrates why it’s important to make sure you get a ‘red’ before you start coding.

So now I’m going to start writing the code for the test itself. First up, I’m going to define the ‘data’ prop which I’ll pass in to the component

```
const data = {
  title: "Test title"
};
```

Then, I need to write up what this is going to look like when it’s rendered correctly (in JSX)

```
const expectedResult = <h2>Test title</h2>;
```

Now, rather than rendering the component as I did before, I’m going to use Enzyme’s _shallow_ utility, and I’m going to call this the ‘wrapper’ (because this is the ‘wrapper’ for the h2).

```
const wrapper = shallow(<Card data={data}/>);
```

The last thing I’m going to do is to write an _assertion_, which is more complicated than it sounds. It’s just a clever way of writing the test which is nice and easy to read:

```
expect(wrapper.contains(expectedResult)).toEqual(true);
```

This _assertion_ is based on the Jest framework (which comes out of the box with create-react-app), and you can read more about its APIs [here](https://facebook.github.io/jest/docs/api.html#writing-assertions-with-expect) — basically, you write ‘expect’, then an expression, then you chain it to one of the methods that will compare the evaluated expression to something. The ‘wrapper.contains’ here comes from the enzyme’s shallow utility — you can read its API [here](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md).

So all together, my test looks like this:

```
it('displays a title when this is passed to it', () => {
  const data = {
title: "Test title"
  };
  const expectedResult = <h2>Test title</h2>;
  const wrapper = shallow(<Card data={data}/>);
  expect(wrapper.contains(expectedResult)).toEqual(true);
});
```

I run this test — and it fails. Great. Now you can write some more code!

#### Green

Again, write the absolute minimum code you need for the test to pass:

```
render() {
  return <h2>Test title</h2>
}
```

#### Refactor

OK, that feels bad. The test is passing, but I’m cheating! Get used to it. TDD is about doing the bare minimum. If you can pass the test, then you need to write another one. Don’t delete the old one though! It’ll be useful for making sure you’re not going backwards when you’re writing new code.

#### Red

I don’t want myself to cheat any more, so I’m going to recalculate the title every time I run the test:

```
it('displays an arbitrary title when this is passed to it', () => {
  const randomString = Math.random().toString(36).replace(/\[^a-z\]+/g, '').substr(0, 5);
  const data = {
title: randomString
  };
  const expectedResult = <h2>{randomString}</h2>;
  const wrapper = shallow(<Card data={data}/>);
  expect(wrapper.contains(expectedResult)).toEqual(true);
});
```

#### Green

I might as well do it properly now…

```
render() {
  return <h2>{this.props.data.title}</h2>
}
```

#### Refactor

This will work, and it fits the requirement of the test. I can’t simplify this code any more, so I’ll move on. While I was rethinking this code though, I realised that if no data is passed to the component, it won’t even render — because it’ll try and access the ‘title’ property of ‘data’, which will be undefined. Time for a new test!

#### Red

```
it('renders, but is empty if it doesn't get any data', () => {
  const expectedResult = <h2></h2>;
  const wrapper = shallow(<Card />);
  expect(wrapper.contains(expectedResult)).toEqual(true);
});
```

#### Green

The simplest way I can think of is chaining up an if statement or two to pass this test:

```
render() {
  if (this.props.data && this.props.data.title) {
let title = this.props.data.title;
return <h2>{this.props.data.title}</h2>
  } else {
return <h2></h2>;
  }
}
```

#### Refactor

The code above works well, but won’t be too useful in future in case I want to render anything else (like a description) onto the card. Instead, I’m going to put the whole thing in a try/catch block. That way, I can add in additional things that will be required to the try section without writing lots more ugly if statements.

```
render() {
  try {
let title = this.props.data.title;
return <h2>{this.props.data.title}</h2>
  } catch (err) {
return <h2></h2>;
  }
}
```

### Conclusion

So that’s more or less it. Lather, rinse and repeat. Keep iterating — think of a feature, add a failing test, and then add code to pass the test. It’s nowhere near as complicated as it was when I first started reading about it. By now, you should have a nice set of passing tests to get you started, and a much better idea of the ‘hows’ of testing.
