let map;
let directionsService;
let directionsRenderer;
let autocomplete;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector(".from").addEventListener("change", calculateAndDisplayRoute);
    document.querySelector(".to").addEventListener("change", calculateAndDisplayRoute);
});

async function getWeather(latitude,longitude){
    try{
        let response= await fetch(`https://tripo-wvog.onrender.com/weather?lat=${latitude}&long=${longitude}`);
        let data= await response.json();
        console.log(data);
        let fromLoc=document.querySelector('#from');
        if(!fromLoc.value){
            fromLoc.value=data.name;
        }
        let toLoc=document.querySelector('#to');
        console.log(fromLoc);
        loadData(data,fromLoc,toLoc);
        if(toLoc.value){
            calculateAndDisplayRoute()
        }
    }
    catch(error){
        console.log(error + "weather");
    }
}
function loadData(data,fromLoc,toLoc){
    loadImage(data.weather[0].icon)
    let heading=document.querySelector('#loc');
    let ele=(toLoc.value?toLoc.value:fromLoc.value);
    ele=ele.charAt(0).toUpperCase() + ele.slice(1);
    heading.textContent=`Current Weather at ${ele}`;
    loadTemp(data.main);
    let desc=document.querySelector('.desc');
    desc.textContent=`Description: ${data.weather[0].description}`;
    loadDayDateTime();
    setRiseTime(data);
    loadQuality(data);
}


async function initMap(latitude,longitude) {
    try{
        const { Map } = await google.maps.importLibrary("maps");
        const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
        map = new Map(document.getElementById("map"), {
            center: { lat: latitude, lng: longitude },
            zoom: 8,
        });
        console.log(map);
        directionsService = new DirectionsService();
        directionsRenderer = new DirectionsRenderer({
            map:map,
            suppressMarkers: false, 
            preserveViewport: false 
        });
        directionsRenderer.setMap(map);
    }
    catch(error){
        alert("error initializing the map")
    }
}

async function initAutocomplete(element){
    autocomplete=new google.maps.places.Autocomplete(
        element,
        {
            types:['establishment'],
        }
    )
}

async function calculateAndDisplayRoute() {
    try{
        let from = document.querySelector("#from").value;
        let to = document.querySelector("#to").value;
        if(!to){
            alert("Please enter the to location")
            return;
        }
        console.log(from)
        console.log(to)
        
        if (directionsRenderer) {
            directionsRenderer.setDirections({ routes: [] });
        }
        
        const request = {
            origin: from,
            destination: to,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true
        };
        
        const result = await directionsService.route(request);
        
        const bounds = new google.maps.LatLngBounds();
            
        const route = result.routes;
        console.log(route);
        route.forEach(path=>{
            path.legs.forEach(leg => {
                bounds.extend(leg.start_location);
                bounds.extend(leg.end_location);
                leg.steps.forEach(step => {
                    bounds.extend(step.start_location);
                    bounds.extend(step.end_location);
                });
            });
        })
        
        map.fitBounds(bounds, {
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
                }
            });
            
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(result);
            map.fitBounds(bounds);

            let dist=document.querySelector('.distance');
            let time=document.querySelector('.timeTaken');
            let fromLoc=from.split(" ");
            let toLoc=to.split(" ");
            if(fromLoc.length>2){
                from=`${fromLoc[0]} ${fromLoc[1]}`
            }
            else{
                from=from.charAt(0).toUpperCase()+from.slice(1);
            }
            if(toLoc.length>2){
                to=`${toLoc[0]} ${toLoc[1]}`
            }
            else{
                to=to.charAt(0).toUpperCase()+to.slice(1);
            }
            dist.innerHTML=`Distance of ${from}  to ${to}: ${route[0].legs[0].distance.text}`;
            time.innerHTML=`Total time to reach ${to} by driving: ${route[0].legs[0].duration.text}`;
            console.log(dist.value);
        }
        catch(error){
            // alert(error.message)
            alert("Could not calculate route. Please check the addresses and try again.");
        }
    }
    function loadImage(icon){
        let img=document.querySelector('#img')
        img.setAttribute('src',`https://openweathermap.org/img/wn/${icon}@2x.png`)   
    }
    function loadTemp(temperatures){
        let curTemp=document.querySelector('.currTemp');
        let curr=temperatures.temp-273.15;
        curTemp.textContent=`Current Temperature: ${curr.toFixed(2)}°C`;
        
        
        let maxTemp=document.querySelector('.maxTemp');
        let max=temperatures.temp_max-273.15;
        maxTemp.textContent=`Maximum Temperature: ${max.toFixed(2)}°C`;

        let minTemp=document.querySelector('.minTemp')
        let min=temperatures.temp_min-273.15;
        minTemp.textContent=`Minimum Temperature: ${min.toFixed(2)}°C`;
        
        let feels=document.querySelector('.feels')
        let feel=temperatures.feels_like-273.15;
        feels.textContent=`Feels like: ${feel.toFixed(2)}°C`;
    }
    
    function loadDayDateTime(){
        setInterval(() => { 
            let day = document.querySelector('.day');
            let time = document.querySelector('.time');
            let dateCont=document.querySelector('.date');
            let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            let date = new Date();
            dateCont.textContent=date.toLocaleDateString()
            let currentDay = days[date.getDay()]; 
            let currentTime = date.toLocaleTimeString(); 
            time.textContent=currentTime;
            day.textContent = `${currentDay}`;
        }, 1000);
    }
    
function setRiseTime(data){
    let rise=document.querySelector(".riseTime");
    let set=document.querySelector(".setTime");
    let riseTime=data.sys.sunrise;
    let riseT=new Date(riseTime*1000);
    rise.textContent=`${riseT.getHours()}:${riseT.getMinutes()}`
    let setTime=data.sys.sunset;
    let setT=new Date(setTime*1000);
    set.textContent=`${setT.getHours()<10?`0${setT.getHours}`:setT.getHours()}:${setT.getMinutes()<10?`0${setT.getMinutes()}`:setT.getMinutes()}`
    // console.log(riseT)
}

let search=document.querySelector('#btn1');
search.addEventListener('click', async function(){
    let searchTo=document.querySelector('#to');
    let searchVal=searchTo.value;
    let searchFrom=document.querySelector('#from').value;
    if (!searchFrom || !searchTo) {
        window.alert("Please enter both 'From' and 'To' locations.");
        return;
    }
    if(searchVal){
        let data=await fetch(`https://tripo-wvog.onrender.com/locate?location=${searchVal}`);
        let response= await data.json();
        console.log(response)
        let latitude=response.results[0].geometry.lat
        let longitude=response.results[0].geometry.lng
        getWeather(latitude,longitude);
        calculateAndDisplayRoute()
        // console.log(latitude, longitude);
    }
    else{
        if(searchFrom){
            let data=await fetch(`https://tripo-wvog.onrender.com/locate?location=${searchFrom}`);
            let response= await data.json();
            console.log(response)
            let latitude=response.results[0].geometry.lat
            let longitude=response.results[0].geometry.lng
            getWeather(latitude,longitude);
        }
    }
    // console.log(searchVal)
})

function loadQuality(data){
    let humidity=document.querySelector('.humidity');
    let speed=document.querySelector('.speed');
    speed.innerHTML= `${data.wind.speed} m/sec`;
    // console.log(humidity);
    humidity.innerHTML=`${data.main.humidity}%`
    // console.log(speed);
}

navigator.geolocation.getCurrentPosition((success)=>{
    try{
        console.log(success);
        lat=success.coords.latitude;
        long=success.coords.longitude;
        let from=document.querySelector('#from')
        let to=document.querySelector('#to')
        initMap(lat,long);
        getWeather(lat,long)
        initAutocomplete(to)
        initAutocomplete(from)
    }
    catch(error){
        alert("Unable to find your location");
        initMap(0,0);
    }
})
