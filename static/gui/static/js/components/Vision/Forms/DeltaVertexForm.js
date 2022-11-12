import { set } from 'lodash'
import React, { useState } from 'react'

function DeltaVertexForm({ index, vertices, setVertices, step }) {
  return (
    <React.Fragment>
      <div className='form-group col-md-2'>
        <label htmlFor='x'>Vertex X position</label>
        <input
          type='number'
          className='form-control mb-2 mr-sm-2'
          id='x'
          placeholder='Vertex X Position'
          step={step}
          onChange={(e) => {
            console.log('before:', vertices[index])
            vertices[index]['x'] = parseFloat(e.target.value)
            console.log('after:', vertices[index])
          }}
          required
        />
      </div>
      <div className='form-group col-md-2'>
        <label htmlFor='y'>Vertex Y position</label>
        <input
          type='number'
          className='form-control mb-2 mr-sm-2'
          id='y'
          placeholder='Vertex Y Position'
          step={step}
          onChange={(e) => {
            console.log('before:', vertices[index])
            vertices[index]['y'] = parseFloat(e.target.value)
            console.log('after:', vertices[index])
          }}
          required
        />
      </div>
    </React.Fragment>
  )
}

export default DeltaVertexForm
