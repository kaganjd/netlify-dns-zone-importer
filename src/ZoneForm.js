import React, { Component } from 'react'

export default class ZoneForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        fileOut: ''
    };
    this.handleReadFileContents = this.handleReadFileContents.bind(this)
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInput(e) {
    let reader = new FileReader();
    reader.onload = r => {
        this.handleReadFileContents(r.target.result)
    };
    reader.readAsText(e.target.files[0])
  }

  handleReadFileContents(f) {
    this.setState({
        fileOut: f
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    const { fileOut } = this.state
    console.log(fileOut)
    fetch('https://with-oauth--festive-rosalind-201bbd.netlify.app/.netlify/functions/hello', {
        method: 'POST',
        body: fileOut
    })
    .then(response => console.log(response.body))
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