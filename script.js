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

  _setDescription() {
    this.description = `${this.type === 'running' ? 'Running' : 'Cycling'} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = (this.duration / this.distance).toFixed(1);
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(1); //Per hour so divide by 60
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
    setTimeout(this._getLocalStorage(), 1500);
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    form.classList.add('hidden');
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _toggleElevationField() {
    inputElevation.parentElement.classList.toggle('form__row--hidden');
    inputCadence.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // Helper functions for Validation
    function isValid(...inputs) {
      return inputs.every(inp => Number.isFinite(inp));
    }
    function aboveZero(...inputs) {
      return inputs.every(inp => inp > 0);
    }

    const type = inputType.value;
    const { lat, lng } = this.#mapEvent.latlng;

    const coords = [lat, lng];
    const distanceVal = +inputDistance.value;
    const durationVal = +inputDuration.value;
    let workout;

    ///// Creates Running Child Workout
    if (type === 'running') {
      const cadenceVal = +inputCadence.value;
      // Form Validation
      if (
        !isValid(distanceVal, durationVal, cadenceVal) ||
        !aboveZero(distanceVal, durationVal, cadenceVal)
      )
        return alert('Positive Numbers Only');

      workout = new Running(coords, distanceVal, durationVal, cadenceVal);
    }

    /// Creates Cycling Child Workout
    if (type === 'cycling') {
      const elevationVal = +inputElevation.value;
      // Form Validation
      if (
        !isValid(distanceVal, durationVal, elevationVal) ||
        !aboveZero(distanceVal, durationVal)
      )
        return alert('Positive Numbers Only');

      workout = new Cycling(coords, distanceVal, durationVal, elevationVal);
    }

    // Next Steps with Child Workout
    this.#workouts.push(workout);
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    this._setLocalStorage();
    console.log(workout);

    this._hideForm();
  }

  _renderWorkout(workout) {
    const isRunning = workout.type === 'running';

    const workoutDetails = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
       <h2 class="workout__title">${workout.description}</h2>
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

    form.insertAdjacentHTML('afterend', workoutDetails);
  }

  _renderWorkoutMarker(workoutObj) {
    // Shows Marker
    L.marker(workoutObj.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          // content: `${
          //   workoutObj.type === 'running' ? 'Running' : 'Cycling'
          // } on ${months[workout.date.getMonth()]} ${workout.date.getDate()}`,
          className: `${workoutObj.type}-popup`,
        })
      )
      .setPopupContent(
        `${workoutObj.type === 'running' ? '🏃🏽‍♂️ Running' : '🚴🏽‍♂️ Cycling'} on ${
          months[workoutObj.date.getMonth()]
        } ${workoutObj.date.getDate()}`
      )
      .openPopup();
  }

  _moveToPopup(e) {
    if (e.target.closest('.workout')?.dataset.id ?? undefined) {
      const workoutId = e.target.closest('.workout').dataset.id;
      for (let workoutItem of this.#workouts) {
        if (workoutItem.id === workoutId) {
          this.#map.setView(workoutItem.coords, 13);
        }
      }
    }
  }

  _setLocalStorage() {
    const localWorkouts = JSON.stringify(this.#workouts);
    localStorage.setItem('savedWorkouts', localWorkouts);
  }

  _getLocalStorage() {
    if (localStorage.savedWorkouts) {
      const storedWorkouts = JSON.parse(localStorage.getItem('savedWorkouts'));
      console.log(storedWorkouts);

      for (const workout of storedWorkouts) {
        console.log(workout);
        //Needed to add new Date because parsing localstorage changes to string, that can not use .getMonth in _renderWorkoutMarker - Converts back to Date object
        workout.date = new Date(workout.date);
        this._getWorkouts().push(workout);
        this._renderWorkout(workout);
        this._renderWorkoutMarker(workout);
      }
    }
  }

  _getWorkouts() {
    return this.#workouts;
  }
  reset() {}
}

// Will Trigger Constructor Function Automatically
const app = new App();
