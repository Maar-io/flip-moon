import React from 'react'
import { Table } from 'react-bootstrap'

export default function AccountBalance(props) {
  return (
    <Table striped bordered >
      <thead>
        <tr>
          <th>Contract Balance</th>
          <th>Your Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.contractBal}</td>
          <td>{props.accountBal}</td>
        </tr>
      </tbody>
    </Table>
  )
}
