const REFERENCE_TIME_ZONES = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
];

const TIME_ZONE_LABELS = {
  UTC: 'UTC',
  'America/New_York': 'New York',
  'Europe/London': 'London',
  'Asia/Tokyo': 'Tokyo',
  'Australia/Sydney': 'Sydney',
  'Europe/Berlin': 'Berlin',
  'Asia/Dubai': 'Dubai',
  'Asia/Singapore': 'Singapore',
  'Asia/Kolkata': 'India',
  'America/Los_Angeles': 'Los Angeles'
};

const AVAILABLE_TIME_ZONES = Array.from(
  new Set([...REFERENCE_TIME_ZONES, ...Object.keys(TIME_ZONE_LABELS)])
);

export function resolveLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getDefaultTimeZones(localTimeZone = resolveLocalTimeZone()) {
  return Array.from(new Set([localTimeZone, ...REFERENCE_TIME_ZONES]));
}

export function getTimeZoneLabel(timeZone, localTimeZone = resolveLocalTimeZone()) {
  if (timeZone === localTimeZone) {
    return `Local (${timeZone})`;
  }

  if (TIME_ZONE_LABELS[timeZone]) {
    return `${TIME_ZONE_LABELS[timeZone]} (${timeZone})`;
  }

  const city = timeZone.split('/').pop()?.replace(/_/g, ' ') || timeZone;
  return `${city} (${timeZone})`;
}

export function formatClockValues(date, timeZone, use24Hour, locale = undefined) {
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  return {
    time: timeFormatter.format(date),
    date: dateFormatter.format(date)
  };
}

export function createClockState({
  localTimeZone = resolveLocalTimeZone(),
  timeZones = getDefaultTimeZones(localTimeZone),
  use24Hour = false
} = {}) {
  return {
    localTimeZone,
    use24Hour,
    timeZones: Array.from(new Set(timeZones))
  };
}

export function addTimeZone(state, timeZone) {
  if (!timeZone || state.timeZones.includes(timeZone)) {
    return state;
  }

  return {
    ...state,
    timeZones: [...state.timeZones, timeZone]
  };
}

export function removeTimeZone(state, timeZone) {
  return {
    ...state,
    timeZones: state.timeZones.filter((zone) => zone !== timeZone)
  };
}

export function toggleHourCycle(state) {
  return {
    ...state,
    use24Hour: !state.use24Hour
  };
}

function renderTimeZoneOptions(selectElement, state) {
  const selectableTimeZones = Array.from(new Set([state.localTimeZone, ...AVAILABLE_TIME_ZONES]));
  const unselected = selectableTimeZones.filter((zone) => !state.timeZones.includes(zone));

  selectElement.innerHTML = '';
  unselected.forEach((zone) => {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = getTimeZoneLabel(zone, state.localTimeZone);
    selectElement.append(option);
  });

  selectElement.disabled = unselected.length === 0;
}

function renderClocks(listElement, state, now = new Date()) {
  listElement.innerHTML = '';

  if (state.timeZones.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = 'No clocks selected. Add a time zone to begin.';
    listElement.append(emptyMessage);
    return;
  }

  state.timeZones.forEach((timeZone) => {
    const { time, date } = formatClockValues(now, timeZone, state.use24Hour);
    const card = document.createElement('article');
    card.className = 'clock-card';

    const heading = document.createElement('h3');
    heading.textContent = getTimeZoneLabel(timeZone, state.localTimeZone);

    const timeElement = document.createElement('time');
    timeElement.className = 'clock-time';
    timeElement.dateTime = now.toISOString();
    timeElement.textContent = time;

    const dateElement = document.createElement('p');
    dateElement.className = 'clock-date';
    dateElement.textContent = date;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-clock';
    removeButton.dataset.timeZone = timeZone;
    removeButton.setAttribute('aria-label', `Remove ${getTimeZoneLabel(timeZone, state.localTimeZone)} clock`);
    removeButton.textContent = 'Remove';

    card.append(heading, timeElement, dateElement, removeButton);
    listElement.append(card);
  });
}

export function bootstrapClockApp(root = document.getElementById('clock-app')) {
  if (!root) {
    return null;
  }

  let state = createClockState();

  root.innerHTML = `
    <section class="clock-shell" aria-labelledby="clock-title">
      <header>
        <h1 id="clock-title">Fathom World Clock</h1>
        <p class="subtitle">Understand what matters, everywhere.</p>
      </header>

      <div class="controls" role="group" aria-label="Clock controls">
        <label for="timezone-select" class="control-label">Add time zone</label>
        <div class="control-row">
          <select id="timezone-select" aria-label="Select time zone"></select>
          <button type="button" id="add-timezone">Add</button>
        </div>
        <label class="toggle">
          <input type="checkbox" id="hour-toggle" aria-label="Toggle 24-hour format" />
          Use 24-hour time
        </label>
      </div>

      <section>
        <h2 class="sr-only">Active clocks</h2>
        <div id="clock-list" class="clock-grid"></div>
      </section>
    </section>
  `;

  const listElement = root.querySelector('#clock-list');
  const selectElement = root.querySelector('#timezone-select');
  const addButton = root.querySelector('#add-timezone');
  const hourToggle = root.querySelector('#hour-toggle');

  function syncUi() {
    renderTimeZoneOptions(selectElement, state);
    renderClocks(listElement, state);
    hourToggle.checked = state.use24Hour;
    addButton.disabled = selectElement.disabled;
  }

  syncUi();

  addButton.addEventListener('click', () => {
    const selected = selectElement.value;
    if (!selected) {
      return;
    }

    state = addTimeZone(state, selected);
    syncUi();
  });

  listElement.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-time-zone]');
    if (!button) {
      return;
    }

    state = removeTimeZone(state, button.dataset.timeZone);
    syncUi();
  });

  hourToggle.addEventListener('change', () => {
    state = toggleHourCycle(state);
    renderClocks(listElement, state);
  });

  const intervalId = window.setInterval(() => {
    renderClocks(listElement, state);
  }, 1000);

  return {
    destroy() {
      window.clearInterval(intervalId);
      root.innerHTML = '';
    }
  };
}

if (typeof document !== 'undefined') {
  bootstrapClockApp();
}
