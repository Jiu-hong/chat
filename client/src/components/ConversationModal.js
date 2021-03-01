import React, { useContext, useState, useRef } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { ContactsContext } from '../context/ContactProvider'
import { ConversationContext } from '../context/ConversationProvider'

export default function ConversationModal({ closeModal }) {
    const roomnameRef = useRef()
    const [selectedContactIds, setSelectedContactIds] = useState([])

    const { contacts } = useContext(ContactsContext)

    const { startConversation } = useContext(ConversationContext)
    const handleSubmit = async (e) => {
        //add conversation

        e.preventDefault()

        startConversation(
            selectedContactIds.length > 1 ? '' : selectedContactIds[0],
            selectedContactIds,
            selectedContactIds.length > 1 ? 'community' : 'contact',
            selectedContactIds.length > 1 ? roomnameRef.current.value : ''
        )

        closeModal()
    }

    const handleCheckboxChange = (id) => {
        setSelectedContactIds((prevSelectedContactIds) => {
            if (prevSelectedContactIds.includes(id)) {
                return prevSelectedContactIds.filter((prevId) => prevId !== id)
            } else {
                return [...prevSelectedContactIds, id]
            }
        })
    }

    return (
        <>
            <Modal.Header closeButton>Create Conversation</Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {contacts.map((contact) => (
                        <Form.Group key={contact.id}>
                            <Form.Check
                                label={contact.name}
                                type="checkbox"
                                value={selectedContactIds.includes(contact.id)}
                                onChange={() =>
                                    handleCheckboxChange(contact.id)
                                }
                            />
                        </Form.Group>
                    ))}
                    {selectedContactIds.length > 1 ? (
                        <Form.Group>
                            <Form.Control
                                type="text"
                                ref={roomnameRef}
                                placeholder="conversation name"
                                required
                            />
                        </Form.Group>
                    ) : null}
                    <Button type="submit">Create</Button>
                </Form>
            </Modal.Body>
        </>
    )
}
