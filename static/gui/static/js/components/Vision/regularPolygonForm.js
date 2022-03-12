import React from 'react'

export default function RegularPolygonForm() {
  return (
    <React.Fragment>
      <form className='white-label'>
        <div class="form-row">
          <div class="form-group col-md-3">
            <label for="x">X position</label>
            <input type="number" class="form-control" id="x" />
          </div>
          <div class="form-group col-md-3">
            <label for="y">Y position</label>
            <input type="number" class="form-control" id="y" />
          </div>
          <div class="form-group col-md-3">
            <label for="numberOfSides">Number of sides</label>
            <input type="number" class="form-control" id="numberOfSides" />
          </div>
          <div class="form-group col-md-3">
            <label for="sideLength">Side length</label>
            <input type="number" class="form-control" id="sideLength" />
          </div>
          <button class="btn btn-success">Submit</button>
      </form>
    </React.Fragment>
  )
}
