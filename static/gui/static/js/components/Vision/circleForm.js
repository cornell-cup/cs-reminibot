import React from 'react'

export default function CircleForm() {
  return (
    <React.Fragment>
      <div class="form-row">
        <div class="form-group col-md-3">
          <label class="sr-only" for="x">x</label>
          <input type="text" class="form-control mb-2 mr-sm-2" id="x" placeholder="center x" />
        </div>
        <div class="form-group col-md-3">
          <label class="sr-only" for="y">y</label>
          <input type="text" class="form-control mb-2 mr-sm-2" id="y" placeholder="center y" />
        </div>
        <div class="form-group col-md-3">
          <label class="sr-only" for="r">radius</label>
          <input type="text" class="form-control mb-2 mr-sm-2" id="r" placeholder="radius" />
        </div>
      </div>
    </React.Fragment>

  )
}
