// const { GoMaps } = require("gomaps"); 
require("dotenv").config();
const express = require('express');
const CORS = require('cors');
const axios = require('axios');

const app = express();
app.use(CORS({
    origin: '*',
}));

const PORT = 3000;

app.get('/weather', async (req, res) => {
    try {
        const APIKEY = process.env.weather_API;
        const lat = req.query.lat;
        const long = req.query.long;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APIKEY}`);


        res.json(response.data);
    } catch(error) {
        res.status(500).json({ error:error.message});
    }
});


app.get('/locate',async(req,res)=>{
    try{
        const APIKEY2=process.env.location_API;
        let location=req.query.location;
        console.log(location)
        const response=await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${APIKEY2}`)
        res.json(response.data);
        console.log(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${APIKEY2}`)
    }
    catch(error){
        res.status(500).json({error : error.message});
    }
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});