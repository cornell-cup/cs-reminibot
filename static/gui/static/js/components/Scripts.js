import React from 'react';
import axios from 'axios';


export default class Scripts extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          bot_name: "",
          scripts: []
      }

      this.getScripts = this.getScripts.bind(this);

  }

  //data field is empty
  getScripts() {
       const _this = this;
       console.log(this.state.bot_name);
       axios({
           method:'POST',
           url:'/start',
           data: JSON.stringify({
               key: "SCRIPTS",
               bot_name: this.state.bot_name,
               value: []
              })
           })
               .then(function(response) {
                   _this.setState({scripts: response.data});
           })
               .catch(function (error) {
                   console.log(error);
       });
  }

  componentDidUpdate() {
      if (this.props.bot_name != this.state.bot_name){
          const _this = this;
          _this.setState({ bot_name: this.props.bot_name }, () => {
            console.log("updated script name: " + this.state.bot_name);
            this.getScripts();
          });

      }
  }

  render() {
      return (
          <div>
          {/*
            <div> Scripts For:  {this.props.bot_name} </div>
            <div>
                <div>Select Script</div>
            </div>
            <div> Run Script </div>
            <div> <Python bot_name={this.state.bot_name}/> </div>
            <div> Save Script </div>
          */}
          </div>
      )
  }
}
