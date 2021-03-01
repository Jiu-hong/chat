import React, { useRef, useContext, useState } from 'react'
import { Form, Button, Container } from 'react-bootstrap'
//import LocalStorage from './LocalStorage'
//import { v4 as uuidV4 } from 'uuid'
import { ContactsContext } from '../context/ContactProvider'

export default function RegisterCom({ onSubmit }) {
    const [regErrs, setRegErrs] = useState([])

    // const value = useContext(ContactsContext)
    const { registerUser } = useContext(ContactsContext)

    const regEmailRef = useRef()
    const regNameRef = useRef()
    const regPwdRef = useRef()
    const regConPwdRef = useRef()

    const handleRegister = (e) => {
        e.preventDefault()

        setRegErrs([])
        let validate = true

        if (!regEmailRef.current.value) {
            validate = false
            setRegErrs((prevregErrs) => [...prevregErrs, 'Email is null'])
        }
        if (!regPwdRef.current.value) {
            validate = false
            setRegErrs((prevregErrs) => [...prevregErrs, 'Password is null'])
        }

        if (regPwdRef.current.value !== regConPwdRef.current.value) {
            validate = false
            setRegErrs((prevregErrs) => [
                ...prevregErrs,
                'Password is inconsistent',
            ])
        }
        if (validate) {
            registerUser(
                regEmailRef.current.value,
                regNameRef.current.value,
                regPwdRef.current.value,
                regConPwdRef.current.value
            )
                .then((s) => {
                    onSubmit(
                        regEmailRef.current.value,
                        regNameRef.current.value
                    )
                })
                .catch((err) =>
                    setRegErrs((prevregErrs) => [...prevregErrs, err])
                )
        }
    }

    return (
        <Container
            style={{ height: '100vh' }}
            className="d-flex flex-grow-1  align-items-center"
        >
            <Form onSubmit={handleRegister}>
                <Form.Group style={{ height: '20vh' }}>
                    <div className="text-danger">
                        {regErrs.map((err, index) => (
                            <div key={index}>{err}</div>
                        ))}
                    </div>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Your Email </Form.Label>
                    <Form.Control type="email" ref={regEmailRef} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Your name(shown)</Form.Label>
                    <Form.Control type="text" ref={regNameRef} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Your Password </Form.Label>
                    <Form.Control type="password" ref={regPwdRef} />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Confirm Password </Form.Label>
                    <Form.Control type="password" ref={regConPwdRef} />
                </Form.Group>
                <Button type="submit" className="rounded-0 mr-2">
                    Register
                </Button>
            </Form>
        </Container>
    )
}
