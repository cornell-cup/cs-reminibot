import React from "react";

const TestComponent = ({ title, items }) => {

  const [filteredItems, setFilteredItems] = useState(items);

  const handleChange = event => {
    let val = event.target.value;
    let filtered = items.filter((item) => {
      if (item == val) return item;
    })
    setFilteredItems
  }

  return (
    <div>
      <h3>{title}</h3>
      <form>
        <div className="form-control">
          <label>Search: </label>
          <input name="search" onChange={handleChange} />
        </div>
        <ul>
          {filteredItems.map((item) => {
            return <li>{item}</li>;
          })}
        </ul>
      </form>
    </div>
  )
}

export default TestComponent;