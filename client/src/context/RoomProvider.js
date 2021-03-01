import React, { useCallback, useState, useEffect } from 'react'
import LocalStorage from '../components/LocalStorage'
import { useSocket } from './SocketProvider'

export const RoomsContext = React.createContext()

export function RoomProvider({ children, id }) {
    const socket = useSocket()
    const [rooms, setRooms] = LocalStorage('rooms', [])

    const [selectIndexRoom, setSelectIndexRoom] = useState(0)

    const addLocalRoom = useCallback(
        ({ roomid, roomname }) => {
            setRooms((prevRooms) => [
                ...prevRooms,
                { id: roomid, name: roomname, type: 'community' },
            ])
        },
        [setRooms]
    )

    const storeLocalRoom = useCallback(
        ({ localroom }) => {
            setRooms(localroom)
        },
        [setRooms]
    )

    useEffect(() => {
        if (!socket) return

        socket.on('local-room', storeLocalRoom)

        return () => {
            socket.off('local-room')
        }
    }, [socket, storeLocalRoom])

    const value = {
        selectIndexRoom,
        setSelectIndexRoom,
        rooms,
        setRooms,
        selectedRoom: rooms.find((room) => room.id === selectIndexRoom),
        addLocalRoom,
    }
    return (
        <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
    )
}
