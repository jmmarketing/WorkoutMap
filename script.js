'use strict';
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map;
let mapEvent;

// class Workout {
//   constructor(id, distance, duration, coords, date) {
//     this.id = id;
//     this.distance = distance;
//     this.duration = duration;
//     this.coords = coords;
//     this.date = date;
//   }
// }

// Initializes The Map & Listen for Click on Map
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      map = L.map('map').setView([latitude, longitude], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Event listener for Clicks on Map
      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    () => console.log('Error getting position')
  );
else {
  alert('Geolocation not supported');
}

// Listens for Submit event on Form (Currently only Enter Button)
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Shows Marker
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        //   content: '🏋🏼‍♀️ Workout',
        className: 'running-popup',
      })
    )
    .setPopupContent('🏀 Workout')
    .openPopup();

  form.classList.add('hidden');
});

inputType.addEventListener('change', function () {
  inputElevation.parentElement.classList.toggle('form__row--hidden');
  inputCadence.parentElement.classList.toggle('form__row--hidden');
});
