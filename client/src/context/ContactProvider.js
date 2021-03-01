//feb10
import React, { useCallback, useEffect, useState, useContext } from 'react'
import LocalStorage from '../components/LocalStorage'
import { RequestsContext } from './RequestProvider'
import { useSocket } from './SocketProvider'

export const ContactsContext = React.createContext()

export function ContactProvider({ children, id }) {
    const [contacts, setContacts] = LocalStorage('contacts', [])

    const [selectIndex, setSelectIndex] = useState(0)
    const socket = useSocket()
    const { requests, setRequests } = useContext(RequestsContext)

    const registerUser = (email, name, password, confirmedpwd) => {
        return new Promise((resolve, reject) => {
            socket.emit(
                'register',
                { email, name, password, confirmedpwd },
                (response) => {
                    if (response.status === 'OK') {
                        resolve('OK')
                    } else {
                        reject(response.data)
                    }
                }
            )
        })
    }

    const logoutUser = () => {}
    const loginUser = (email, password) => {
        return new Promise((resolve, reject) => {
            socket.emit('login', { email, password }, (response) => {
                if (response.status === 'OK') {
                    resolve(response.data)
                } else {
                    reject(response.data)
                }
            })
        })
    }

    const resetPassword = (token, email, password, confirmedpwd) => {
        return new Promise((resolve, reject) => {
            socket.emit(
                'reset-password',
                { token, email, password, confirmedpwd },
                (response) => {
                    if (response.status === 'OK') {
                        resolve(response.data)
                    } else {
                        reject(response.data)
                    }
                }
            )
        })
    }
    const forgotPassword = (email) => {
        return new Promise((resolve, reject) => {
            socket.emit('forgot-password', { email }, (response) => {
                if (response.status) {
                    resolve(response.data)
                } else {
                    reject()
                }
            })
        })
    }
    const updateName = (name) => {
        socket.emit('update-name', { id, name })
    }
    const searchContact = (recipient) => {
        return new Promise((resolve, reject) => {
            socket.emit('search-contact', { recipient }, (response) => {
                if (response.status === 'OK') {
                    resolve(response.data)
                } else {
                    reject(response.data)
                }
            })
        })
    }

    const addContact = ({ contactid, contactname }) => {
        // add local contacts list
        addLocalContact({ contactid, contactname })
        // send to partner
        socket.emit('approve-add-contact', {
            sender: id,
            recipient: contactid,
        })
        //delete local request
        setRequests(requests.filter((request) => request.id !== contactid))
    }

    const addLocalContact = useCallback(
        ({ contactid, contactname }) => {
            //get contact status
            let contactStatus = ''
            socket.emit(
                'contact-status-refresh',
                { contactid: contactid },
                (response) => {
                    if (response.contactStatus === 'online') {
                        contactStatus = response.contactStatus
                    }

                    const newContacts = [
                        ...contacts,
                        {
                            id: contactid,
                            name: contactname,
                            type: 'contact',
                            status: contactStatus,
                        },
                    ]
                    setContacts(newContacts)
                }
            )
            //
        },

        [contacts, setContacts, socket]
    )

    const updateContactName = useCallback(
        ({ id, name }) => {
            setContacts(
                contacts.map((contact) => {
                    if (contact.id === id) {
                        return { ...contact, name: name }
                    } else {
                        return contact
                    }
                })
            )
        },
        [contacts, setContacts]
    )

    const contactOnline = useCallback(
        ({ contactid }) => {
            setContacts(
                contacts.map((contact) => {
                    if (contact.id === contactid) {
                        return { ...contact, status: 'online' }
                    } else {
                        return contact
                    }
                })
            )
        },
        [contacts, setContacts]
    )

    const contactOffline = useCallback(
        ({ contactid }) => {
            setContacts(
                contacts.map((contact) => {
                    if (contact.id === contactid) {
                        return { ...contact, status: '' }
                    } else {
                        return contact
                    }
                })
            )
        },
        [contacts, setContacts]
    )

    const storeLocalContact = useCallback(
        ({ localcontact }) => {
            setContacts(localcontact)
        },
        [setContacts]
    )
    useEffect(() => {
        if (!socket) return

        socket.on('approved-contact', addLocalContact)

        socket.on('contactname-updated', updateContactName)
        socket.on('online', contactOnline)
        socket.on('offline', contactOffline)
        socket.on('local-contact', storeLocalContact)

        return () => {
            socket.off('approved-contact')
            socket.off('contactname-updated')
            socket.off('online')
            socket.off('offline')
            socket.off('local-contact')
        }
    }, [
        socket,
        addLocalContact,
        updateContactName,
        contactOnline,
        contactOffline,
        storeLocalContact,
    ])

    const requestContact = (recipient, requestmsg) => {
        socket.emit('request-contact', { sender: id, recipient, requestmsg })
    }

    const deleteContact = (contactid) => {
        //delete local
        setContacts(contacts.filter((contact) => contact.id !== contactid))
        // socket.emit
        socket.emit('delete-contact', { sender: id, contactid })
        //    server db delete contact but not emit to contact
    }

    const value = {
        selectIndex,
        setSelectIndex,
        contacts,
        setContacts,
        searchContact,
        requestContact,
        selectedContact: contacts.find((contact) => contact.id === selectIndex),
        loginUser,
        logoutUser,
        registerUser,
        addContact,
        deleteContact,
        updateName,
        forgotPassword,
        resetPassword,
    }
    return (
        <ContactsContext.Provider value={value}>
            {children}
        </ContactsContext.Provider>
    )
}
