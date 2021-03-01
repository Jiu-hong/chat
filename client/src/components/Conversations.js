import React, { useContext } from 'react'
import { ListGroup } from 'react-bootstrap'
import { ConversationContext } from '../context/ConversationProvider'

export default function Conversations() {
    const { conversations, setSelectedIndex, setToRead } = useContext(
        ConversationContext
    )

    return (
        <ListGroup>
            {conversations &&
                conversations.map((conversation) => (
                    <ListGroup.Item
                        key={conversation.id}
                        action
                        active={conversation.selected}
                        //  active={selectIndex === conversation.id}
                        onClick={() => {
                            setSelectedIndex(conversation.id)
                            setToRead(conversation.id)
                        }}
                    >
                        <div>
                            <span>
                                {conversation.type === 'community'
                                    ? '🏠 '
                                    : '🧑 '}

                                {conversation.recipient.name}
                            </span>
                            {conversation.recipient.status === 'online' ? (
                                <span className="ml-2">🟢</span>
                            ) : null}
                            <span>{conversation.unread ? '💌' : ''}</span>
                        </div>
                    </ListGroup.Item>
                ))}
        </ListGroup>
    )
}
