import React, { Component } from 'react';

export default class ZoneForm extends Component {
  encode = data => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&")
  } 
  handleSubmit = e => {
    e.preventDefault()
    fetch('/', {
      method: 'POST',
      headers: { "Content-Type": "multipart/form-data" },
      body: this.encode({
        "form-name": e.target.getAttribute("name")
      })
    })
    .then(() => console.log('Form successfully submitted'))
    .catch((error) => alert(error))
  }
  render() {
    return (
        <div className='zone-file-input' >
          <form method="post" name="zone-importer-with-ntl-form" id="z" data-netlify="true">
              <label>Zone file</label>
              <input type="file" name="zone" accept=".txt"/>
              <button className="primaryButton" onClick={this.handleSubmit}>
                Submit
              </button>
          </form>
        </div>
    )
  } 
}