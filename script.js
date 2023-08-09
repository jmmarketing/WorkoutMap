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
  type = 'running';
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
  type = 'cycling';
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
// const testRunner = new Running([32.9425, -117.256565], 10, 120, 134);
// const testCycle = new Cycling([32, -117.25], 43.2, 30, 400);
// console.log(testCycle, testRunner);

///////////////////////////////////////
// Application Architecture.
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    // Will Trigger Method On Child Class Creation
    this._getPosition();
    // Adds Listens for Submit event on Form (Currently only Enter Button)
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Adds Event Listener on Form Change (Doesnt call this in function so no need to bind)
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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

    const { lat, lng } = this.#mapEvent.latlng;

    const coords = [lat, lng];
    const distanceVal = inputDistance.value;
    const durationVal = inputDuration.value;
    const cadenceVal = inputCadence.value;
    const elevationVal = inputElevation.value;
    let workout;

    if (inputType.value === 'running') {
      workout = new Running(coords, distanceVal, durationVal, cadenceVal);
    } else {
      workout = new Cycling(coords, distanceVal, durationVal, elevationVal);
    }
    this.#workouts.push(workout);
    this._renderWorkoutMarker(coords, inputType.value);
    this._renderWorkout(workout);
    console.log(this.#workouts);
  }

  _renderWorkout(workout) {
    const isRunning = workout.type === 'running';

    const workoutDetails = `<li class="workout workout--${
      workout.type
    }" data-id="${workout.id}">
    <h2 class="workout__title">${isRunning ? 'Running' : 'Cycling'} on ${
      months[workout.date.getMonth()]
    } ${workout.date.getDate()}</h2>
    <div class="workout__details">
      <span class="workout__icon">${isRunning ? '🏃‍♂️' : '🚴🏽‍♂️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">mi</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${
        isRunning ? workout.pace : workout.speed
      }</span>
      <span class="workout__unit">${isRunning ? 'min/mi' : 'mph'}</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${isRunning ? '🦶🏼' : '⛰'}</span>
      <span class="workout__value">${
        isRunning ? workout.cadence : workout.elevationGain
      }</span>
      <span class="workout__unit">${isRunning ? 'spm' : 'ft'}</span>
    </div>
  </li>`;

    containerWorkouts.insertAdjacentHTML('beforeend', workoutDetails);
  }

  _renderWorkoutMarker(coords, classType) {
    // Shows Marker
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          content: `${
            classType === 'running' ? '🏃🏽‍♂️ Running' : '🚴🏽‍♂️ Cycling'
          } Workout`,
          className: `${classType}-popup`,
        })
      )
      // .setPopupContent('🏀 Workout')
      .openPopup();
    this._hideForm();
  }

  _hideForm() {
    form.classList.add('hidden');
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _moveToPopup(e) {
    if (e.target.closest('.workout').dataset.id) {
      const workoutId = e.target.closest('.workout').dataset.id;
      for (let workoutItem of this.#workouts) {
        if (workoutItem.id === workoutId) {
          this.#map.setView(workoutItem.coords, 13);
        }
      }
    }
  }

  _setLocalStorage() {}
  _getLocalStorage() {}
  reset() {}
}

// Will Trigger Constructor Function Automatically
const app = new App();
