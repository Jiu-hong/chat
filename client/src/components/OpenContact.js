import React, { useContext } from 'react'

import { ContactsContext } from '../context/ContactProvider'
import { ConversationContext } from '../context/ConversationProvider'
import { Card, Button } from 'react-bootstrap'

export default function OpenContact({ setKey1, CONVERSATIONS }) {
    const { selectedContact, deleteContact } = useContext(ContactsContext)
    const { startConversation } = useContext(ConversationContext)

    const handleSend = () => {
        startConversation(selectedContact.id, [selectedContact.id], 'contact')

        setKey1(CONVERSATIONS)
    }

    const handleDltContact = () => {
        deleteContact(selectedContact.id)
    }

    return (
        /* <div className="d-flex flex-column flex-grow-1">*/
        <div className="flex-grow-1 overflow-auto">
            {/*   <div className="d-flex flex-column align-items-start justify-content-end px-3">*/}
            {selectedContact && (
                <Card>
                    <Card.Body>
                        <Card.Title>{selectedContact.name}</Card.Title>
                        <Card.Text> ID:{selectedContact.id}</Card.Text>
                        <Button
                            variant="primary"
                            className="rounded-0 mr-2"
                            onClick={handleSend}
                        >
                            Send Message
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-0"
                            onClick={handleDltContact}
                        >
                            Delete
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}
