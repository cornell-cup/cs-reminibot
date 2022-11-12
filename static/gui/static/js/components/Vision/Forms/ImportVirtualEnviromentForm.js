import { FontAwesomeIcon } from '@fortawesome/free-solid-svg-icons'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import React, { useState, useContext, useRef } from 'react'
import { withCookies } from 'react-cookie'
import { VirtualEnviromentContext } from '../../../context/VirtualEnviromentContext'
import { handleVirtualEnviromentImportForm } from './FormHandlers'

const ImportVirtualEnviromentForm = (props) => {
  const { virtualEnviroment, _setVirtualEnviroment } = useContext(VirtualEnviromentContext)
  const [virtualEnviromentFile, setVirtualEnviromentFile] = useState(null)
  const fileInput = useRef('')

  function handleFormSubmit(event) {
    event.preventDefault()
    handleVirtualEnviromentImportForm(virtualEnviroment, virtualEnviromentFile, props.virtualRoomId, clearForm)
  }

  function hasValidFile(files) {
    return files && files.length > 0 && files[0]
  }

  function clearForm() {
    document.querySelector('#virtualEnviromentFile').value = ''
    setVirtualEnviromentFile(null)
  }

  return (
    <React.Fragment>
      <form className='white-label' onSubmit={handleFormSubmit}>
        <div className='form-row'>
          <div className='form-group col-md-6'>
            <label htmlFor='id'>Virtual Enviroment File</label>
            <div className='input-group'>
              <div className='custom-file'>
                <input
                  type='file'
                  ref={fileInput}
                  className='custom-file-input'
                  id='virtualEnviromentFile'
                  accept='.json'
                  onChange={(e) => {
                    if (hasValidFile(e.target.files)) {
                      setVirtualEnviromentFile(e.target.files[0])
                    }
                  }}
                />
                <label className='custom-file-label' htmlFor='virtualEnviromentFile'>
                  {virtualEnviromentFile ? virtualEnviromentFile.name : 'Choose Virtual Enviroment File'}
                </label>
              </div>
            </div>
          </div>
        </div>
        <button type='submit' className='btn btn-success'>
          Import
        </button>
      </form>
    </React.Fragment>
  )
}

export default withCookies(ImportVirtualEnviromentForm)
