import React from 'react'
import GridView from './gridview'

export default function Vision() {
  return (
    <React.Fragment>Vision
      <GridView view_width={1000}
        view_height={1000}
        world_width={300}
        world_height={300}
        defaultEnabled={true} />
    </React.Fragment>
  )
}
