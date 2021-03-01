import React, { useContext, useRef, useState } from 'react'
import { Form, Button, Modal } from 'react-bootstrap'
import { ContactsContext } from '../context/ContactProvider'

export default function ContactModal({ closeModal }) {
    const [request, setRequest] = useState(false)
    const [result, setResult] = useState('')
    const [contactid, setContactid] = useState('')
    const [contactcomment, setContactcomment] = useState('')
    const idRef = useRef()
    const requestRef = useRef()
    const { contacts, searchContact, requestContact } = useContext(
        ContactsContext
    )
    const handleSubmit = (e) => {
        e.preventDefault()
        //create Contact

        requestContact(contactid, requestRef.current.value)

        closeModal()
    }
    const handleSearch = (e) => {
        e.preventDefault()

        if (contacts.find((contact) => contact.id === idRef.current.value)) {
            setResult(idRef.current.value + ' is already in your contacts list')
        } else {
            //
            searchContact(idRef.current.value)
                .then(({ recipient, comment }) => {
                    setRequest(true)
                    setContactid(recipient)
                    setContactcomment(comment)
                })
                .catch((NG) => setResult(NG))
        } //
    }
    const step2 = (
        <>
            <Modal.Header closeButton>Add Contact</Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Contact id: </Form.Label>
                        <Form.Label> {contactid} </Form.Label>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Comment: </Form.Label>
                        <Form.Label> {contactcomment} </Form.Label>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label> Request comment (max 100) </Form.Label>
                        <Form.Control
                            as="textarea"
                            maxLength="100"
                            ref={requestRef}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Button type="submit">Send Request</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </>
    )
    const step1 = (
        <>
            <Modal.Header closeButton>Add Contact</Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSearch}>
                    <Form.Group>
                        <Form.Label>Contact id </Form.Label>
                        <Form.Control ref={idRef} />
                    </Form.Group>
                    <Form.Group>
                        <div>{result}</div>
                    </Form.Group>
                    <Form.Group>
                        <Button type="submit">Search</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </>
    )
    return request ? step2 : step1
}
