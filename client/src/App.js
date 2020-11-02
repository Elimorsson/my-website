import React, { Component } from 'react';
import './App.css';
import axios from 'axios';


class App extends Component {
  state = {
    response: ""
  };

  componentDidMount(){
    axios.get(`/api/v1/say-somthing`).then((res) => {
      const response = res.data.answer;
      this.setState({response});
    });
  }


  render(){
    return (
      <div className="App">
        <h1>Hello Elimor from the frontend!</h1>
        <h1>{this.state.response}</h1>
        <h2>After server msg</h2>
      </div>
    );
  }
}


export default App;
