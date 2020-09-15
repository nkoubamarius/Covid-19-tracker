import { FormControl, MenuItem, Select , Card, CardContent} from '@material-ui/core';
import React, { useState , useEffect} from 'react';
import './App.css';
import InfoBox from './InfoBox'
import Map from './Map';
import Table from './Table';
import {sortData,prettyPrintStat} from "./util";
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState([]);
  const [tableData,setTableData]=useState([]);
  const [mapCenter, setMapcenter]=useState({lat:34.80746, lng:-40.4796});
  const [mapZoom, setMapZoom]=useState(3);
  const [mapCountries, setMapCountries]=useState([]);
  const [casesType, setCasesType]=useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response=>response.json())
    .then(data=>{
      setCountryInfo(data);
    })
  }, []);

  useEffect(() => {
    //The code inside here will run once the countries change
    //Async->wait for the response
    const getCountriesData = async ()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=>response.json())
      .then((data)=>{
        const countries = data.map((country)=>(
          {
            name:country.country,
            value:country.countryInfo.iso2,
            flag: country.countryInfo.flag
          }
        ));
        const sortedData=sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
      })
    }

    getCountriesData();

  }, []);

  const onCountryChange = async (event)=>{
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === "worldwide"
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url).then(response=>response.json())
    .then(data=>{
      setCountry(countryCode);
      setCountryInfo(data);

      setMapcenter([data.countryInfo.lat , data.countryInfo.long ]);
      setMapZoom(4);

    })
    
  };


  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
        <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange} >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country=>(
                <MenuItem value={country.value}><img src={country.flag} width="30" height="20"/>&nbsp;<strong>{country.name}</strong></MenuItem>
              ))}
              
            </Select>
          </FormControl>
        </div>
      
        <div className="app__stats">

              <InfoBox 
              isRed
              active={casesType==="cases"}
              onClick={(e) =>setCasesType("cases")}
              title="Coronavirus Cases" 
              total={prettyPrintStat(countryInfo.cases)} 
              cases={prettyPrintStat(countryInfo.todayCases)}
              />

              <InfoBox 
              active={casesType==="recovered"}
              onClick={(e) =>setCasesType("recovered")}
              title="Recovered" 
              total={prettyPrintStat(countryInfo.recovered)} 
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              />

              <InfoBox 
              isRed
              active={casesType==="deaths"}
              onClick={(e)=>setCasesType("deaths")}
              title="Deaths" 
              total={prettyPrintStat(countryInfo.deaths)} 
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              />
        </div>

        <Map casesType={casesType}  countries={mapCountries} center={mapCenter} zoom={mapZoom} />

      </div>
      
      <Card className="app__right">
        <CardContent>

          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />

          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />

        </CardContent>
      </Card>

    </div>
  );
}

export default App;
