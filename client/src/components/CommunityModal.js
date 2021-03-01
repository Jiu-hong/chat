import React, { useContext, useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { ContactsContext } from '../context/ContactProvider'
import { ConversationContext } from '../context/ConversationProvider'

export default function CommunityModal({ closeModal, roomId }) {
    const [selectedContactIds, setSelectedContactIds] = useState([])

    const { contacts } = useContext(ContactsContext)

    const { addToCommunity, selectedConversation } = useContext(
        ConversationContext
    )
    const handleSubmit = (e) => {
        //add conversation

        e.preventDefault()

        addToCommunity(
            roomId,
            selectedContactIds,
            selectedConversation.recipients
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
            <Modal.Header closeButton>Add member to Conversation</Modal.Header>
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
                    <Button type="submit">Add</Button>
                </Form>
            </Modal.Body>
        </>
    )
}
