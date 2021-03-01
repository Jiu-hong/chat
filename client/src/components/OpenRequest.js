import React, { useContext } from 'react'

import { ContactsContext } from '../context/ContactProvider'
import { RequestsContext } from '../context/RequestProvider'
import { Card, Button } from 'react-bootstrap'

export default function OpenRequest() {
    const { selectedRequest, deleteRequest } = useContext(RequestsContext)
    const { addContact } = useContext(ContactsContext)

    const handleApprove = () => {
        addContact({
            contactid: selectedRequest.id,
            contactname: selectedRequest.name,
        })
    }
    const handleDecline = () => {
        // socket.emit("decline", {})
        //delete request
        deleteRequest(selectedRequest.id)
    }
    return (
        <div className="flex-grow-1 overflow-auto">
            {selectedRequest && (
                <Card>
                    <Card.Body>
                        <Card.Title>
                            {selectedRequest.name} is waiting for your response
                        </Card.Title>
                        <Card.Text>ID: {selectedRequest.id}</Card.Text>
                        {selectedRequest.comments.map((comment, index) => (
                            <Card.Text key={index}>
                                {comment.reqmsgtime} request:{' '}
                                {comment.requestmsg}
                            </Card.Text>
                        ))}

                        <Button
                            className="rounded-0"
                            variant="primary"
                            onClick={handleApprove}
                        >
                            Approve
                        </Button>
                        <Button
                            className="ml-2 rounded-0"
                            variant="secondary"
                            onClick={handleDecline}
                        >
                            Decline
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}
