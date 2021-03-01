import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    InputGroup,
    Button,
    Form,
    Nav,
    NavDropdown,
    Modal,
} from 'react-bootstrap'
import { ConversationContext } from '../context/ConversationProvider'

import CommunityModal from './CommunityModal'

export default function OpenConversation() {
    const [show, setShow] = useState(false)

    const closeModal = () => {
        setShow(false)
    }

    const textRef = useRef()
    const setRef = useCallback((node) => {
        if (node) {
            node.scrollIntoView({ smooth: true })
        }
    }, [])

    const {
        selectIndex,
        selectedConversation,
        sendMessage,
        setDraft,
        setToRead,
        leaveCommunity,
        emptyConversation,
    } = useContext(ConversationContext)

    const handleSubmit = (e) => {
        e.preventDefault()
        const recipient = selectedConversation.id

        sendMessage(
            selectedConversation.draft,
            recipient,
            selectedConversation.type,
            selectedConversation.recipients
        )
        setDraft(selectIndex, '')
    }

    useEffect(() => textRef.current?.focus())

    const handleClick = () => {
        leaveCommunity(selectedConversation.id)
    }

    const handleEmpty = () => {
        emptyConversation(selectedConversation.id)
    }

    return (
        <div className="d-flex flex-column flex-grow-1">
            <Nav className="mr-auto">
                {selectedConversation && (
                    <Nav.Link variant="outline-secondary" onClick={handleEmpty}>
                        🗑️
                    </Nav.Link>
                )}

                {selectedConversation?.type === 'community' &&
                !selectedConversation?.inactive ? (
                    <>
                        <NavDropdown title="members" id="basic-nav-dropdown">
                            {selectedConversation.recipients.map((r, index) => (
                                <NavDropdown.Item key={index}>
                                    {r}
                                </NavDropdown.Item>
                            ))}
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={() => setShow(true)}>
                                ➕ Add members
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleClick}>
                                Leave
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Modal show={show} onHide={closeModal}>
                            <CommunityModal
                                closeModal={closeModal}
                                roomId={selectedConversation.id}
                            />
                        </Modal>
                    </>
                ) : (
                    ''
                )}
            </Nav>

            <div className="flex-grow-1 overflow-auto">
                <div className="d-flex flex-column align-items-start justify-content-end px-3">
                    {selectedConversation &&
                        selectedConversation.messages.map((message, index) => {
                            const lastMessage =
                                index ===
                                selectedConversation.messages.length - 1
                            return (
                                <div
                                    ref={lastMessage ? setRef : null}
                                    key={index}
                                    className={`my-1 d-flex flex-column ${
                                        message.fromMe
                                            ? 'align-self-end align-items-end'
                                            : 'align-items-start'
                                    }`}
                                >
                                    <div className="text-muted small">
                                        {message.msgTime}
                                    </div>
                                    <div
                                        className={`rounded px-2 py-1 ${
                                            message.fromMe
                                                ? 'bg-primary text-white '
                                                : 'border'
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                    <div className="text-muted small">
                                        {message.fromMe
                                            ? 'You'
                                            : message.sender?.name ||
                                              message.sender}
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>

            {selectedConversation && !selectedConversation?.inactive && (
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="m-2">
                        <InputGroup>
                            <Form.Control
                                ref={textRef}
                                as="textarea"
                                required
                                value={selectedConversation.draft}
                                onFocus={() => setToRead(selectIndex)}
                                onChange={(e) => {
                                    setDraft(selectIndex, e.target.value)
                                }}
                                style={{ height: '75px', resize: 'none' }}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' ? handleSubmit(e) : null
                                }
                                className="shadow-none"
                            />
                            <InputGroup.Append>
                                <Button type="submit">Send</Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                </Form>
            )}
        </div>
    )
}
