import React from 'react';

/**
 * Component for the Blockly sandbox
 */
export default class MinibotBlockly extends React.Component {
    constructor(props) {
        super(props);
        this.scriptToCode = this.scriptToCode.bind(this);
        this.state = {
            blockly_filename:"myXmlBlocklyCode.xml",
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.download = this.download.bind(this);
        this.upload = this.upload.bind(this);
    }

    /* handles input change for file name and coding textboxes */
    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;

        this.setState({
            [name]: value
        });
    }

    /* Runs after component loads - this generates the blockly stuff */
    componentDidMount() {
        var _this = this;
        _this.workspace = window.Blockly.inject('blocklyDiv',
            {
                toolbox: document.getElementById('toolbox'),
                grid: {
                    spacing:20,
                    length:3,
                    colour: '#ccc',
                    snap: true
                },
                trashcan: true,
                scroll: true
            });

        /* Realtime code generation
          (Every drag/drop or change in visual code will be
          reflected in actual code view) */
        _this.workspace.addChangeListener(function(event){
            console.log('workspace change listener');
            _this.scriptToCode();
        });
    }

    /* Helper for realtime code generation (Blockly => Python) */
    scriptToCode() {
        document.getElementById('data').innerText = window.Blockly.Python.workspaceToCode(this.workspace);
    }

     /* DOWNLOAD FUNCTION
       Allows users to download raw code as a file. Users must
       manually input file name and file ext.
    */
    download(event) {
        event.preventDefault();
        var element = document.createElement('a');
        var xmlDom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
        var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
        var filename = this.state.blockly_filename;
        if(filename.substring(filename.length-4)!=".xml"){
            filename += ".xml";
        }
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlText));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    upload(event) {
        var _this = this;
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            _this.state.data = event.target.result;
            document.getElementById("data").value = event.target.result;
        };
        reader.readAsText(file);
    }

    loadFileAsBlocks(event) {
  	    var xmlToLoad = document.getElementById("blockUpload").files[0];
 	    var xmlReader = new FileReader();
 	    xmlReader.onload = function(event){
            var textFromFileLoaded = event.target.result;
            console.log(textFromFileLoaded);
            var dom = Blockly.Xml.textToDom(textFromFileLoaded);
            Blockly.getMainWorkspace().clear();
            Blockly.Xml.domToWorkspace(dom, Blockly.getMainWorkspace());
         };

 	    xmlReader.readAsText(xmlToLoad, "UTF-8");
 	 }

    render() {
        var blocklyStyle = {margin:'0', height: '67vh'};
        return (
            <div id="blocklyContainer" class="row">
            <div id="blockly" className = "box" class="col-md-7">
                <div id ="blocklyDiv" style={blocklyStyle}>Blockly</div><br/>
                Blockly File Name: <input type="text" name="blockly_filename" value={this.state.blockly_filename} onChange={this.handleInputChange}/>
                <button id="blocklySubmit" onClick={this.download}>Download</button>
                <form>
                    <input
                        type="file"
                        id="blockUpload"
                        multiplesize="1"
                        accept=".xml"
                        onChange = {this.loadFileAsBlocks}
                    />
                </form>
            </div>
            <div id="data" class="col-md-5">

            </div>
        </div>
        )
    }
}
