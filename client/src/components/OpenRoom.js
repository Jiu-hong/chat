import React, { useContext } from 'react'

import { RoomsContext } from '../context/RoomProvider'
import { ConversationContext } from '../context/ConversationProvider'
import { Card, Button } from 'react-bootstrap'

export default function OpenRoom({ setKey1, CONVERSATIONS }) {
    const { selectedRoom } = useContext(RoomsContext)
    const { startConversation, leaveCommunity } = useContext(
        ConversationContext
    )

    const handleSend = () => {
        startConversation(selectedRoom.id, '', 'community')

        setKey1(CONVERSATIONS)
    }

    const handleDltRoom = () => {
        leaveCommunity(selectedRoom.id)
    }
    return (
        <div className="flex-grow-1 overflow-auto">
            {selectedRoom && (
                <Card>
                    <Card.Body>
                        <Card.Title>{selectedRoom.name}</Card.Title>
                        <Card.Text> ID:{selectedRoom.id}</Card.Text>
                        <Button
                            variant="primary"
                            className="rounded-0 mr-2"
                            onClick={handleSend}
                        >
                            Send Message
                        </Button>
                        <Button
                            variant="secondary"
                            className="rounded-0"
                            onClick={handleDltRoom}
                        >
                            Leave
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    )
}
