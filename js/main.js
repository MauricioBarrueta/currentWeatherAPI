const APIKey = 'a989269a6f7d0e23d578e48436c457dc';
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

const body = document.getElementById('body')
const weatherCityContainer = document.querySelector('.weather-city-container');
const weatherCard = document.querySelector('.weather-card');
const weatherDetails = document.querySelector('.weather-details');
const humidityDiv = document.querySelector('.humidity'), windDiv = document.querySelector('.wind');
const sunsetSunriseDiv = document.querySelector('.sunrise-sunset-container');
const sunriseDiv = document.querySelector('.sunrise-div'), sunsetDiv = document.querySelector('.sunset-div');

const clearCardContent = () => {
    weatherCard.innerHTML = '', humidityDiv.innerHTML = '', windDiv.innerHTML = '', sunriseDiv.innerHTML = '', sunsetDiv.innerHTML = '';
}
/* Consulta el clima de acuerdo a la ciudad que se ingrese */
const searchButton = document.querySelector('.city-name-input button');
searchButton.addEventListener('click', () => {
    const cityName = document.querySelector('.city-name-input input').value;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIKey}&lang=${lang}`)
        .then(res => { return res.status === 404 || res.status === 400 ? alertSpan() : res.json(); })
        .then(data => {             
            if(data.cod === 200) {
                weatherCityContainer.style.height = '480px'; weatherCard.style.opacity = '1';
                clearCardContent();
                alertSpanText.style.visibility = 'hidden'
                weatherCityContainer.style.backgroundImage = 'none';
                renderWeatherData(data);
            }
        }).catch(error => console.error(error));
});

/* Consulta el clima de acuerdo a la latitud y longitud que se haya ingresado o bien se haya obtenido con la ubicación */
const searchByLatLot = document.querySelector('.lat-lot-btn');
searchByLatLot.addEventListener('click', () => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latInput.value}&lon=${lonInput.value}&appid=${APIKey}&lang=${lang}`)
        .then(res => { return res.status === 404 || res.status === 400 ? alertSpan() : res.json(); })
        .then(data => {
            if (data.cod === 200) {
                weatherCityContainer.style.height = '480px'; weatherCard.style.opacity = '1';
                clearCardContent();
                alertSpanText.style.visibility = 'hidden'
                weatherCityContainer.style.backgroundImage = 'none';
                document.querySelector('.city-name-input input').value = '';
                renderWeatherData(data);
            }
        }).catch(error => console.error(error));
})

/* Renderiza los datos obtenidos y los pasa al DOM */
const renderWeatherData = (data) => {
    const countryName = document.createElement('p');
    countryName.classList.add('weather-city-name');
    countryName.textContent = data.name + ', ' + data.sys.country;
    weatherCard.appendChild(countryName);

    /* Se obtiene la hora actual de acuerdo a la zona horaria */
    const dataTimezone = data.timezone;
    const timezoneInMinutes = dataTimezone / 60; /* 60seg */
    const currentTime = moment().utcOffset(timezoneInMinutes).format('HH:mm:ss A'); 

    const countryTimeUTC = document.createElement('p');
    countryTimeUTC.classList.add('city-utc-time');
    countryTimeUTC.textContent = currentTime;
    weatherCard.appendChild(countryTimeUTC);

    const weatherImg = document.createElement('img');
    weatherImg.classList.add('weather-city-img');
    switch (data.weather[0].main) {
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

    /* Función que obtiene los primeros 2 dígitos de la temperatura para evitar el error de la API (temperatura de 3 dígitos) */
    const formatLonLatTempValues = (tempValue) => {
        return String(tempValue).substring(0, 2);  
    }   
    const temperatureData = document.createElement('p');
    temperatureData.classList.add('temperature');
    temperatureData.innerHTML = `${parseInt(formatLonLatTempValues(data.main.temp))}<span>°C</span>`;
    weatherCard.appendChild(temperatureData);

    const maxminTemperatureData = document.createElement('span');
    maxminTemperatureData.classList.add('temperature-max-min');    
    maxminTemperatureData.innerHTML = `
        Máx: ${parseInt(formatLonLatTempValues(data.main.temp_max))}<span>°C</span> / Mín: ${parseInt(formatLonLatTempValues(data.main.temp_min))}<span>°C</span>`;
    weatherCard.appendChild(maxminTemperatureData);
    
    const temperatureFeel = document.createElement('span');
    temperatureFeel.classList.add('temperature-feels-like');
    temperatureFeel.innerHTML = `Sensación real: ${parseInt(formatLonLatTempValues(data.main.feels_like))}<span>°C</span>`;
    weatherCard.appendChild(temperatureFeel);

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
  
    const sunriseTimeData = data;
    const sunsetTimeData = data;      
    const { sys: { sunrise }, timezone } = sunriseTimeData, { sys: { sunset } } = sunsetTimeData
    /* Se obtiene la diferencia entre sunrise, sunset y timezone en UNIX Epoch (01/01/1970 00:00:00 UTC)  */
    const sunriseTime = new Date((sunrise + timezone) * 1000);
    const sunsetTime = new Date((sunset + timezone) * 1000);
    
    /* Función que convierte el valor tipo Date a un String de 2 dígitos */    
    const timeDataFormat = (value) => {
        return ('0' + value).slice(-2);
    };      
    /* Se obtiene la hora en tiempo UTC con los métodos correspondientes de Date */
    const sunriseHour = timeDataFormat(sunriseTime.getUTCHours()), sunsetHour = timeDataFormat(sunsetTime.getUTCHours()),
        sunriseMinutes = timeDataFormat(sunriseTime.getUTCMinutes()), sunsetMinutes = timeDataFormat(sunsetTime.getUTCMinutes()),
        sunriseSeconds = timeDataFormat(sunriseTime.getUTCSeconds()), sunsetSeconds = timeDataFormat(sunsetTime.getUTCSeconds()); 

    const currentHM = currentTime.split(":", 2)   /* Hora - Minutos actual */    
    var ssHr = parseInt(sunsetHour), ssMin = parseInt(sunsetMinutes)
    var srHr = parseInt(sunriseHour), srMin = parseInt(sunriseMinutes)
    /* Valida si es de día o de noche comparando la hora actual con la hora en que amanece y anochece */
    if(currentHM[0] >= ssHr && currentHM[1] >= ssMin || currentHM[0] <= srHr && currentHM[1] < srMin) {
        weatherCityContainer.style.backgroundImage = 'url(img/night.jpg)'; 
        body.style.background = 'background: var(-bgNightBaseColor)'; body.style.background = 'var(--bgNightLinearGr)';
        switch (data.weather[0].main) {
            case 'Clear':
                weatherImg.src = 'svg/clear-night.svg';
                break;
            case 'Clouds':
                weatherImg.src = 'svg/cloudy-night.svg';
                break;
        }
    } else {
        weatherCityContainer.style.backgroundImage = 'url(img/day.jpg)';  
        body.style.background = 'var(--bgDayBaseColor)'; body.style.background = 'var( --bgDayLinearGr)';  
    }

    const sunriseContent = document.createElement('span');
    sunriseContent.textContent = `${sunriseHour}:${sunriseMinutes}:${sunriseSeconds} AM`;
    sunriseDiv.appendChild(sunriseContent);
    const sunsetContent = document.createElement('span');
    sunsetContent.textContent = `${sunsetHour}:${sunsetMinutes}:${sunsetSeconds} PM`;
    sunsetDiv.appendChild(sunsetContent);

    weatherCard.appendChild(sunsetSunriseDiv);    
    weatherCard.classList.add('fadeIn'), weatherDetails.classList.add('fadeIn'), sunsetSunriseDiv.classList.add('fadeIn');
}

/* Muestra un alert */
const alertSpanText = document.querySelector('.alertSpan');
const alertSpan = () => {    
    alertSpanText.style.visibility = 'visible', alertSpanText.style.color = 'crimson'
    alertSpanText.textContent = '\u{26A0} Lo sentimos, esta ciudad no existe o no está disponible \u{26A0}'
    body.style.background = 'var(--bgDefaultColor)'; body.style.background = 'var(--bgDefaultLinearGr)'; 
    weatherCityContainer.style.backgroundImage = 'none', weatherCard.style.opacity = '1', weatherCityContainer.style.height = '60px';    
    clearCardContent();
    $('.alertSpan').css('visibility', 'visible'); 
    setTimeout(() => {
        alertSpanText.style.color = 'black',  alertSpanText.textContent = 'La información se mostrará aquí:'
        weatherCard.style.opacity = '0'; 
    }, 5000);
}