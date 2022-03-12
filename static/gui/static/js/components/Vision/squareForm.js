import React from 'react'

export default function SquareForm() {
  return (
    <React.Fragment>
  <form class='form-inline'>
  <div class="input-group mb-2 mr-sm-2">
  <input type="text" class="form-control" id="centerXCoordinate" placeholder="X-Coordinate"/>
  </div>
  <div class="input-group mb-2 mr-sm-2">
  <input type="text" class="form-control" id="centerYCoordinate" placeholder="Y-Coordinate"/>
  </div>
  <div class="input-group mb-2 mr-sm-2">
  <input type="text" class="form-control" id="radiusSquare" placeholder="Radius"/>
  </div>
  </form>
    </React.Fragment>
  )
}
