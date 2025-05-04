// Selecting elements
const countrySelect = document.getElementById('country');
const stateSelect = document.getElementById('state');
const citySelect = document.getElementById('city');
const getWeatherBtn = document.getElementById('getWeather');
const weatherInfo = document.getElementById('weatherInfo');
const commentInput = document.getElementById('commentInput');
const addCommentBtn = document.getElementById('addComment');
const commentList = document.getElementById('commentList');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
let comments = JSON.parse(localStorage.getItem('weatherComments')) || [];

// Load countries from API
async function loadCountries() {
  const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
  const data = await res.json();
  data.data.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.textContent = item.name;
    countrySelect.appendChild(opt);
  });
}

// Load states when a country is selected
countrySelect.addEventListener("change", async () => {
  const country = countrySelect.value;
  stateSelect.innerHTML = '<option value="">Select State</option>';
  citySelect.innerHTML = '<option value="">Select City</option>';

  const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country })
  });

  const data = await res.json();
  data.data.states.forEach(state => {
    const opt = document.createElement("option");
    opt.value = state.name;
    opt.textContent = state.name;
    stateSelect.appendChild(opt);
  });
});

// Load cities when a state is selected
stateSelect.addEventListener("change", async () => {
  const country = countrySelect.value;
  const state = stateSelect.value;
  citySelect.innerHTML = '<option value="">Select City</option>';

  const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country, state })
  });

  const data = await res.json();
  data.data.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
});

const updateHistoryUI = () => {
  historyList.innerHTML = "";
  searchHistory.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `${item.city}, ${item.country} <span>${item.time}</span> <button class="delete-btn" onclick="deleteHistory(${index})">x</button>`;
    historyList.appendChild(li);
  });
};

const updateCommentsUI = () => {
  commentList.innerHTML = "";
  comments.forEach((comment, index) => {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `${comment.text} <span>${comment.time}</span> <button class="delete-btn" onclick="deleteComment(${index})">x</button>`;
    commentList.appendChild(li);
  });
};

const deleteHistory = (index) => {
  searchHistory.splice(index, 1);
  localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
  updateHistoryUI();
};

const deleteComment = (index) => {
  comments.splice(index, 1);
  localStorage.setItem('weatherComments', JSON.stringify(comments));
  updateCommentsUI();
};

clearHistoryBtn.addEventListener('click', () => {
  searchHistory = [];
  localStorage.setItem('weatherHistory', JSON.stringify([]));
  updateHistoryUI();
});

addCommentBtn.addEventListener('click', () => {
  const text = commentInput.value.trim();
  if (text) {
    comments.push({ text, time: new Date().toLocaleString() });
    localStorage.setItem('weatherComments', JSON.stringify(comments));
    updateCommentsUI();
    commentInput.value = '';
  }
});

getWeatherBtn.addEventListener('click', async () => {
  const country = countrySelect.value;
  const state = stateSelect.value;
  const city = citySelect.value;

  if (city) {
    const currentTime = new Date().toLocaleString();
    searchHistory.push({ city, country, state, time: currentTime });
    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    updateHistoryUI();

    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=e8503fbcad1abca1c0f5ed96829881aa&units=metric`);
      const data = await res.json();

      let weatherHTML = `<h3>${city}, ${country}</h3><p>${currentTime}</p><hr>`;
      for (let i = 0; i < data.list.length; i += 8) {
        const item = data.list[i];
        weatherHTML += `
          <div>
            <p><strong>${new Date(item.dt_txt).toDateString()}</strong></p>
            <p>Temp: ${item.main.temp}°C</p>
            <p>${item.weather[0].main} - ${item.weather[0].description}</p>
          </div><hr>`;
      }
      weatherInfo.innerHTML = weatherHTML;
    } catch (error) {
      weatherInfo.innerHTML = `<p>Could not fetch weather. Try again!</p>`;
    }
  }
});

// Initial render
updateHistoryUI();
updateCommentsUI();
loadCountries(); // Load countries on start
