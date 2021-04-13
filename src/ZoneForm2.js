import React, { useState, useEffect } from "react";
import NetlifyAPI from "netlify";

const ZoneForm = (props) => {
  const [fileOut, setFileOut] = useState(null);
  const [parserResponse, setParserResponse] = useState(null);
  const [zone, setZone] = useState(null);

  const client = new NetlifyAPI(window.atob(user.token));

  const handleInput = (e) => {
    let reader = new FileReader();
    reader.onload = (r) => {
      setFileOut(r.target.result);
    };
    reader.readAsText(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response = await fetch(
      "https://festive-rosalind-201bbd.netlify.app/.netlify/functions/zonefileparser",
      {
        method: "POST",
        body: fileOut,
      }
    );
    response = await postZoneFile.json();
    setParserResponse(response);
  };

  const createRecord = async (hostname, type, ttl, value) => {
    const { user } = props;

    try {
      // POST request
      let response = await client.createDnsRecord({
        zone_id: zone.id,
        body: {
          type: type,
          hostname: hostname,
          value: value,
          ttl: ttl,
        },
      });
      console.log(response);
      alert(`Successfully created DNS record ✨`);
    } catch (error) {
      alert(error);
    }
  };

  const createZone = async (hostname) => {
    const { accountSlug, user } = props;

    try {
      // POST request
      let response = await client.createDnsZone({
        body: {
          account_slug: accountSlug,
          name: hostname,
        },
      });
      console.log(response);
      setZone(response);
      alert(`Successfully created DNS zone for ${hostname} 🚀`);
    } catch (error) {
      alert(error);
    }
  };

  const renderZoneFileForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <label>Upload your zone file:</label>
        <input type="file" accept=".txt" onChange={handleInput} />
        <button type="submit">Submit</button>
      </form>
    );
  };

  const renderRecordsList = () => {
    return parserResponse.records.map((record, i) => {
      const { ttl, type, hostname, value } = record;
      return (
        <div className="record-wrapper" key={i}>
          <div className="record-info">
            <p>
              {hostname} {type} {ttl} {value}
            </p>
            <button onClick={() => createRecord(hostname, type, ttl, value)}>
              Create record
            </button>
          </div>
        </div>
      );
    });
  };

  if (!parserResponse) {
    return <div>{renderZoneFileForm}</div>;
  }

  return (
    <div>
      <h2>{parserResponse.name}</h2>
      <button onClick={() => createZone(parserResponse.name)}>
        Create zone
      </button>
      <div>{renderRecordsList}</div>
    </div>
  );
};

export default ZoneForm;
