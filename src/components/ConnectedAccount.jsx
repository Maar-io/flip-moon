import React from 'react'

export default function ConnectedAccount(props) {
  const robolink = 'https://robohash.org/' + props.account
  return (
    < >
      <h6 >
        Connected account: {props.account}
      </h6>
      <img img src={robolink} height="120" alt="RoboHash" />
      </>
  )
}
