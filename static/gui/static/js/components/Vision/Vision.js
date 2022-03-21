import React from 'react'
import GridviewWithPhysics from './gridviewWithPhysics'
import VisionUserInterface from './VisionUserInterface'

const Vision = (props) => {
  return (
    <React.Fragment>Vision
      <VisionUserInterface />
      <GridviewWithPhysics
        world_width={1000}
        world_height={1000}
        defaultEnabled={true} />

    </React.Fragment>
  )
}

export default Vision;
