---
title: Weather Display
slug: weather-display
date_published: 2019-11-09T23:13:46.000Z
date_updated: 2020-07-08T12:47:17.000Z
tags: Portfolio
excerpt: App to display current weather in your location
---

# Uh oh... something went wrong

    .sk-folding-cube {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  position: relative;
  -webkit-transform: rotateZ(45deg);
          transform: rotateZ(45deg);
}

.sk-folding-cube .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  -webkit-transform: scale(1.1);
      -ms-transform: scale(1.1);
          transform: scale(1.1); 
}
.sk-folding-cube .sk-cube:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #333;
  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
          animation: sk-foldCubeAngle 2.4s infinite linear both;
  -webkit-transform-origin: 100% 100%;
      -ms-transform-origin: 100% 100%;
          transform-origin: 100% 100%;
}
.sk-folding-cube .sk-cube2 {
  -webkit-transform: scale(1.1) rotateZ(90deg);
          transform: scale(1.1) rotateZ(90deg);
}
.sk-folding-cube .sk-cube3 {
  -webkit-transform: scale(1.1) rotateZ(180deg);
          transform: scale(1.1) rotateZ(180deg);
}
.sk-folding-cube .sk-cube4 {
  -webkit-transform: scale(1.1) rotateZ(270deg);
          transform: scale(1.1) rotateZ(270deg);
}
.sk-folding-cube .sk-cube2:before {
  -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s;
}
.sk-folding-cube .sk-cube3:before {
  -webkit-animation-delay: 0.6s;
          animation-delay: 0.6s; 
}
.sk-folding-cube .sk-cube4:before {
  -webkit-animation-delay: 0.9s;
          animation-delay: 0.9s;
}
@-webkit-keyframes sk-foldCubeAngle {
  0%, 10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
    opacity: 0; 
  } 25%, 75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
    opacity: 1; 
  } 90%, 100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
    opacity: 0; 
  } 
}

@keyframes sk-foldCubeAngle {
  0%, 10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
    opacity: 0; 
  } 25%, 75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
    opacity: 1; 
  } 90%, 100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
    opacity: 0; 
  }
}
    
.column {
    width: 50%;
    padding-right:1em;
}

function getLocation () {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude
        let long = position.coords.longitude
        resolve([lat, long])
      })
    } else {
      reject('Unable to get location')
    }
  })
}

function getWeather (lat, long) {
  return new Promise((resolve, reject) => {
    const apiKey = '24da4957a0a39b21e163f0a4b5a8f82b'
    window.fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`)
      .then((data) => data.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function getPlaceImage (lat, long) {
  return new Promise((resolve, reject) => {
    let loc = new google.maps.LatLng(lat, long)
    let map = new google.maps.Map(document.createElement('div'), {
      center: loc,
      zoom: 15
    })
    let request = {
      location: loc,
      radius: '2500'
    }
    let service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, (results, status) => {
      try {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          let photoUrl = results[0].photos[0].getUrl({'maxWidth': 2000, 'maxHeight': 2000})
          resolve(photoUrl)
        } else {
          resolve('https://source.unsplash.com/random')
        }
      } catch (e) {
        console.error(e)
        resolve('https://source.unsplash.com/random')
      }
    })
  })
}

getLocation()
  .then((data) => {
    return Promise.all([getWeather(data[0], data[1]), getPlaceImage(data[0], data[1])])
      .then((data) => {
        console.log(data)
        let conditions = data[0].weather[0].description
        let image = data[1]
        fetch('https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=1&prop=extracts&exintro&explaintext&exsentences=5&exlimit=max&redirects=1&gsrsearch=' + data[0].name)
          .then((locationInfo) => locationInfo.json())
          .then((locationInfo) => {
            console.log(locationInfo)
            let resp = ''
            for (let page in locationInfo.query.pages) {
              resp = locationInfo.query.pages[page].extract
            }
            return resp
          })
          .then((locationInfo) => {
            updateView(
              conditions,
              data[0].name,
              data[0].sys.country,
              (data[0].main.temp - 272.15).toPrecision(3),
              locationInfo + '\n\nPowered by Weather Underground, Wikipedia, Google, and Tachyons. Loading cubes by Tobias Ahlin.',
              image
            )
          })
          .catch((err) => {
            handleError(err)
          })
      })
      .catch((err) => {
        handleError(err)
      })
  })
  .catch((err) => {
    handleError(err)
  })

function updateView (weather, city, country, temperature, extract, image) {
  document.getElementById('background').style.backgroundImage = 'url(\'' + image + '\')'
  document.getElementById('city').innerText = weather + ' in ' + city + ' (' + temperature + '°C)'
  document.getElementById('country-or-state').innerText = country
  document.getElementById('location-info').innerText = extract
  document.getElementById('loading').style.display = 'none'
  document.getElementById('article').style.display = 'block'
}

function handleError (err) {
  document.getElementById('error-message').innerText = 'Technical details: ' + err
  document.getElementById('loading').style.display = 'none'
  document.getElementById('error').style.display = 'block'
}
