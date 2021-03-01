import React, { useContext } from 'react'
import { ListGroup } from 'react-bootstrap'
import { ContactsContext } from '../context/ContactProvider'
import { RoomsContext } from '../context/RoomProvider'
import { RequestsContext } from '../context/RequestProvider'

export default function Contacts({ setSubKey, REQUESTS, CONTACTS, ROOMS }) {
    const { contacts, selectIndex, setSelectIndex } = useContext(
        ContactsContext
    )
    const { rooms, selectIndexRoom, setSelectIndexRoom } = useContext(
        RoomsContext
    )
    const {
        requests,
        selectIndexReq,
        setselectIndexReq,
        setReqToRead,
    } = useContext(RequestsContext)
    return (
        <ListGroup>
            {requests.map((request, index) => (
                <ListGroup.Item
                    key={index}
                    action
                    active={selectIndexReq === request.id}
                    onClick={() => {
                        setSubKey(REQUESTS)
                        setselectIndexReq(request.id)
                        setSelectIndex()
                        setSelectIndexRoom()
                        setReqToRead(request.id)
                    }}
                >
                    <span> new request</span>
                    <span className="ml-2">{request.unread ? '💌' : null}</span>
                </ListGroup.Item>
            ))}

            {contacts.map((contact, index) => (
                <ListGroup.Item
                    key={index}
                    action
                    active={selectIndex === contact.id}
                    onClick={() => {
                        setSubKey(CONTACTS)
                        setSelectIndex(contact.id)
                        setselectIndexReq()
                        setSelectIndexRoom()
                    }}
                >
                    <span> 🧑 {contact.name}</span>
                    {contact.status === 'online' ? (
                        <span className="ml-2">🟢</span>
                    ) : null}
                </ListGroup.Item>
            ))}
            {rooms.map((room, index) => (
                <ListGroup.Item
                    key={index}
                    action
                    active={selectIndexRoom === room.id}
                    onClick={() => {
                        setSubKey(ROOMS)
                        setSelectIndexRoom(room.id)
                        setSelectIndex()
                        setselectIndexReq()
                    }}
                >
                    🏠 {room.name}
                </ListGroup.Item>
            ))}
        </ListGroup>
    )
}
