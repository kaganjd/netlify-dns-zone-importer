import React, { Component } from 'react'

export default class ZoneForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        file: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({file: e.target.files[0]});
  }

  handleSubmit(e) {
    e.preventDefault()
    const { accountSlug, token } = this.props
    const { file } = this.state
    console.log(this.props)
    var formData = new FormData()
    formData.append("file", file);
    formData.append("account", accountSlug)
    formData.append("token", token)
    fetch('https://with-oauth--festive-rosalind-201bbd.netlify.app/.netlify/functions/hello-world', {
        method: 'POST',
        body: formData
    })
    .then(success => console.log(success))
    .catch(error => alert(error))
  }

  render() {
    return (
        <div>
        <div>{this.state.accountSlug}</div>
      <form onSubmit={this.handleSubmit}>
        <label>Zone file:</label>
        <input type="file" onChange={this.handleChange} />
        <button type="submit">Submit</button>
      </form>
      </div>
    );
  }
}