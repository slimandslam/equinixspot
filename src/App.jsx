import { useState, useEffect } from "react";
import { Container, Form, Table, Dropdown } from 'react-bootstrap';
import { Modal, Spinner } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import InputGroup from 'react-bootstrap/InputGroup';
import { GearFill } from 'react-bootstrap-icons';
import { fetch } from '@tauri-apps/plugin-http';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { Store } from "@tauri-apps/plugin-store";
import Settings from "./Settings";
import "./App.css";
import logo from './logo.png';



// Extended data structure with machine type details
const machineTypeDetails = {
  "a3.large.x86": { cpus: 8, ram: "32GB" },
  "c2.medium.x86": { cpus: 4, ram: "16GB" },
  "c3.medium.x86": { cpus: 2, ram: "8GB" },
  "c3.small.x86": { cpus: 1, ram: "4GB" },
  "m2.xlarge.x86": { cpus: 16, ram: "64GB" },
  "m3.large.x86": { cpus: 8, ram: "32GB" },
  "m3.small.x86": { cpus: 4, ram: "16GB" },
  "n2.xlarge.x86": { cpus: 16, ram: "64GB" },
  "n3.xlarge.x86": { cpus: 32, ram: "128GB" },
  "s3.xlarge.x86": { cpus: 16, ram: "64GB" },
  "t3.small.x86": { cpus: 2, ram: "8GB" },
  "t3.xsmall.x86": { cpus: 1, ram: "4GB" },
  "x2.xlarge.x86": { cpus: 32, ram: "128GB" },
  "x.large.arm": { cpus: 8, ram: "32GB" },
  "c3.large.arm64": { cpus: 4, ram: "16GB" },
  "g2.large.x86": { cpus: 16, ram: "64GB" },
  // Add more machine types here...
};

const metroDetails = {
  "am": { city: "Amsterdam", country: "Netherlands" },
  "at": { city: "Atlanta", country: "USA" },
  "ch": { city: "Chicago", country: "USA" },
  "da": { city: "Dallas", country: "USA" },
  "dc": { city: "Washington D.C.", country: "USA" },
  "fr": { city: "Frankfurt", country: "Germany" },
  "he": { city: "Helsinki", country: "Finland" },
  "hk": { city: "Hong Kong", country: "China" },
  "la": { city: "Los Angeles", country: "USA" },
  "ld": { city: "London", country: "UK" },
  "ma": { city: "Madrid", country: "Spain" },
  "mb": { city: "Mumbai", country: "India" },
  "md": { city: "Melbourne", country: "Australia" },
  "me": { city: "Mecca", country: "Saudi Arabia" },
  "mi": { city: "Miami", country: "USA" },
  "ml": { city: "Milan", country: "Italy" },
  "mt": { city: "Montreal", country: "Canada" },
  "mx": { city: "Mexico City", country: "Mexico" },
  "ny": { city: "New York", country: "USA" },
  "os": { city: "Osaka", country: "Japan" },
  "pa": { city: "Paris", country: "France" },
  "se": { city: "Seattle", country: "USA" },
  "sg": { city: "Singapore", country: "Singapore" },
  "sk": { city: "Seoul", country: "South Korea" },
  "sl": { city: "Silicon Valley", country: "USA" },
  "sp": { city: "São Paulo", country: "Brazil" },
  "sv": { city: "Silicon Valley", country: "USA" },
  "sy": { city: "Sydney", country: "Australia" },
  "tr": { city: "Toronto", country: "Canada" },
  "ty": { city: "Tokyo", country: "Japan" },
  "db": { city: "Dublin", country: "Ireland" }, // Added Dublin for 'db' prefix
};


function App() {
  const [machineTypes, setMachineTypes] = useState([]);
  const [metros, setMetros] = useState([]);
  const [selectedMachineType, setSelectedMachineType] = useState('');
  const [selectedMetro, setSelectedMetro] = useState('');
  const [results, setResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'asc' });

  const [spin, showSpinner] = useState(false);
  const [apikey, setApikey] = useState(null);
  const [settings, setSettings] = useState(false);
  const hideSettings = () => setSettings(false);
  const [data, setData] = useState(null);


  async function getData(apik) {
    let responseJSON = null;
    const url = "https://api.equinix.com/metal/v1/market/spot/prices";
    const store = new Store(".settings.json");
    const akey = await store.get("equinix");

   if (akey === null)  {
       Swal.fire({
         text: 'You have a missing or invalid API key. Click the gear in the upper right hand corner to add your User API key',
        confirmButtonText: 'Ok'
       })
       return;
     }

    setApikey(akey.val);

    showSpinner(true);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "X-Auth-Token": akey.val 
        }
      });

      showSpinner(false);

      if (!response.ok) {
       Swal.fire({
         text: 'You have a missing or invalid API key. Click the gear in the upper right hand corner to add or edit your User API key',
        confirmButtonText: 'Ok'
       })
       return;
      }

      responseJSON = await response.json();

      setData(responseJSON);

    } catch (error) {
      console.log("ERROR IS:", error);
      showSpinner(false);
    }

    const machineTypesSet = new Set();
    const metrosSet = new Set();

    for (const metro in responseJSON.spot_market_prices) {
      metrosSet.add(metro);
      for (const machineType in responseJSON.spot_market_prices[metro]) {
        machineTypesSet.add(machineType);
      }
    }

    setMachineTypes([...machineTypesSet]);
    setMetros([...metrosSet]);
  }


  useEffect(() => {
   getData();
  }, [apikey]);

  const handleFilter = () => {
    let filteredResults = [];

    for (const metro in data.spot_market_prices) {
      if (selectedMetro && metro !== selectedMetro) continue;

      for (const machineType in data.spot_market_prices[metro]) {
        if (selectedMachineType && machineType !== selectedMachineType) continue;

        const price = data.spot_market_prices[metro][machineType].price;
        filteredResults.push({ metro, machineType, price });
      }
    }

    setResults(filteredResults);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getCaret = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

function gotoSettings() {
     setSettings(true);
  }


  return (
    <Container>
{(settings) ? <Settings setkey={setApikey} showit={settings} hideit={hideSettings} /> : null }

   <div className="position-relative" style={{ height: '100px' }}>
        <img src={logo} alt="Equinix Logo" style={{ width: '150px', height: 'auto', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }} />
        <h2 className="text-center m-0" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '100%' }}>Spot Market Prices</h2>
        <Button title="Your API Key" className="border-0" onClick={gotoSettings} variant="outline-primary" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
          <GearFill size={32} />
        </Button>
   </div>

     <Modal show={spin} centered>
      <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      <img src={logo} alt="Equinix" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
        <p className="mt-3 fs-2">Loading latest spot prices...</p>
      </Modal.Body>
    </Modal>

      <Form>
        <Form.Group controlId="machineType">
          <Form.Label><strong>Machine Type</strong></Form.Label>
          <Form.Control as="select" value={selectedMachineType} onChange={(e) => setSelectedMachineType(e.target.value)}>
            <option value="">All Machine Types</option>
            {machineTypes.map(type => (
              <option key={type} value={type}>
                {`${type} (${machineTypeDetails[type]?.cpus || 'N/A'} CPUs, ${machineTypeDetails[type]?.ram || 'N/A'})`}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="metro">
          <Form.Label className="mt-2"><strong>Metro</strong></Form.Label>
          <Form.Control as="select" value={selectedMetro} onChange={(e) => setSelectedMetro(e.target.value)}>
            <option value="">All Metros</option>
            {metros.map(metro => {
              const prefix = metro.match(/[a-z]+/i)[0]; // Extract the prefix
              const details = metroDetails[prefix] || { city: "Unknown", country: "Unknown" };
              return (
                <option key={metro} value={metro}>
                  {`${details.city}, ${details.country} (${metro})`}
                </option>
              );
            })}
          </Form.Control>
        </Form.Group>

      </Form>

       <div className="d-flex align-items-center mt-3">
        <button type="button" className="btn btn-primary me-2" onClick={handleFilter}>Filter</button>
        <h3>Results</h3>
      </div>

      <div className="mt-4" id="results" style={{ height: '270px', overflowY: 'scroll', marginTop: '10px' }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => handleSort('metro')}>Metro{getCaret('metro')}</th>
              <th onClick={() => handleSort('machineType')}>Machine Type{getCaret('machineType')}</th>
              <th onClick={() => handleSort('price')}>Price{getCaret('price')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.length > 0 ? (
              sortedResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.metro}</td>
                  <td>{result.machineType}</td>
                  <td>${result.price.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No results (try clicking the Filter button)</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}

export default App;
