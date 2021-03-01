import React, { useState, useEffect, useCallback } from 'react'
import LocalStorage from '../components/LocalStorage'
import { useSocket } from './SocketProvider'

export const RequestsContext = React.createContext()

export function RequestsProvider({ children }) {
    const [requests, setRequests] = LocalStorage('requests', [])
    const [selectIndexReq, setselectIndexReq] = useState()

    const socket = useSocket()

    const deleteRequest = (requestId) => {
        setRequests(requests.filter((request) => request.id !== requestId))
    }
    const setReqToRead = (id) => {
        setRequests((prevRequests) => {
            const newRequests = prevRequests.map((request) => {
                if (request.id === id) {
                    return { ...request, unread: false }
                } else {
                    return request
                }
            })
            return newRequests
        })
    }

    const addToRequest = useCallback(
        ({ sender, name, requestmsg }) => {
            let change = false
            const newreqmsg = {
                requestmsg,
                reqmsgdate: new Date().toLocaleDateString(),
                reqmsgtime: new Date().toLocaleTimeString(),
            }

            setRequests((prevRequests) => {
                const newRequests = prevRequests.map(
                    (request) => {
                        if (request.id === sender) {
                            change = true
                            return {
                                ...request,
                                comments: [newreqmsg, ...request.comments],
                                unread: true,
                            }
                        } else {
                            return request
                        }
                    }
                    //   return [...prevRequests, { id: sender, request }]
                )
                if (!change) {
                    return [
                        ...newRequests,
                        {
                            id: sender,
                            name: name,
                            comments: [newreqmsg],
                            unread: true,
                            time: Date.now(),
                        },
                    ]
                } else {
                    return newRequests
                }
            })
        },
        [setRequests]
    )

    useEffect(() => {
        if (socket == null) return

        socket.on('respond-contact', addToRequest)

        return () => socket.off('respond-contact')
    }, [socket, addToRequest])

    const formattedRequests = requests.sort((a, b) => b.time - a.time)
    const value = {
        requests: formattedRequests,
        setRequests,
        selectIndexReq,
        setselectIndexReq,
        selectedRequest: requests.find(
            (request) => request.id === selectIndexReq
        ),
        addToRequest,
        setReqToRead,
        deleteRequest,
    }
    return (
        <RequestsContext.Provider value={value}>
            {children}
        </RequestsContext.Provider>
    )
}
