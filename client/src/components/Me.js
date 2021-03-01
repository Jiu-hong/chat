import React from 'react'
import { ListGroup } from 'react-bootstrap'

export default function Me({ setSubKey, REQUESTS, CONTACTS, ROOMS }) {
    return (
        <ListGroup>
            <ListGroup.Item action active>
                My Profile
            </ListGroup.Item>
        </ListGroup>
    )
}
