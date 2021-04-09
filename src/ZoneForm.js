import React, { Component } from 'react'

export default class ZoneForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        fileOut: ''
    };
    this.returnFileContents = this.returnFileContents.bind(this)
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInput(e) {
    let reader = new FileReader();
    reader.onload = r => {
        this.returnFileContents(r.target.result)
    };
    reader.readAsText(e.target.files[0])
  }

  returnFileContents(f) {
    this.setState({
        fileOut: f
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    const { fileOut } = this.state
    console.log(fileOut)
    fetch('https://with-oauth--festive-rosalind-201bbd.netlify.app/.netlify/functions/hello-world', {
        method: 'POST',
        body: fileOut
    })
    .then(success => console.log(success))
    .catch(error => alert(error))
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>Zone file:</label>
        <input type="file" accept=".txt" onChange={this.handleInput} />
        <button type="submit">Submit</button>
      </form>
    );
  }
}