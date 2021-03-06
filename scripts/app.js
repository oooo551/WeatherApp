

window.addEventListener("load", () => {
    let lon;
    let lat;
    let geoAccessible = false;
    let api;
    let apiKey;

    // using requirejs to get API_KEY from another file
    requirejs(['env'], (env) => {
        apiKey = env.api_key;
    })

    // get coordinates while window loads
    requestGeoPermission();

    
    


    let temperatureDescription = document.querySelector('.temperature-description');
    let temperatureDegree = document.querySelector('.temperature-degree');
    let locationCity = document.querySelector('.location-city');
    let temperatureSection = document.querySelector('.temperature-section');
    let temperatureSpan = document.querySelector('.temperature-span');
    let locationTime = document.querySelector('.location-time');
    // variables for other cities
    let currentCity = '';
    let dropdownContents = document.querySelectorAll('p', '.dropdown-content');

    // create a dictionary like object to store the fetched data
    let weatherData = {};

    /* dropdown list to show cities */
    let dropbtn = document.querySelector('.dropbtn');
    dropbtn.addEventListener('click', () => {
        document.getElementById('myDropdown').classList.toggle("show");
    })
    // close dropdown list when user clicks somewhere else
    window.onclick = function(event){
        if (!event.target.matches('.dropbtn')){
            document.getElementById('myDropdown').classList.remove('show');
        }
    }
    // set event listeners for dropdown content
    for (let loc of dropdownContents){
        loc.addEventListener('click', () => {
            getLocationWeather(loc.textContent);
        })
    }


    // set Sydney as the default location
    getLocationWeather('Sydney');

    // change between fahrenheit and celcius
    temperatureSection.addEventListener('click', () => {
        changeDegreeUnit(temperatureDegree.textContent, temperatureSpan.textContent);
    })

    
    /* Uses geolocation to fetch weather for current location */
    function getLocationWeather(location){
        if (location !== currentCity){ // prevent duplicate fetches for same location
            if (location === 'Current Location'){
                // if geolocation is accessible
                if (geoAccessible) {
                    api = `http://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;
                }else{
                    alert("Geolocaion cannot be accessed from this browser. Please try another one or refresh page.")
                }
            } else { // fecth for cities
                api = `http://api.openweathermap.org/data/2.5/weather?units=metric&q=${location}&appid=11ed2c940b5999151b55830352c75b71`;
            }
            console.log("Fetching data from: ", api);
            // only fetch data for new location
            if (!(location in weatherData)){
                fetch(api)
                .then(result => result.json())
                .then(data => {
                    console.log("data", data);
                    parseHTML(data);
                })
            }else{
                parseHTML(weatherData[location]);
            }         
        }        
    }

    
    
    function setIcons(iconID){
        const url = 'http://openweathermap.org/img/wn/' + iconID + '@2x.png';
        document.getElementById("icon").setAttribute("src", url);
    }

    function parseHTML(data){
        const description = data.weather[0].description;
        const city = data.name;
        const degree = Math.round(data.main.temp * 10) / 10;
        const icon = data.weather[0].icon;
        const timezone = getLocationTime(data.timezone);
        setIcons(icon);
        temperatureSpan.textContent = "°C";
        temperatureDescription.textContent = description;
        temperatureDegree.textContent = degree;
        locationCity.textContent = city;
        locationTime.textContent = timezone;

        // set currentCity
        currentCity = city 
        // store fetched data to dictionary
        weatherData[currentCity] = data;

        console.log('weather data: ', weatherData);    
    }

    function changeDegreeUnit(degree, mode){
        let num;
        if (mode === "°C"){
            num = (degree * 1.8) + 32;
            // round numbers to 1 decimal
            num = Math.round(num * 10) / 10;
            temperatureDegree.textContent = num;
            temperatureSpan.textContent = "°F";
        }else{
            num = (degree - 32) * 0.556;
            num = Math.round(num * 10) / 10;
            temperatureDegree.textContent = num;
            temperatureSpan.textContent = "°C";
        }        
    }

    function requestGeoPermission(){
        if(confirm("CLick \"OK\" to allow geoloaction to get weather for current location.")){
            getCoordinates();
        }
    }

    function getCoordinates(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                console.log('geocoordinates: ', position);
                lon = position.coords.longitude;
                lat = position.coords.latitude;
                geoAccessible = true; // set attribute to true
            }, err => { // show error message
                console.log(err);
                alert('Opps...' + err.message);
            })        
        }
    }

    /* The timezone from openweather API is seconds from UTC+0. Calculate current timezone difference from 
        UTC (offset), and the timezone difference from the API (timezone). */
    function getLocationTime(timezone){
        const time = Date.now() // number of seconds from UNIX EPOCH time
        let d = new Date()
        // getTimezoneOffset returns minutes, ex: SYD results in -660 (11 hours faster than UTC)
        const offSet = d.getTimezoneOffset();
        // timezone is in seconds, converting to minutes, then mutiply into milliseconds
        let cityTime = new Date(time + ((timezone/60)+(offSet))*60000 ); 
        let minute = cityTime.getMinutes();
        if (minute < 10){
            minute = "0" + minute;
        }
        
        return cityTime.getHours() + ": " + minute;
    }   
})

