import React, { useRef, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Form, Button } from 'react-bootstrap'
import { ContactsContext } from '../context/ContactProvider'

export default function ResetPassword({ onSubmit }) {
    const { resetPassword } = useContext(ContactsContext)
    let { token } = useParams()
    const [errs, setErrs] = useState([])
    const [info, setInfo] = useState()
    const emailRef = useRef()
    const pwdRef = useRef()
    const conPwdRef = useRef()

    const handleSubmit = (e) => {
        e.preventDefault()

        setErrs([])
        let validate = true

        if (!emailRef.current.value) {
            validate = false
            setErrs((prevErrs) => [...prevErrs, 'Email is null'])
        }
        if (!pwdRef.current.value) {
            validate = false
            setErrs((prevErrs) => [...prevErrs, 'Password is null'])
        }

        if (pwdRef.current.value !== conPwdRef.current.value) {
            validate = false
            setErrs((prevErrs) => [...prevErrs, 'Password is inconsistent'])
        }
        if (validate) {
            resetPassword(
                token,
                emailRef.current.value,
                pwdRef.current.value,
                conPwdRef.current.value
            )
                .then((s) => {
                    console.log(s)
                    onSubmit(s.email, s.username)
                })
                .catch((e) => setInfo(e))
        }
    }

    //check if token has expired
    //useEffect(() => {}, [])
    return (
        <Container
            style={{ height: '100vh' }}
            className="d-flex flex-grow-1  align-items-center"
        >
            <Form onSubmit={handleSubmit}>
                <Form.Group style={{ height: '20vh' }}>
                    <div className="text-primary">{info}</div>
                </Form.Group>
                <Form.Group style={{ height: '20vh' }}>
                    <div className="text-danger">
                        {errs.map((err, index) => (
                            <div key={index}>{err}</div>
                        ))}
                    </div>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Reset Password </Form.Label>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Email </Form.Label>
                    <Form.Control type="email" ref={emailRef} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>New Password </Form.Label>
                    <Form.Control type="password" ref={pwdRef} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>New Password confirm </Form.Label>
                    <Form.Control type="password" ref={conPwdRef} />
                </Form.Group>
                <Button type="submit" className="rounded-0 mr-2">
                    Submit
                </Button>
            </Form>
        </Container>
    )
}
