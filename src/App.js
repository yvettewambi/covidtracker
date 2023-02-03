import { FormControl, MenuItem, Select, Card, CardContent } from '@material-ui/core'
import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from "./Table";
import  {sortData, prettyPrintStat} from "./utility";
import 'leaflet/dist/leaflet.css'

function App() {

  const [counteries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({
    lat: 0,
    lng: 0
  })
  const [mapZoom, setMapZoom] = useState(2)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then((data) => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getCountriesData()
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value    

    const url = countryCode ==='worldwide' ? 'https://disease.sh/v3/covid-19/all' : 'https://disease.sh/v3/covid-19/countries/' + countryCode + '?strict=true'

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)      
      setCountryInfo(data)
      setMapCenter({
        lat: data.countryInfo.lat, 
        lng: data.countryInfo.long
      })
      setMapZoom(4)
    })
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>THE CORONAVIRUS TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">World Wide</MenuItem>
              {
                counteries.map((country) => {
                  return (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  )
                })
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={e => setCasesType('cases')}
            title="Coronavirus cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} 
          />
          <InfoBox
            active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} 
          />
          <InfoBox 
            isRed
            active={casesType === 'deaths'}
            onClick={e => setCasesType('deaths')}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} 
          />
        </div>

        <Map 
          casesType={casesType}
          countries={mapCountries} 
          center={mapCenter} 
          zoom={mapZoom} 
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Order Of Cases by Country</h3>
          <Table countries={tableData} />
          
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
