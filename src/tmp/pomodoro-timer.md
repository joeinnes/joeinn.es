---
title: Pomodoro Timer
slug: pomodoro-timer
date_published: 2016-12-03T23:04:00.000Z
date_updated: 2020-03-15T08:04:20.000Z
tags: Portfolio
excerpt: A pomodoro countdown timer.
---

# 
          Start your Pomodoro!
        

## 
          25:00
        

[Start](Start)[Pause](Pause)[Reset](Reset)

[Change length](Change length)

Set pomodoro length (mins)
[Cancel](Cancel)[Set](Set)

      
#set-length {
  display: none;
}

.is-danger.is-white {
  border-color: #fff;
  color: #fff;
  border-width: 1px;
  background-color: rgba(0, 0, 0, 0);
}

.is-danger.is-white:hover {
  border-color: #fff;
  color: #fff;
  border-width: 1px;
  background-color: rgba(255, 255, 255, 0.2);
}

    var pomoLength = 25 * 60 * 1000
var resumeFrom = 0
var timeRemaining = pomoLength
var secsRemaining
var minsRemaining
var tick
var paused = false
var timerRunning = false

$('#start').click(function () {
  if (!timerRunning && !paused) {
    tick = setInterval(startPomodoro, 1000)
  }
})

$('#pause').click(function () {
  if (!paused) {
    resumeFrom = timeRemaining
    clearInterval(tick)
    timerRunning = false
    paused = true
  } else {
    timeRemaining = resumeFrom
    tick = setInterval(startPomodoro, 1000)
    paused = false
    timerRunning = true
  }
})

$('#reset').click(function () {
  clearInterval(tick)
  timeRemaining = pomoLength
  secsRemaining = pad((timeRemaining / 1000) % 60, 2)
  minsRemaining = pad(Math.floor(timeRemaining / (1000 * 60)), 2)
  $('#time-remaining').html(`${minsRemaining}:${secsRemaining}`)
})

$('#change-length').click(function () {
  $('#set-length').fadeIn('slow')
})

$('#cancel-change-length').click(function () {
  $('#set-length').fadeOut('slow')
})

$('#set-new-length').click(function () {
  var newLen = $('#new-length').val()
  if (!isNaN(newLen) && isFinite(newLen)) {
    timerRunning = false
    clearInterval(tick)
    pomoLength = newLen * 60 * 1000
    timeRemaining = pomoLength
    secsRemaining = pad((timeRemaining / 1000) % 60, 2)
    minsRemaining = pad(Math.floor(timeRemaining / (1000 * 60)), 2)
    $('#time-remaining').html(`${minsRemaining}:${secsRemaining}`)
  } else {
    $('#new-length').val(25)
    console.error("Couldn't do that")
  }
  $('#set-length').fadeOut('slow')
})

function startPomodoro () {
  if (timeRemaining < 1) {
    var audio = new Audio('https://raw.githubusercontent.com/joeinnes/pomodoro-timer/master/public/cuckoo-clock.mp3')
    audio.play()
    clearInterval(tick)
    timerRunning = false
  }
  timeRemaining = timeRemaining - 1000
  if (timeRemaining < 1000) {
    timeRemaining = 0
  }
  secsRemaining = pad((timeRemaining / 1000) % 60, 2)
  minsRemaining = pad(Math.floor(timeRemaining / (1000 * 60)), 2)
  $('#time-remaining').html(`${minsRemaining}:${secsRemaining}`)
  timerRunning = true
}

function pad (num, size) {
  var s = num + ''
  while (s.length < size) {
    s = '0' + s
  }
  return s
}
