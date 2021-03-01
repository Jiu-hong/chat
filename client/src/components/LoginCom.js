import React, { useRef, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button, Container } from 'react-bootstrap'
//import LocalStorage from './LocalStorage'
//import { v4 as uuidV4 } from 'uuid'
import { ContactsContext } from '../context/ContactProvider'

export default function LoginCom({ onSubmit }) {
    const [logErr, setLogErr] = useState('')
    // const value = useContext(ContactsContext)
    const { loginUser } = useContext(ContactsContext)

    const emailRef = useRef()
    const pwdRef = useRef()

    const handleLogin = (e) => {
        e.preventDefault()
        //   onSubmit(idRef.current.value)
        loginUser(emailRef.current.value, pwdRef.current.value)
            .then((s) => {
                console.log(s)
                onSubmit(s.email, s.username)
            })
            .catch((err) => setLogErr(err))
    }

    return (
        <Container
            style={{ height: '100vh' }}
            className="d-flex flex-grow-1  align-items-center"
        >
            <Form onSubmit={handleLogin}>
                <Form.Group style={{ height: '20vh' }}>
                    <div className="text-danger">{logErr}</div>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Your Email </Form.Label>
                    <Form.Control type="text" ref={emailRef} />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Your Password </Form.Label>
                    <Form.Control type="password" ref={pwdRef} />
                </Form.Group>
                <Form.Group>
                    <Link to="/auth/forgotpassword">forgot password</Link>
                </Form.Group>
                <Button type="submit" className="rounded-0 mr-2">
                    Login
                </Button>
            </Form>
        </Container>
    )
}
