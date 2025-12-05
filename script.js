const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

const weatherData = {
  current: {},
  daily: [],
};
const getData = async () => {
  const res = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,weather_code,precipitation"
  );

  const data = await res.json();
  console.log(data.daily);
  //current
  weatherData.current = {
    code: data.current.weather_code,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    apparent: data.current.apparent_temperature,
    wind: data.current.wind_speed_10m,
    ppt: data.current.precipitation,
  };
  //daily
  const { time, temperature_2m_min, temperature_2m_max, weather_code } =
    data.daily;

  weatherData.daily = time.map((dateStr, index) => {
    const dayIndex = new Date(dateStr).getDay(); // 0–6
    return {
      day: days[dayIndex],
      min: temperature_2m_min[index],
      max: temperature_2m_max[index],
      code: weather_code[index],
    };
  });

  setMainData();
  setDailyData();
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
  const icon = document.querySelector("#currentTemp>img");
  const temp = document.querySelector("#currentTemp>h2");
  const wind = document.querySelector("#wind+span");
  const humidity = document.querySelector("#humidity+span");
  const apparent = document.querySelector("#apparent+span");
  const ppt = document.querySelector("#ppt+span");

  icon.src = setWeatherIcon(weatherData.current.code);
  temp.innerHTML = weatherData.current.temperature;
  ppt.innerHTML = `${weatherData.current.ppt} mm`;
  humidity.innerHTML = `${weatherData.current.humidity} %`;
  apparent.innerHTML = `${weatherData.current.apparent} `;
  wind.innerHTML = `${weatherData.current.wind} km/h`;
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
getData();
