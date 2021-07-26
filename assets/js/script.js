var citysearchEl = document.getElementById("search");
var searchbuttonEl = document.getElementById("button-container");
var current_weatherEl = document.getElementById("current-weather");
var forecastEl = document.getElementById("forecast");
var historyEl = document.getElementById("history");
var unit_selection = document.getElementsByName("unit");


//fetch weather data
var getWeather = (city) => {
  var key =  "f7bc6ba9663ff374404b0d7dc50e859d";
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
  if(unit_selection[0].checked)
  {
     var units = unit_selection[0].value;
  }
  else {
    var units = unit_selection[1].value;
  }
  
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
                            .then(data2 => {
                                set_current_weather(data.name,data.sys.country,units,data2);
                            });
                        } else {
                           console.log("Response error on onecall fetch");
                           current_weatherEl.textContent = "No Response from Openweather API";
                           current_weatherEl.classList.remove("black-border");
                        }
                    })

            });       
        } else {
            console.log("Response error on current weather fetch");
            current_weatherEl.textContent = "No Response from Openweather API";
            current_weatherEl.classList.remove("black-border");
        }
    })
    .catch(error => {
        console.log("No Internet Connection");
            current_weatherEl.textContent = "No Internet Connection";
            current_weatherEl.classList.remove("black-border");
    });
};

var buttonhandler_search = event => {
    event.preventDefault();
    var button_type = event.target.getAttribute("data-value");
    switch (button_type) {
        case "search":
            reset();
            getCity();
            break;
        case "clear":
            localStorage.removeItem("w_dashboard");
            load_history();
            break;
    }    
};

var buttonhandler_history = event => {
    event.preventDefault();
    var button_type = event.target.getAttribute("data-city");
    if(button_type) {    
        reset();  
        getWeather(button_type);       
    }
   
};

var reset = () => {
          //Reset DOM
          current_weatherEl.textContent = "";
          current_weatherEl.classList.remove("black-border");
          while(current_weatherEl.firstChild){
              current_weatherEl.removeChild(current_weatherEl.firstChild);
          }
          while(forecastEl.firstChild){
              forecastEl.removeChild(forecastEl.firstChild);
          }
};

//get city from input textbox
var getCity = () => {
city = citysearchEl.value;
console.log()
    if(city) {
        getWeather(city);
        save_data(city);
        load_history();
        citysearchEl.value = "";
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
        var titlecontainerEl = document.createElement("div");
        var titleEl = document.createElement("h2");
        var iconEl = document.createElement("img");
        var tempEl = document.createElement("h3");
        var windEl = document.createElement("h3");
        var humidityEl = document.createElement("h3");
        var uv_indexEl = document.createElement("h3");
        var riskfactorEl = document.createElement("span");

        //Reset Variables
        titleEl.textContent = "";
        iconEl.src = "";
        tempEl.textContent = "";
        windEl.textContent = "";
        humidityEl.textContent = "";
        uv_indexEl.textContent = "";
        riskfactorEl.textContent = "";
        riskfactorEl.id = "";
        
        //Add text to DOM Elements
            titleEl.textContent = `${city}, ${country} (${date})`;
            iconEl.src = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`;
            iconEl.id = "current_icon";
            titlecontainerEl.id ="title_contaier";
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
        titlecontainerEl.appendChild(titleEl);
        titlecontainerEl.appendChild(iconEl);
        current_weatherEl.appendChild(titlecontainerEl);;
        current_weatherEl.appendChild(tempEl);
        current_weatherEl.appendChild(windEl);
        current_weatherEl.appendChild(humidityEl);
        uv_indexEl.appendChild(riskfactorEl);
        current_weatherEl.appendChild(uv_indexEl);

        //Add border to current weather container
        current_weatherEl.className = "black-border"

            //set 5-day forecast
            set_forecast(date,data.daily,unit);
    }    
 };

 var set_forecast = (date,data,unit) => {

    //5-Day Forecast Title Text
    var forecast_titleEl = document.createElement("div");
    forecast_titleEl.id = "forecast-title";
    var titleEl = document.createElement("h3");
    titleEl.textContent = "5-Day Forecast:";
    forecast_titleEl.appendChild(titleEl);
    forecastEl.appendChild(forecast_titleEl);
   
    //Generate cards with 5 day forecast
    for(let i = 1; i < 6; i++)
    {
        //Generate DOM Elements
        var cardEl = document.createElement("div");
        var forecastdate = document.createElement("h4");
        var icon_container = document.createElement("p");
        var icon = document.createElement("img");
        var tempEl = document.createElement("p");
        var windEl = document.createElement("p");
        var humidityEl = document.createElement("p");

        //Add class to card
        cardEl.className = "card";

        //Generate days
        forecastdate.textContent = moment(date, "M/D/YYYY").add(i,"days").format("M/D/YYYY");

        //Get Icon
        icon.src = `http://openweathermap.org/img/wn/${data[i].weather[0].icon}.png`;

        //Get temperature and wind speed
        if(unit === "imperial"){
            tempEl.textContent = `Temp: ${data[i].temp.day}°F`;
            windEl.textContent = `Wind: ${data[i].wind_speed} MPH`;
        } else if (unit === "metric") {
            tempEl.textContent = `Temp: ${data[i].temp.day}°C`;
            windEl.textContent = `Wind: ${data[i].wind_speed} KPH`;
        }

        //Get Humidity
        humidityEl.textContent = `Humidity: ${data[i].humidity} %`;

        //Add to forecast container
        icon_container.appendChild(icon);
        cardEl.appendChild(forecastdate);
        cardEl.appendChild(icon_container);
        cardEl.appendChild(tempEl);
        cardEl.appendChild(windEl);
        cardEl.appendChild(humidityEl);
        forecastEl.appendChild(cardEl);
    }
 };

 var save_data = (city) => {
    var saved = JSON.parse(localStorage.getItem("w_dashboard")) || [];
    if(saved.length < 10)
    {
    saved.unshift(city);
    } else {
        var temp_array = [];
        temp_array.push(city);
        for(let i = 0; i < saved.length-1;i++)
        {
            temp_array.push(saved[i]);
        }
        saved = temp_array;
    }
    localStorage.setItem("w_dashboard", JSON.stringify(saved));
 };

var load_history = () => {
    var history = JSON.parse(localStorage.getItem("w_dashboard")) || [];

    //Clean DOM 
    while(historyEl.firstChild)
    {
        historyEl.removeChild(historyEl.firstChild);
    }

    if(history)
    {
        for(let i = 0; i < history.length; i++)
        {
            var button_El = document.createElement("button");
            button_El.classList = "button color-grey";
            button_El.setAttribute("data-city", history[i]);
            button_El.textContent = history[i];
            historyEl.appendChild(button_El);

        }
    } else {
        return;
    }
};

//add click event to search button
searchbuttonEl.onclick = buttonhandler_search;
historyEl.onclick = buttonhandler_history;
load_history();



