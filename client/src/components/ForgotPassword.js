import React, { useRef, useContext, useState } from 'react'

import { Form, Button, Container } from 'react-bootstrap'

import { ContactsContext } from '../context/ContactProvider'

export default function ForgotPassword() {
    const [info, setInfo] = useState('')
    // const value = useContext(ContactsContext)
    const { forgotPassword } = useContext(ContactsContext)

    const emailRef = useRef()

    const handleSubmit = (e) => {
        e.preventDefault()
        forgotPassword(emailRef.current.value)
            .then((s) => setInfo(s))
            .catch((e) => console.log(e))
    }

    return (
        <Container
            style={{ height: '100vh' }}
            className="d-flex flex-grow-1  align-items-center"
        >
            <Form onSubmit={handleSubmit}>
                <Form.Group style={{ height: '20vh' }}>
                    <div>{info}</div>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Forgot Password </Form.Label>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Please input your Email </Form.Label>
                    <Form.Control type="text" ref={emailRef} />
                </Form.Group>
                <Button type="submit" className="rounded-0 mr-2">
                    submit
                </Button>
            </Form>
        </Container>
    )
}
