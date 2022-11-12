import React, { useState } from 'react'
import { withCookies } from 'react-cookie'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const VirtualRoomIdForm = (props) => {
  const [virtualRoomId, setVirtualRoomId] = useState(props.virtualRoomId)

  function handleFormSubmit(event) {
    event.preventDefault()
    props.cookies.set('virtual_room_id', virtualRoomId, { path: '/' })
  }

  return (
    <React.Fragment>
      <form className='white-label' onSubmit={handleFormSubmit}>
        <div className='form-row'>
          <div className='form-group col-md-6'>
            <label htmlFor='id'>Virtual Room ID</label>
            <div className='input-group'>
              <input
                type='text'
                className='form-control'
                id='id'
                placeholder='Virtual Room ID'
                value={virtualRoomId}
                onChange={(e) => {
                  setVirtualRoomId(e.target.value.replace(/\s/g, ''))
                }}
              />
              <div className='input-group-append'>
                <CopyToClipboard text={virtualRoomId} onCopy={() => alert('The virtual room ID has been copied to your clipboard')}>
                  <button className='btn btn-outline-secondary' type='button' id='copy'>
                    Copy to clipboard
                  </button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>
        <button type='submit' className='btn btn-success'>
          Submit
        </button>
      </form>
    </React.Fragment>
  )
}

export default withCookies(VirtualRoomIdForm)
