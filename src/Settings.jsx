import { useState } from "react";
import { useEffect } from 'react';
import { Store } from "@tauri-apps/plugin-store";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
  
export default function Settings(props) {
  const [equinixval, SetEquinixval] = useState("");

   useEffect(() => {
     async function setvals() {
       const store = new Store(".settings.json");
       let js1 = null;
       try { js1 = await store.get("equinix"); } catch(e) {}
       if (js1 !== null) SetEquinixval(js1.val);
     }
     setvals();
  }, []); 

  async function StoreSettings() {
  
    const store = new Store(".settings.json");
    let h = document.getElementById('equinix');
    h.value = h.value.replace(/\s+/g,'');
 
  try {
  await store.set("equinix", { val: h.value });
  await store.save();
 
  } catch(error) {
    console.log("SETTINGS ERROR:", JSON.stringify(error));
  }

  props.hideit();
  props.setkey(h.value);
  }

  return (
    <Modal backdrop="static" keyboard={false} show={props.showit} size="lg">
       <Modal.Header>
            <Button size="sm" className="ms-2" variant="secondary" onClick={() => props.hideit()}>
            Cancel
          </Button>
          <Button size="sm" className="ms-2" variant="primary" onClick={() => StoreSettings()}>
            Save
          </Button>
        </Modal.Header>
      <Modal.Body>
         <Form>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Equinix User API Key</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your Equinix User API Key"
                id="equinix"
                defaultValue={equinixval}
              />
           </Form.Group>
          </Form>

       </Modal.Body>
    </Modal>
  );
}

