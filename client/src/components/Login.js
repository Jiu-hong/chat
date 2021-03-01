import React from 'react'
import LoginCom from './LoginCom'
import RegisterCom from './RegisterCom'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import { Container } from 'react-bootstrap'

import { Link, Route, Redirect } from 'react-router-dom'

export default function Login({ onSubmit, id }) {
    return (
        <Container>
            <Link to="/auth/register" className="mr-2">
                REGISTER
            </Link>
            <Link to="/auth/login">LOGIN</Link>
            <Route path="/auth" exact>
                <Redirect to="/auth/login" />
            </Route>
            <Route
                path="/auth/login"
                render={(props) =>
                    id === '' ? (
                        <LoginCom {...props} onSubmit={onSubmit} />
                    ) : (
                        <Redirect to="/" />
                    )
                }
            ></Route>
            <Route
                path="/auth/register"
                render={(props) =>
                    id === '' ? (
                        <RegisterCom {...props} onSubmit={onSubmit} />
                    ) : (
                        <Redirect to="/" />
                    )
                }
            ></Route>
            <Route
                path="/auth/forgotpassword"
                render={(props) => (
                    <ForgotPassword {...props} onSubmit={onSubmit} />
                )}
            ></Route>
            <Route
                path="/auth/resetpassword/:token"
                render={(props) =>
                    id === '' ? (
                        <ResetPassword {...props} onSubmit={onSubmit} />
                    ) : (
                        <Redirect to="/" />
                    )
                }
            ></Route>
        </Container>
    )
}
