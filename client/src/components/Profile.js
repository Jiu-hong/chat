import React, { useRef, useContext } from 'react'
import { ContactsContext } from '../context/ContactProvider'
import { ConversationContext } from '../context/ConversationProvider'
import { Form, Button, InputGroup, Card } from 'react-bootstrap'

export default function Profile({ id, name, onSubmit, logout }) {
    const { updateName } = useContext(ContactsContext)
    const { clearLocal } = useContext(ConversationContext)

    const nameRef = useRef()
    const handleSubmit = (e) => {
        e.preventDefault()
        //?? db update to do
        updateName(nameRef.current.value)
        //updatelocal
        onSubmit(nameRef.current.value)
    }

    const handleLogout = () => {
        //store local coversations,contacts,rooms to DB
        clearLocal()
        //clear local coversations,contacts,id,rooms
        logout()
    }
    return (
        <div className="flex-grow-1 overflow-auto">
            <Card>
                <Card.Body>
                    <Card.Title>{id}</Card.Title>
                    <Card.Text> Name:{name}</Card.Text>
                    <Form.Group>
                        <Form.Label className="text-muted">
                            Change Name{' '}
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                ref={nameRef}
                                className="shadow-none"
                            />
                            <InputGroup.Append>
                                <Button
                                    type="submit"
                                    className="rounded-0 mr-2"
                                    onClick={handleSubmit}
                                >
                                    Update
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                    <Button
                        type="submit"
                        className="rounded-0 mr-2"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Card.Body>
            </Card>
        </div>
    )
}
