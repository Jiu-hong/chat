import React, { useState } from 'react'
import Sidebar from './Sidebar'

import OpenConversation from '../components/OpenConversation'
import OpenContact from './OpenContact'
import OpenRoom from './OpenRoom'
import OpenRequest from './OpenRequest'
import Profile from './Profile'

const REQUESTS = 'requests'
const CONTACTS = 'contacts'
const CONVERSATIONS = 'conversations'
const ROOMS = 'rooms'
const ME = 'me'

export default function Dashboard({ id, name, onSubmit, logout }) {
    const [key1, setKey1] = useState(CONVERSATIONS)
    const [subKey, setSubKey] = useState(CONTACTS)

    return (
        <div style={{ height: '100vh' }} className="d-flex">
            <Sidebar
                key1={key1}
                id={id}
                name={name}
                onSubmit={onSubmit}
                setKey1={setKey1}
                setSubKey={setSubKey}
                REQUESTS={REQUESTS}
                CONTACTS={CONTACTS}
                ROOMS={ROOMS}
                CONVERSATIONS={CONVERSATIONS}
                ME={ME}
                logout={logout}
            />
            {key1 === CONTACTS && subKey === REQUESTS && (
                <OpenRequest id={id} />
            )}
            {key1 === CONTACTS && subKey === CONTACTS && (
                <OpenContact setKey1={setKey1} CONVERSATIONS={CONVERSATIONS} />
            )}
            {key1 === CONTACTS && subKey === ROOMS && (
                <OpenRoom setKey1={setKey1} CONVERSATIONS={CONVERSATIONS} />
            )}
            {key1 === CONVERSATIONS && <OpenConversation id={id} />}
            {key1 === ME && (
                <Profile
                    id={id}
                    name={name}
                    onSubmit={onSubmit}
                    logout={logout}
                />
            )}
        </div>
    )
}
