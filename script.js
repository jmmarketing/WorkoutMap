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

/////////////////////////
// Application Data
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    // this.id = id;
    this.distance = distance; // in Miles
    this.duration = duration; // in Min.
    this.coords = coords; // Lat & Long
    // this.date = date;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); //Per hour so divide by 60
    return this.speed;
  }
}

/////// Testing Classes
const testRunner = new Running([32.9425, -117.256565], 10, 120, 134);
const testCycle = new Cycling([32, -117.25], 43.2, 30, 400);
console.log(testCycle, testRunner);

///////////////////////////////////////
// Application Architecture.
class App {
  #map;
  #mapEvent;
  constructor() {
    // Will Trigger Method On Child Class Creation
    this._getPosition();
    // Adds Listens for Submit event on Form (Currently only Enter Button)
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Adds Event Listener on Form Change (Doesnt call this in function so no need to bind)
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    // Initializes The Map & Listen for Click on Map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        console.log('Error getting position')
      );
    } else {
      alert('Geolocation not supported');
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Event listener for Clicks on Map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.parentElement.classList.toggle('form__row--hidden');
    inputCadence.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // Shows Marker
    const { lat, lng } = this.#mapEvent.latlng;
    console.log(lat, lng);
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}

// Will Trigger Constructor Function Automatically
const app = new App();
