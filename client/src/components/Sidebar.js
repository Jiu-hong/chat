import React, { useContext, useState } from 'react'
import { Tab, Nav, Button, Modal } from 'react-bootstrap'

import Contacts from './Contacts'

import Me from './Me'
import Conversations from './Conversations'
import ContactModal from './ContactModal'
import ConversationModal from './ConversationModal'
import { ConversationContext } from '../context/ConversationProvider'
import { RequestsContext } from '../context/RequestProvider'

export default function Sidebar({
    id,
    key1,
    setKey1,
    setSubKey,
    REQUESTS,
    CONTACTS,
    ROOMS,
    CONVERSATIONS,
    ME,
}) {
    const { conversations } = useContext(ConversationContext)
    const { requests } = useContext(RequestsContext)
    const [show, setShow] = useState(false)

    const closeModal = () => {
        setShow(false)
    }

    return (
        <div className="d-flex flex-column border-right">
            <Tab.Container activeKey={key1} onSelect={(k) => setKey1(k)}>
                <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey={CONTACTS}>
                            CONTACTS
                            <span>
                                {requests.find((request) => request.unread)
                                    ? '💌'
                                    : null}
                            </span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey={CONVERSATIONS}>
                            CONVERSATIONS{' '}
                            <span>
                                {conversations &&
                                conversations.find(
                                    (conversation) => conversation.unread
                                )
                                    ? '💌'
                                    : null}
                            </span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey={ME}>ME </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content className="flex-grow-1 ">
                    <Tab.Pane eventKey={CONTACTS}>
                        <Contacts
                            setSubKey={setSubKey}
                            REQUESTS={REQUESTS}
                            CONTACTS={CONTACTS}
                            ROOMS={ROOMS}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey={CONVERSATIONS}>
                        <Conversations />
                    </Tab.Pane>
                    <Tab.Pane eventKey={ME}>{<Me />}</Tab.Pane>
                </Tab.Content>

                {key1 === CONTACTS && (
                    <Button className="rounded-0" onClick={() => setShow(true)}>
                        New Contact
                    </Button>
                )}
                {key1 === CONVERSATIONS && (
                    <Button className="rounded-0" onClick={() => setShow(true)}>
                        New Conversation
                    </Button>
                )}
                <div className="border-top">
                    Your id <div>{id}</div>
                </div>
            </Tab.Container>

            <Modal show={show} onHide={closeModal}>
                {key1 === CONTACTS && <ContactModal closeModal={closeModal} />}
                {key1 === CONVERSATIONS && (
                    <ConversationModal closeModal={closeModal} />
                )}
            </Modal>
        </div>
    )
}
