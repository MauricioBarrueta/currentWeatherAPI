const key = 'a989269a6f7d0e23d578e48436c457dc';
const lang = 'es';

/* Obtiene los permisos de ubicación */
var latInput = document.getElementById('lat'), lonInput = document.getElementById('lon');
window.addEventListener('load', () => {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {         
            latInput.value = position.coords.latitude;          
            lonInput.value = position.coords.longitude;           
        })
    }
})

const body = document.getElementById('body'), weatherCityContainer = document.querySelector('.weather-city-container'), weatherCard = document.querySelector('.weather-card'), 
    weatherDetails = document.querySelector('.weather-details'), humidityDiv = document.querySelector('.humidity'), windDiv = document.querySelector('.wind'),
    sunsetSunriseDiv = document.querySelector('.sunrise-sunset-container'), sunriseDiv = document.querySelector('.sunrise-div'), sunsetDiv = document.querySelector('.sunset-div'),
    cityInfo = document.querySelector('.city-info');


const clearCardContent = () => {
    weatherCard.innerHTML = humidityDiv.innerHTML = windDiv.innerHTML = sunriseDiv.innerHTML = sunsetDiv.innerHTML = cityInfo.innerHTML = '';
}

/* Consulta el clima de acuerdo con la ciudad o las coordenadas ingresadas */
const searchButtons = document.querySelectorAll('.city-name-input button, .lat-lot-btn')
searchButtons.forEach(button => {
    button.addEventListener('click', () => {
        const cityInput = document.querySelector('.city-name-input input');

        const url = button.classList.contains('lat-lot-btn')
            ? `https://api.openweathermap.org/data/2.5/weather?lat=${latInput.value}&lon=${lonInput.value}&units=metric&appid=${key}&lang=${lang}`
            : `https://api.openweathermap.org/data/2.5/weather?q=${cityInput.value}&units=metric&appid=${key}&lang=${lang}`;

        fetch(url)
            .then(res => res.status === 404 || res.status === 400 ? alertSpan() : res.json())
            .then(data => {
                if (data.cod === 200) {
                    weatherCityContainer.style.width = '400px'
                    weatherCityContainer.style.height = '100%';
                    weatherCityContainer.style.background = 'linear-gradient(to bottom, #FFFFFF 71%, #E9ECEF 50%)'
                    weatherCard.style.opacity = '1';
                    clearCardContent();
                    alertSpanText.style.display = 'none';

                    if (button.classList.contains('lat-lot-btn')) {
                        cityInput.value = '';
                    } else {
                        latInput.value = lonInput.value = '';
                    }

                    renderWeatherData(data);
                }
            })
            .catch(error => console.error(error));
    });
});

/* Renderiza los datos para posteriormente mostrarlos */
const renderWeatherData = (data) => {
    const countryName = document.createElement('p');
    countryName.classList.add('weather-city-name');
    countryName.textContent = data.name + ', ' + data.sys.country;

    /* Se obtiene la hora actual de acuerdo a la zona horaria */
    const timezoneInMinutes = data.timezone / 60;
    const countryTimeUTC = document.createElement('p');
    countryTimeUTC.classList.add('city-utc-time');

    cityInfo.appendChild(countryName);
    cityInfo.appendChild(countryTimeUTC);
    weatherCard.appendChild(cityInfo);

    const updateCountryTime = () => {
        countryTimeUTC.textContent = moment().utcOffset(timezoneInMinutes).format('HH:mm:ss A');
    };

    updateCountryTime();

    /* Actualiza la hora de la ciudad cada segundo */
    setInterval(updateCountryTime, 1000);

    const weatherImg = document.createElement('img');
    weatherImg.classList.add('weather-city-img');

    const weatherCondition = data.weather[0].main;

    switch (weatherCondition) {
        case 'Clear':
            weatherImg.src = 'svg/clear-day.svg';
            break;
        case 'Rain':
            weatherImg.src = 'svg/rainy.svg';
            break;
        case 'Snow':
            weatherImg.src = 'svg/snowy.svg';
            break;
        case 'Clouds':
            weatherImg.src = 'svg/cloudy.svg';
            break;
        case 'Mist':
            weatherImg.src = 'svg/mist.svg';
            break;
        case 'Haze':
            weatherImg.src = 'svg/haze.svg';
            break;
        case 'Smoke':
            weatherImg.src = 'svg/smoke.svg';
            break;
        case 'Thunderstorm':
            weatherImg.src = 'svg/thunder.svg';
            break;
        default:
            weatherImg.src = 'svg/not-available.svg';
    }

    weatherCard.appendChild(weatherImg);

    /* Se obtienen solo los primeros 2 dígitos de la temperatura */
    const formatLonLatTempValues = (tempValue) => {
        return String(tempValue).substring(0, 2);
    };

    const temperatureData = document.createElement('p');
    temperatureData.classList.add('temperature');
    temperatureData.innerHTML = `${parseInt(formatLonLatTempValues(data.main.temp))}<span>°C</span>`;
    weatherCard.appendChild(temperatureData);
    
    const cityTempData = document.createElement('div')
    cityTempData.classList.add('city-temp-data')

    const temperatureFeel = document.createElement('span');
    temperatureFeel.classList.add('temperature-feels-like');
    temperatureFeel.innerHTML = `Sensación: ${parseInt(formatLonLatTempValues(data.main.feels_like))}<span>°C</span>`;

    const maxminTemperatureData = document.createElement('span');
    maxminTemperatureData.classList.add('temperature-max-min');
    maxminTemperatureData.innerHTML = `
        Máx: ${parseInt(formatLonLatTempValues(data.main.temp_max))}<span>°C</span>
        &nbsp;/&nbsp;
        Mín: ${parseInt(formatLonLatTempValues(data.main.temp_min))}<span>°C</span>`;
    
    cityTempData.appendChild(temperatureFeel)
    cityTempData.appendChild(maxminTemperatureData)
    weatherCard.appendChild(cityTempData)

    const temperatureDescriptionData = document.createElement('p');
    temperatureDescriptionData.classList.add('description');
    temperatureDescriptionData.innerHTML = `${data.weather[0].description}`;
    weatherCard.appendChild(temperatureDescriptionData);

    const humidityValue = document.createElement('span');
    humidityValue.innerHTML = `${data.main.humidity}% <p>Humedad</p>`;
    humidityDiv.appendChild(humidityValue);

    const windValue = document.createElement('span');
    windValue.innerHTML = `${parseInt(data.wind.speed)} Km/h <p>Viento</p>`;
    windDiv.appendChild(windValue);

    weatherCard.appendChild(weatherDetails);

    /* Se obtiene la hora de amanecer y anochecer */
    const { sunrise, sunset } = data.sys;
    /* Se obtiene el timestamp actual */
    const currentUnixTime = Math.floor(Date.now() / 1000);
    /* Se determina si es de noche o está atardeciendo */
    const sunsetTransition = 60 * 60;

    const isNight = currentUnixTime < sunrise || currentUnixTime >= sunset;
    const isSunset = currentUnixTime >= sunset - sunsetTransition && currentUnixTime < sunset;

    /* Fondo de la página de acuerdo al clima y la hora */
    if (weatherCondition === 'Rain' || weatherCondition === 'Drizzle' || weatherCondition === 'Thunderstorm') {
        document.body.style.background = 'var(--bg-rainy)';
    } else if (isNight) {
        document.body.style.background = 'var(--bg-night)';
    } else if (isSunset) {
        document.body.style.background = 'var(--bg-sunset)';
    } else {
        document.body.style.background = 'var(--bg-day)';
    }

    /* Se convierte el amanecer y anochecer a hora local */
    const sunriseTime = new Date((sunrise + data.timezone) * 1000);
    const sunsetTime = new Date((sunset + data.timezone) * 1000);

    /* Función que convierte el valor tipo Date a un String de 2 dígitos */
    const timeDataFormat = (value) => ('0' + value).slice(-2);

    /* Se obtiene la hora y minutos de amanecer y anochecer */
    const sunriseHour = timeDataFormat(sunriseTime.getUTCHours());
    const sunriseMinutes = timeDataFormat(sunriseTime.getUTCMinutes());
    const sunriseSeconds = timeDataFormat(sunriseTime.getUTCSeconds());

    const sunsetHour = timeDataFormat(sunsetTime.getUTCHours());
    const sunsetMinutes = timeDataFormat(sunsetTime.getUTCMinutes());
    const sunsetSeconds = timeDataFormat(sunsetTime.getUTCSeconds());

    /* Se muestran las horas de amanecer y anochecer */
    const sunriseContent = document.createElement('span');
    sunriseContent.textContent = `${sunriseHour}:${sunriseMinutes}:${sunriseSeconds} AM`;
    sunriseDiv.appendChild(sunriseContent);

    const sunsetContent = document.createElement('span');
    sunsetContent.textContent = `${sunsetHour}:${sunsetMinutes}:${sunsetSeconds} PM`;
    sunsetDiv.appendChild(sunsetContent);

    weatherCard.appendChild(sunsetSunriseDiv);
    weatherCard.classList.add('fadeIn');
    weatherDetails.classList.add('fadeIn');
    sunsetSunriseDiv.classList.add('fadeIn');

    /* Se cambia el icono durante la noche */
    if (isNight) {
        switch (weatherCondition) {
            case 'Clear':
                weatherImg.src = 'svg/clear-night.svg';
                break;

            case 'Clouds':
                weatherImg.src = 'svg/cloudy-night.svg';
                break;
        }
    }
};

/* Muestra un alert */
const alertSpanText = document.querySelector('.alertSpan')
const alertSpan = () => {    
    alertSpanText.style.display = 'inline-flex'
    alertSpanText.style.color = 'crimson'
    alertSpanText.innerHTML = `<i class="fa-solid fa-circle-question"></i>Ciudad no encontrada`
    body.style.background = 'var(--bgDefaultColor)', body.style.background = 'var(--bgDefaultLinearGr)'
    weatherCard.style.opacity = '1', weatherCityContainer.style.height = '60px', weatherCityContainer.style.background = '#FFF'
    clearCardContent()
    $('.alertSpan').css('visibility', 'visible')
    setTimeout(() => {
        alertSpanText.style.color = '#6c757d',  alertSpanText.innerHTML = `<i class="fa-solid fa-circle-info"></i>Los datos del clima se mostrarán aquí`
        weatherCard.style.opacity = '0'
    }, 5000);
}