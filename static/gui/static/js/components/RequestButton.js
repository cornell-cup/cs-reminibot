import React from 'react'
import axios from 'axios'

/**
 * A RequestButton sends HTTP requests to the base station's
 * built-in script handler, capable of starting and stopping
 * scripts that exist in the base station's directory.
 */
export default class RequestButton extends React.Component {
  /**
   * @param props.args: The properties of the request to send that are
   * known at construction-time. The args are in this format
   * {
   *    "required": {
   *      "label" : "flag",
   *      "label2" : "flag2", etc.
   *    }
   *    "optional" {
   *      "label3" : "flag3", etc.
   *    }
   * }
   * As in a normal command line, no two flags should EVER be the same.
   * To avoid confusing users, no two labels should ever be the same.
   */
  constructor(props) {
    super(props)
    this.state = {
      stopOnNextClick: false,
      menuVisible: false,
      args: {}
    }
    this.clicked = this.clicked.bind(this)
    this.runScript = this.runScript.bind(this)
    this.stopScript = this.stopScript.bind(this)
    this.filterArgs = this.filterArgs.bind(this)
  }

  clicked(_) {
    if (this.state.stopOnNextClick) {
      this.stopScript()
    } else {
      this.runScript()
    }
  }

  // Send an HTTP request to ask the base station to run a script
  runScript() {
    const _this = this
    console.log('Running script with')
    console.log('Props')
    console.log(_this.props)
    console.log('State')
    console.log(_this.state)

    axios({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      url: '/builtin-script',
      data: JSON.stringify({
        op: 'START',
        path: this.props.path,
        script_name: this.props.script_name,
        args: this.state.args
      })
    })
      .then(function (res) {
        console.log('SUCCESS')
        console.log('Handle: ' + res.data.handle)
        _this.setState({
          handle: res.data.handle,
          stopOnNextClick: true,
          running: true
        })
      })
      .catch(function (err) {
        console.log('ERROR')
        console.log(err)
      })
  }

  // Send an HTTP request asking the base station to stop a script
  stopScript() {
    const _this = this
    console.log('Stopping script with')
    console.log('Props')
    console.log(_this.props)
    console.log('State')
    console.log(_this.state)

    this.setState({ stopOnNextClick: false })

    axios({
      method: 'POST',
      url: '/builtin-script',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        op: 'STOP',
        path: this.props.path,
        script_name: this.props.script_name,
        handle: this.state.handle,
        args: _this.filterArgs(this.state.args)
      })
    })
      .then(function (res) {
        console.log('SUCCESS')
        console.log(res)
        _this.setState({
          stopOnNextClick: false,
          running: false
        })
      })
      .catch(function (err) {
        console.log('ERROR')
        console.log(err)
      })
  }

  filterArgs(args, schema) {
    var ret = JSON.parse(JSON.stringify(this.state.args))
    for (var key in ret) {
      if (ret[key] == '' || ret[key] == null || ret[key] == undefined) {
        delete ret[key]
      }
    }
    return ret
  }

  /**
   * Make arg fields, parsing `obj` (a JSON describing args).
   * `isRequired` should be true if all args in `obj` should be marked
   *  as required. This DOES NOT perform / guarantee any validation.
   */
  makeArgFields(obj, isRequired) {
    return Object.entries(obj).map(([k, v]) => {
      return (
        <div className='arg-group'>
          <p>
            {k} ({isRequired ? 'required' : 'optional'}):
          </p>
          <input
            type='text'
            name={v}
            onChange={(e) => {
              var copy = JSON.parse(JSON.stringify(this.state.args))
              copy[v] = e.target.value
              console.log('NEW ARGS')
              console.log(this.state.args)
              this.setState({ args: copy })
            }}
          />
        </div>
      )
    })
  }

  /** Toggle menu visibility */
  toggleMenu() {
    this.setState({ menuVisible: !this.state.menuVisible })
  }

  // TODO make the menu look prettier
  render() {
    return (
      <div>
        <button onClick={() => this.toggleMenu()}>{this.props.name}</button>
        {this.state.menuVisible && (
          // TODO refactor style attr into CSS
          <div className='arg-menu' style={{ backgroundColor: 'orange' }}>
            {this.makeArgFields(this.props.args.required, true)}
            {this.makeArgFields(this.props.args.optional, false)}
            <button onClick={(e) => this.clicked(e)}>{this.state.running ? 'Stop' : 'Go'}</button>
          </div>
        )}
      </div>
    )
  }
}
