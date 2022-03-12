import React from 'react'

export default function PolygonForm() {
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
          <div class="form-group col-md-6">
          </div>
          <div class="form-group col-md-6">
            <label for="inputPassword4">Password</label>
            <input type="password" class="form-control" id="inputPassword4" />
          </div>
        </div>
        <div class="form-group">
          <label for="inputAddress">Address</label>
          <input type="text" class="form-control" id="inputAddress" placeholder="1234 Main St" />
        </div>
        <div class="form-group">
          <label for="inputAddress2">Address 2</label>
          <input type="text" class="form-control" id="inputAddress2" placeholder="Apartment, studio, or floor" />
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="inputCity">City</label>
            <input type="text" class="form-control" id="inputCity" />
          </div>
          <div class="form-group col-md-4">
            <label for="inputState">State</label>
            <select id="inputState" class="form-control">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div class="form-group col-md-2">
            <label for="inputZip">Zip</label>
            <input type="text" class="form-control" id="inputZip" />
          </div>
        </div>
        <div class="form-group">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="gridCheck" />
            <label class="form-check-label" for="gridCheck">
              Check me out
            </label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Sign in</button>
      </form>
    </React.Fragment>
  )
}
