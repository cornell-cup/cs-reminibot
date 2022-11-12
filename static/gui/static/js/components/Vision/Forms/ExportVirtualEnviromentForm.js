import { FontAwesomeIcon } from '@fortawesome/free-solid-svg-icons'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import React, { useState, useContext } from 'react'
import { withCookies } from 'react-cookie'
import { VirtualEnviromentContext } from '../../../context/VirtualEnviromentContext'

const ExportVirtualEnviromentForm = (props) => {
  const { virtualEnviroment, _setVirtualEnviroment } = useContext(VirtualEnviromentContext)
  const [filename, setFilename] = useState('virtual_enviroment.json')

  return (
    <React.Fragment>
      <form className='white-label'>
        <div className='form-row'>
          <div className='form-group col-md-6'>
            <label htmlFor='filename'>Virtual Enviroment Filename</label>
            <div className='input-group'>
              <input
                type='text'
                className='form-control'
                id='filename'
                placeholder='Virtual Enviroment Filename'
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value.replace(/\s/g, ''))
                }}
              />
              <div className='input-group-append'>
                <a download={filename} href={virtualEnviroment.getDownloadableFileHref()}>
                  <button className='btn btn-outline-success' type='button' id='download'>
                    Download
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </React.Fragment>
  )
}

export default withCookies(ExportVirtualEnviromentForm)
