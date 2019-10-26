import React from 'react';
import axios from 'axios';

export default class Python extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        data: "",
        filename: "myPythonCode.py"
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.download = this.download.bind(this);
    this.run = this.run.bind(this);
    this.save = this.save.bind(this);

  }

  handleFileNameChange(event) {
      this.setState({filename: event.target.value});
  }

  handleInputChange(event) {
      this.setState({data: event.target.value});
  }

  download(event) {
      console.log("download listener");
      event.preventDefault();
      var element = document.createElement('a');
      var filename = this.state.filename;
      if(filename.substring(filename.length-3)!=".py"){
          filename += ".py";
      }
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.data));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  }

  run(event){
      console.log(this.props.bot_name);
      axios({
          method:'POST',
          url:'/start',
          data: JSON.stringify({
              key: 'SCRIPTS',
              value: [this.state.data],
              bot_name: this.props.bot_name
          }),
      })
      .then(function(response) {
          console.log(axois.data.value);
          console.log('sent script');
      })
      .catch(function (error) {
          console.warn(error);
      });
  }

  save(event) {
      axios({
          method:'POST',
          url:'/start',
          data: JSON.stringify({
              key: 'SCRIPTS',
              value: [this.state.filename, this.state.data],
              bot_name: this.props.bot_name
          }),
      })
      .then(function(response) {
          console.log('save script');
      })
      .catch(function (error) {
          console.warn(error);
      });
  }

  render() {
    return (
      <div>
      {/*
        <div> File name:  <input type="text" name="filename" value={this.state.filename} onChange={this.handleFileNameChange}/> </div>
        <div> <textarea onChange={this.handleInputChange} /></div>
        <button id="submit" onClick={this.download}>Download</button>
        <button id="run" onClick={this.run}>Run Code</button>
        <button id="save" onClick={this.save}>Save Code</button>
        <div>{this.state.data}</div>
        <div>{this.state.filename}</div>
        */}
      </div>
    )
  }
}
