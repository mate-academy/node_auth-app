import React from 'react'

const Notification: React.FC<{message: string}> = ({message}) => {
  return (
    <div
      className='message'
      style={{
        backgroundColor: message === 'Success!'
          ? 'green'
          : 'red'
      }}
    >{message}</div>
  )
}

export default Notification
