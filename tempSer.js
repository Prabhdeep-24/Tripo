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
        const APIKEY = "2URASDSNK8YQZP7RMYG4P3U2P";
        const lat = req.query.lat;
        const long = req.query.long;
        const date=new Date()
        let start=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
        let end=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()+7}`;
        days=[31,28,31,30,31,30,31,31,30,31,30,31];
        if(date.getDate()>days[date.getMonth()]){
            end=`${date.getFullYear()}-${date.getMonth()+2}-${date.getDate()-days[date.getMonth()]}`
        }
        
        const response = await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat}/${long}/${start}/${end}?key=${APIKEY}`);

        res.json(response.data);
    } catch(error) {
        console.error('Server error:', error);  // Log error for debugging
        res.status(500).json({ 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});