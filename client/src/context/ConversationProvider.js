import React, { useCallback, useContext, useState, useEffect } from 'react'

import LocalStorage from '../components/LocalStorage'
import { ContactsContext } from './ContactProvider'
import { RoomsContext } from './RoomProvider'
import { RequestsContext } from './RequestProvider'
import { useSocket } from './SocketProvider'

export const ConversationContext = React.createContext()

export function ConversationProvider({ children, id, name }) {
    const [conversations, setConversations] = LocalStorage('conversations', [])

    const [selectIndex, setSelectIndex] = useState(() => {
        if (conversations) {
            return conversations[0]?.id
        }
    })
    const { contacts, setContacts } = useContext(ContactsContext)
    const { rooms, setRooms } = useContext(RoomsContext)
    const { setRequests } = useContext(RequestsContext)
    const socket = useSocket()

    const setSelectedIndex = (id) => {
        setSelectIndex(id)
    }

    const clearLocal = () => {
        //clear contacts, conversations,rooms
        setConversations([])
        setContacts([])
        setRooms([])
        setRequests([])
    }
    //recipient??
    const startConversation = (recipient, recipients, type, roomName) => {
        let found
        let newConversations = conversations.map((conversation) => {
            if (conversation.id === recipient) {
                found = true
                setSelectedIndex(conversation.id)
            }
            return conversation
        })

        if (!found) {
            //recipient is room
            if (type === 'community') {
                //from Modal
                let roomId

                socket.emit(
                    'start-conversation',
                    { sender: id, recipient, recipients, roomName: roomName },
                    (response) => {
                        if (response.status === 'old') {
                            //room exists
                            //response: {
                            //  status: 'old',
                            //  roomId: RoomProfileresult.roomId,
                            //   recipients}

                            const newConversation = {
                                id: response.roomId,
                                type: 'community',
                                unread: false,
                                recipients: response.recipients,
                                messages: [],
                                draft: '',
                                time: Date.now(),
                            }

                            newConversations = [
                                newConversation,
                                ...newConversations,
                            ]
                            setConversations(newConversations)
                            setSelectedIndex(response.roomId)
                        } else {
                            //new room
                            //response: { status: 'new', roomId: roomId }
                            const newRecipient = [...recipients, id]
                            const newConversation = {
                                id: response.roomId,
                                type: 'community',
                                unread: false,
                                recipients: newRecipient,
                                messages: [],
                                draft: '',
                                time: Date.now(),
                            }
                            const room = {
                                id: response.roomId,
                                name: roomName,
                                type: 'community',
                            }
                            setRooms((prevRooms) => [...prevRooms, room])

                            newConversations = [
                                newConversation,
                                ...newConversations,
                            ]
                            setConversations(newConversations)
                            setSelectedIndex(roomId)
                        }
                    }
                )
            }
            //recipient is contact
            else {
                const newConversation = {
                    id: recipient,
                    type: 'contact',
                    unread: false,
                    recipients: [recipient],
                    messages: [],
                    draft: '',
                    time: Date.now(),
                }

                newConversations = [newConversation, ...newConversations]
                setConversations(newConversations)
                setSelectedIndex(recipient)
            }
        }
    }

    const setToRead = (id) => {
        setConversations((prevConversations) => {
            const newConversations = prevConversations.map((conversation) => {
                if (conversation.id === id) {
                    return { ...conversation, unread: false }
                } else {
                    return conversation
                }
            })
            return newConversations
        })
    }

    const setDraft = (id, draft) => {
        setConversations((prevConversations) => {
            const newConversations = prevConversations.map((conversation) => {
                if (conversation.id === id) {
                    return { ...conversation, draft: draft }
                } else {
                    return conversation
                }
            })
            return newConversations
        })
    }

    const addMessageToConversation = useCallback(
        ({ sender, recipient, recipients, text, type, inactive }) => {
            let unread = false
            if (sender !== id) {
                unread = true
            }

            let madeChange = false
            const newMessage = { sender, text, msgtime: new Date() }

            setConversations((prevConversations) => {
                const newConversations = prevConversations.map(
                    (conversation) => {
                        if (recipient === conversation.id) {
                            madeChange = true

                            return {
                                ...conversation,
                                unread: unread,
                                messages: [
                                    ...conversation.messages,
                                    newMessage,
                                ],
                                recipients, //newly
                                inactive: inactive,
                                time: Date.now(),
                            }
                        }
                        return conversation
                    }
                )
                if (!madeChange) {
                    const newConversation = {
                        id: recipient,
                        type: type,
                        recipients: recipients,
                        unread: unread,
                        messages: [newMessage],
                        draft: '',
                        inactive: inactive,
                        time: Date.now(),
                    }
                    return [...prevConversations, newConversation]
                } else {
                    return newConversations
                }
            })
        },
        [setConversations, id]
    )

    const addContactToConversation = useCallback(
        ({ roomId, roomName, sender, recipients, text }) => {
            const newMessage = { sender, text, msgtime: new Date() }
            const newConversation = {
                id: roomId,
                type: 'community',
                unread: true,
                recipients: recipients,
                messages: [newMessage],
                draft: '',
                time: Date.now(),
            }
            //
            let room = {
                id: roomId,
                name: roomName || recipients.join(),
                type: 'community',
            }
            setRooms((prevRooms) => {
                return [...prevRooms, room]
            }) // add rooms? or not
            //
            setConversations((prevConversations) => [
                ...prevConversations,
                newConversation,
            ])
        },
        [setConversations, setRooms]
    )

    const deleteMemberFromConversation = useCallback(
        ({ sender, recipient, recipients, text, type, memeber }) => {
            addMessageToConversation({
                recipient: recipient,
                recipients: recipients,
                sender: sender,
                text: text,
                type: type,
            })
            //delete member from conversation.recipients
            setConversations((prevConversations) => {
                const newConversations = prevConversations.map(
                    (conversation) => {
                        if (conversation.id === recipient) {
                            const newRecipients = conversation.recipients.filter(
                                (recipient) => recipient !== memeber
                            )
                            return {
                                ...conversation,
                                recipients: newRecipients,
                            }
                        } else {
                            return conversation
                        }
                    }
                )
                return newConversations
            })
        },
        [setConversations, addMessageToConversation]
    )

    const roomDeleted = useCallback(
        ({ sender, recipient, recipients, text, type }) => {
            addMessageToConversation({
                recipient,
                recipients,
                sender,
                text,
                type,
                inactive: true,
            })
            setRooms((prevRooms) =>
                prevRooms.filter((room) => room.id !== recipient)
            )
        },
        [addMessageToConversation, setRooms]
    )

    const storeLocalConversation = useCallback(
        ({ localconversation }) => {
            setConversations(localconversation)
        },
        [setConversations]
    )

    useEffect(() => {
        if (socket == null) return

        socket.on('receive-message', addMessageToConversation)

        socket.on('to-community-added', addContactToConversation)
        // socket.on('not-contact', () => {})
        socket.on('conversation-left', deleteMemberFromConversation)
        socket.on('room-deleted', roomDeleted)
        socket.on('local-conversation', storeLocalConversation)

        return () => {
            socket.off('receive-message')
            socket.off('to-community-added')
            socket.off('conversation-left')
            socket.off('room-deleted')
            socket.off('local-conversation')
        }
    }, [
        socket,
        addMessageToConversation,
        addContactToConversation,
        deleteMemberFromConversation,
        roomDeleted,
        storeLocalConversation,
    ])

    const sendMessage = (text, recipient, type, recipients) => {
        socket.emit('send-message', { recipient, text, type, recipients })
        addMessageToConversation({
            recipient,
            recipients,
            sender: id,
            text,
            type,
        })
    }

    const leaveCommunity = (roomId) => {
        //  socket.emit('leave-conversation', { sender: id, roomId })
        socket.emit('delete-room', { sender: id, roomId })
        deleteConversation(roomId) //checked
    }

    const formattedConversations = conversations
        .sort((a, b) => b.time - a.time)
        .map((conversation) => {
            const recipientFormatted = () => {
                const name =
                    conversation.type === 'contact'
                        ? contacts.find(
                              (contact) => conversation.id === contact.id
                          )?.name || conversation.id
                        : rooms.find((room) => conversation.id === room.id)
                              ?.name || conversation.recipients.join()

                const status =
                    conversation.type === 'contact'
                        ? contacts.find(
                              (contact) => conversation.id === contact.id
                          )?.status
                        : ''
                return {
                    id: conversation.id,
                    name: name,
                    status: status,
                }
            }

            const messages = conversation.messages.map((message) => {
                const senderName = contacts.find(
                    (contact) => contact.id === message.sender
                )

                const fromMe = message.sender === id

                return {
                    text: message.text,
                    sender: senderName || message.sender,
                    fromMe,
                    msgDate: new Date(message.msgtime).toLocaleDateString(),
                    msgTime: new Date(message.msgtime).toLocaleTimeString(),
                }
            })

            //  const selected = index === selectIndex
            const selected = conversation.id === selectIndex
            /*  const newRecipients = conversation.recipients.map((r) => {
                const newContacts = [...contacts, { id, name }]
                return (
                    newContacts.find((contact) => contact.id === r)?.name || r
                )
            })*/
            return {
                ...conversation,
                messages,
                //  recipients: newRecipients,
                recipient: recipientFormatted(), //conversation.recipients,
                selected,
            }
        })

    const deleteConversation = (convid) => {
        setConversations((prevConversations) =>
            prevConversations.filter(
                (conversation) => conversation.id !== convid
            )
        )
        setRooms((prevRooms) => prevRooms.filter((room) => room.id !== convid))
    }

    const addToCommunity = (roomId, members, recipients) => {
        socket.emit('add-to-community', {
            roomId,
            members,
            sender: id,
            recipients,
        })
    }

    const emptyConversation = (convid) => {
        setConversations((prevConversations) =>
            prevConversations.filter(
                (conversation) => conversation.id !== convid
            )
        )
    }

    const value = {
        conversations: formattedConversations,
        selectIndex,
        setSelectedIndex,

        //  selectedConversation: formattedConversations[selectIndex],
        selectedConversation: formattedConversations
            ? formattedConversations.find((conv) => conv.id === selectIndex)
            : '',
        addMessageToConversation,
        sendMessage,
        startConversation,
        setToRead,
        setDraft,
        leaveCommunity,
        addToCommunity,
        emptyConversation,
        clearLocal,
    }
    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    )
}
