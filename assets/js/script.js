var citysearchEl = document.getElementById("search");
var searchbuttonEl = document.getElementById("button-container");
var current_weatherEl = document.getElementById("current-weather");

//fetch weather data
var getWeather = (city) => {
  var key =  "f7bc6ba9663ff374404b0d7dc50e859d";
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
  var units = "imperial"; //imperial/metric
    fetch(apiUrl)
    .then(response => {
        if(response.ok)
        {
            response.json()
            .then(data => {
                var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${key}`;
                    fetch(apiUrl)
                    .then(response =>{
                        if(response.ok)
                        {
                            response.json()
                            .then(data2 => set_current_weather(data.name,data.sys.country,units,data2));
                        } else {
                            "Response error on onecall fetch"
                        }
                    })

            });       
        } else {
            console.log("Response error on current weather fetch!");
        }
    })
    .catch(error => console.log(error));
};

//get city from input textbox
var getCity = event => {
event.preventDefault();
city = citysearchEl.value;
    if(city) {
        getWeather(city);
    } else {
        alert("Please enter a city!");
    }
};

 var set_current_weather = (city,country,unit,data) => {
    if(data)
    {
        //get date using moment
        var date = moment().format("M/D/YYYY");

        //create DOM Elements
        var titleEl = document.createElement("h2");
        var iconEl = document.createElement("img");
        var tempEl = document.createElement("h3");
        var windEl = document.createElement("h3");
        var humidityEl = document.createElement("h3");
        var uv_indexEl = document.createElement("h3");
        var riskfactorEl = document.createElement("span");
        
        //Add text to DOM Elements
            titleEl.textContent = `${city}, ${country} (${date})`;
            iconEl.src = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`;
            if(unit === "imperial")
            {
            tempEl.textContent = `Temp: ${data.current.temp}°F (Feels like: ${data.current.feels_like}°F)`;
            windEl.textContent = "Wind: " + data.current.wind_speed + " MPH";
            } else if (unit === "metric")
             {
                tempEl.textContent = `Temp: ${data.current.temp}°C (Feels like: ${data.current.feels_like}°C)`;
                windEl.textContent = "Wind: " + data.current.wind_speed + " KPH";
             }    
             humidityEl.textContent = "Humidity: " + data.current.humidity + " %";
             uv_indexEl.textContent = "UV Index: ";
             riskfactorEl.textContent = data.current.uvi;

            if(data.current.uvi <= 2)
            {
                riskfactorEl.id = "uv-good"
            } else if (data.current.uvi >= 3 && data.current.uvi <= 5 )
            {
                riskfactorEl.id = "uv-ok"
            } else if (data.current.uvi >= 6 && data.current.uvi <= 7 )
            {
                riskfactorEl.id = "uv-bad"
            } else if (data.current.uvi >= 8 && data.current.uvi <= 10 )
            {
                riskfactorEl.id = "uv-danger"
            } else if (data.current.uvi >= 11 )
            {
                riskfactorEl.id = "uv-death"
            }
            
        //Attach DOM Elements
        titleEl.appendChild(iconEl);
        current_weatherEl.appendChild(titleEl);
        current_weatherEl.appendChild(tempEl);
        current_weatherEl.appendChild(windEl);
        current_weatherEl.appendChild(humidityEl);
        uv_indexEl.appendChild(riskfactorEl);
        current_weatherEl.appendChild(uv_indexEl);
    }
 };

//add click event to search button
searchbuttonEl.onclick = getCity;
getWeather("Calexico");


