export default function PortsList({ motorPorts }) {
  const [selectedPorts, setSelectedPorts] = useState({});

  const handleSelect = (value, port) => {
    setSelectedPorts((prevState) => ({ ...prevState, [port]: value }));
  };

  let allListElements = [];

  for (let i = 0; i < ports.length; i++) {
    const port = ports[i];
    const selectedValue = selectedPorts[port];

    let buttonElement = null;
    if (selectedValue) {
      buttonElement = (
        <button
          className="btn btn-secondary"
          onClick={() => alert(selectedValue)}
        >
          {selectedValue}
        </button>
      );
    }

    const element = (
      <div key={port} className="form-group row">
        <label htmlFor={port} className="col-md-4 d-flex">
          Port {port}:
        </label>
        <div className="col-md-8">
          <select
            className="custom-select custom-select-sm"
            name={port}
            id={port}
            onChange={(event) => handleSelect(event.target.value, port)}
          >
            <option value="">Select connection...</option>
            {connectionOptions}
          </select>
        </div>
        {buttonElement}
      </div>
    );

    allListElements.push(element);
  }

  return (
    <div className="port-form collapse" id="ports-list">
      {allListElements}
    </div>
  );
}
