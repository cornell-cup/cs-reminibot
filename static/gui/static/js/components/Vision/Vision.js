import React from 'react'
import GridView from './gridview'
import VisionUserInterface from './VisionUserInterface'

export default function Vision() {
  return (
    <React.Fragment>Vision
      <circleForm/>
      <GridView view_width={1000}
        view_height={1000}
        world_width={300}
        world_height={300}
        defaultEnabled={true} />

    </React.Fragment>
  )
}
