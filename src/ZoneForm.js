import React, { Component } from 'react'
import NetlifyAPI from 'netlify'

export default class ZoneForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        fileOut: '',
        parserResponse: '',
        zone: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createRecord = this.createRecord.bind(this);
    this.createZone = this.createZone.bind(this);
}

  handleInput(e) {
    let reader = new FileReader();
    reader.onload = r => {
      this.setState({
        fileOut: r.target.result
      })
    };
    reader.readAsText(e.target.files[0])
  }

  async handleSubmit(e) {
    e.preventDefault()
    const { fileOut } = this.state

    const postZoneFile = await fetch('https://with-oauth--festive-rosalind-201bbd.netlify.app/.netlify/functions/hello', {
      method: 'POST',
      body: fileOut
    })
    const response = await postZoneFile.json();

    this.setState({
      parserResponse: response
    })
  }

  async createRecord(hostname, type, ttl, value) {
    const { zone } = this.state
    const { user } = this.props
    const client = new NetlifyAPI(window.atob(user.token))

    // POST request
    const response = await client.createDnsRecord({
      zone_id: zone.id,
      body: {
        type: type,
        hostname: hostname,
        value: value,
        ttl: ttl
      }
    })
    console.log(response)
  }

  async createZone(hostname) {
    const { accountSlug, user } = this.props
    const client = new NetlifyAPI(window.atob(user.token))

    // POST request
    const response = await client.createDnsZone({
      body: {
        account_slug: accountSlug,
        name: hostname
      }
    })
    console.log(response)
    
    // set state based on response
    this.setState({
      zone: response
    })
  }

  renderZoneFileForm() {
    return (
        <form onSubmit={this.handleSubmit}>
          <label>Zone file:</label>
          <input type="file" accept=".txt" onChange={this.handleInput} />
          <button type="submit">Submit</button>
        </form>
    );
  }

  renderRecordsList() {
    const { parserResponse } = this.state
    const records = parserResponse.records

    return records.map((record, i) => {
      const {
        ttl,
        type,
        hostname,
        value
      } = record
      return (
        <div className='record-wrapper' key={i}>
          <div className='record-info'>
            <p>{hostname} {type} {ttl} {value}</p>
            <button
              onClick={() => this.createRecord(hostname, type, ttl, value)}>
              Create record
            </button>
          </div>
        </div>
      )
    })
  }

  render() {
    const { parserResponse } = this.state

    if (parserResponse === '') {
      return <div>{this.renderZoneFileForm()}</div>
    }

    return (
      <div>
        <h2>{parserResponse.name}</h2>
        <button onClick={() => this.createZone(parserResponse.name)}>
          Create zone
        </button>
        <div>
          {this.renderRecordsList()}
        </div>
      </div>
    );
  }
}