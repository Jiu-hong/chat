import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Login'
import LocalStorage from './LocalStorage'
import Dashboard from './Dashboard'
import { RequestsProvider } from '../context/RequestProvider'
import { ContactProvider } from '../context/ContactProvider'
import { RoomProvider } from '../context/RoomProvider'
import { ConversationProvider } from '../context/ConversationProvider'
import { SocketProvider } from '../context/SocketProvider'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'

function App() {
    const [id, setId] = LocalStorage('id', '')
    const [name, setName] = LocalStorage('name', '')

    return (
        <SocketProvider id={id}>
            <RequestsProvider>
                <ContactProvider id={id}>
                    <RoomProvider id={id}>
                        <ConversationProvider id={id} name={name}>
                            <Router>
                                <Route path="/" exact>
                                    {id === '' ? (
                                        <Redirect to="/auth" />
                                    ) : (
                                        <Redirect to="/chat" />
                                    )}
                                </Route>

                                <Route path="/chat">
                                    {id === '' ? (
                                        <Redirect to="/auth" />
                                    ) : (
                                        <Dashboard
                                            id={id}
                                            name={name}
                                            onSubmit={setName}
                                            logout={() => {
                                                setId('')
                                                setName('')
                                            }}
                                        />
                                    )}
                                </Route>

                                <Route
                                    path="/auth"
                                    render={(props) => (
                                        <Login
                                            {...props}
                                            onSubmit={(id, name) => {
                                                setId(id)
                                                setName(name)
                                            }}
                                            id={id}
                                        />
                                    )}
                                ></Route>
                            </Router>
                        </ConversationProvider>
                    </RoomProvider>
                </ContactProvider>
            </RequestsProvider>
        </SocketProvider>
    )
}

export default App
