const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
let coords = ["28.7041", "77.1025"];
const weatherData = {
  current: {},
  daily: [],
  hourly: [],
};
let locationName = "New Delhi, India";
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const unitConvert = {
  temp: { use: true, convert: (val) => (val * 1.8 + 32).toFixed(2) },
  speed: {
    use: true,
    convert: (val) => (val * 0.6213712).toFixed(2),
  },
  height: {
    use: true,
    convert: (val) => (val * 0.03937008).toFixed(2),
  },
};

const getData = async () => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,weather_code,precipitation&timezone=auto`,
  );

  const data = await res.json();
  //current
  weatherData.current = {
    code: data.current.weather_code,
    temperature: unitConvert.temp.use
      ? `${unitConvert.temp.convert(data.current.temperature_2m)} &#176;F`
      : `${data.current.temperature_2m} &#176;C`,
    humidity: `${data.current.relative_humidity_2m}%`,
    apparent: unitConvert.temp.use
      ? `${unitConvert.temp.convert(data.current.apparent_temperature)} &#176;F`
      : `${data.current.apparent_temperature} &#176;C`,
    wind: unitConvert.speed.use
      ? `${unitConvert.speed.convert(data.current.wind_speed_10m)} km/h`
      : `${data.current.wind_speed_10m} mph`,
    ppt: unitConvert.height.use
      ? `${unitConvert.height.convert(data.current.precipitation)} in`
      : `${data.current.precipitation} mm`,
  };
  //daily
  const { time, temperature_2m_min, temperature_2m_max, weather_code } =
    data.daily;

  weatherData.daily = time.map((dateStr, index) => {
    const dayIndex = new Date(dateStr).getDay();
    return {
      day: days[dayIndex],
      min: temperature_2m_min[index],
      max: temperature_2m_max[index],
      code: weather_code[index],
    };
  });
  //hourly
  weatherData.hourly = data.hourly.time
    .map((timeStr, index) => ({
      time: timeStr,
      temp: unitConvert.temp.use
        ? `${unitConvert.temp.convert(data.hourly.temperature_2m[index])} &#176;F`
        : `${data.hourly.temperature_2m[index]} &#176;C`,
      code: data.hourly.weather_code[index],
    }))
    .filter((item) => new Date(item.time) > new Date())
    .slice(0, 8)
    .map((item) => ({
      hour: new Date(item.time).toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
      }),
      temp: item.temp,
      code: item.code,
    }));
  setMainData();
  setDailyData();
  setHourlyData();
};
const setWeatherIcon = (code) => {
  if (code === 0) return "./assets/images/icon-sunny.webp";
  else if (code === 1 || code === 2)
    return "./assets/images/icon-partly-cloudy.webp";
  else if (code === 3) return "./assets/images/icon-overcast.webp";
  else if (code === 45 || code === 48) return "./assets/images/icon-fog.webp";
  else if (code === 51 || code === 53 || code === 55)
    return "./assets/images/icon-drizzle.webp";
  else if (code === 61 || code === 63 || code === 65)
    return "./assets/images/icon-rain.webp";
  else if (code === 71 || code === 73 || code === 75)
    return "./assets/images/icon-snow.webp";
  else if (
    code === 80 ||
    code === 81 ||
    code === 82 ||
    code === 95 ||
    code === 96 ||
    code === 99
  )
    return "./assets/images/icon-storm.webp";
};

const setMainData = () => {
  const location = document.querySelector("#location");
  const icon = document.querySelector("#currentTemp>img");
  const temp = document.querySelector("#currentTemp>h2");
  const wind = document.querySelector("#wind+span");
  const humidity = document.querySelector("#humidity+span");
  const apparent = document.querySelector("#apparent+span");
  const ppt = document.querySelector("#ppt+span");
  const time = document.querySelector("#time");

  location.innerText = locationName;
  time.innerHTML = new Date().toLocaleDateString("en-US", options);
  icon.src = setWeatherIcon(weatherData.current.code);
  temp.innerHTML = weatherData.current.temperature;
  ppt.innerHTML = weatherData.current.ppt;
  humidity.innerHTML = weatherData.current.humidity;
  apparent.innerHTML = weatherData.current.apparent;
  wind.innerHTML = weatherData.current.wind;
};
const setDailyData = () => {
  Array.from(document.querySelectorAll(".daily-card")).forEach((card, i) => {
    const data = weatherData.daily[i];

    const day = card.querySelector(".day");
    const icon = card.querySelector(".icon>img");
    const max = card.querySelector(".max");
    const min = card.querySelector(".min");

    day.innerHTML = data.day;
    icon.src = setWeatherIcon(data.code);
    min.innerHTML = data.min;
    max.innerHTML = data.max;
  });
};
const setHourlyData = () => {
  Array.from(document.querySelectorAll(".hour-card")).forEach((card, i) => {
    const data = weatherData.hourly[i];
    const hour = card.querySelector(".hour>span");
    const icon = card.querySelector(".hour>img");
    const temp = card.querySelector(".hour-temp");

    icon.src = setWeatherIcon(data.code);
    hour.innerHTML = data.hour;
    temp.innerHTML = data.temp;
  });
};
getData();

const getLocation = async (e) => {
  e.preventDefault();
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${e.target.querySelector("#searchInput").value}&count=1&language=en&format=json
`,
  );
  if (res.ok) {
    const data = await res.json();
    console.log(data.results[0]);
    coords = [data.results[0].latitude, data.results[0].longitude];
    locationName = `${data.results[0].admin1}, ${data.results[0].country}`;
  }
  getData();
};

const searchForm = document.querySelector("#search");
searchForm.addEventListener("submit", getLocation);

// Dropdowns
document.querySelectorAll(".dropdown").forEach((d) => {
  d.querySelector(".dropdown-title").addEventListener("click", () => {
    d.classList.toggle("active");
  });
});
