const httpServer = require('http').createServer()
const io = require('socket.io')(httpServer, {
    cors: {
        //   origin: 'mongodb://admin:password@localhost:27017',
        origin: [
            'mongodb://mongo:27017/chatmongoose',
            'myapp-react-client:3000',
        ],
        method: ['GET', 'POST'],
    },
})

const crypto = require('crypto')
const bcrypt = require('bcrypt')

const { v4: uuidV4 } = require('uuid')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const User = require('./models/user')
const Contact = require('./models/contact')
const Cache = require('./models/cache')
const Room = require('./models/room')
const RoomProfile = require('./models/roomprofile')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: '163', // no need to set host or port etc.
    auth: {
        user: 'sweetremind1020@163.com',
        pass: 'IWBIFGFSSLTJGAXH',
    },
})

let mailOptions = {
    from: 'sweetremind1020@163.com',
    to: 'jiu.hong.sun@gmail.com',
    subject: 'ChatApp password reset',
    text: 'It works',
}

const connectionString = 'mongodb://mongo:27017/chatmongoose'
//const connectionString = 'mongodb://admin:password@localhost:27017/chatmongoose'

mongoose
    .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(
        () => console.log('mongoose connected successfully'),
        (error) => console.log('Mongoose could not conenct to databse' + error)
    )

//io.on('connection', (socket) => {})

let socketsArray = []
const addContactsToConversation = (
    roomId,
    roomName,
    newMembers, //not include sender
    sender,
    recipients // all members including sender
) => {
    //memembers are newly added members

    newMembers.forEach((member) => {
        const newRoom = new Room({ host: member, roomId, roomName })
        newRoom.save()
        //let stored socket join room
        //online (in socketsArray)
        const onlineSocket = socketsArray.find((s) => s.id === member)
        if (onlineSocket) {
            onlineSocket.socket.join(roomId)
        }
        //offline(not in socketsArray)
        //??
        //
        if (!io.sockets.adapter.rooms.get(member)) {
            const newCache = new Cache({
                owner: member,
                command: 'to-community-added',
                content: {
                    roomId: roomId,
                    roomName,
                    sender: 'admin',
                    recipients: recipients,
                    text: `You have been added to this room by ${sender}`,
                },
            })
            newCache.save()

            const newCache2 = new Cache({
                owner: member,
                command: 'receive-message',
                content: {
                    sender: 'admin',
                    recipient: roomId,
                    recipients: recipients,
                    text: `${member} joined!`,
                    type: 'community',
                },
            })
            newCache2.save()
        } else {
            io.to(member).emit('to-community-added', {
                roomId: roomId,
                roomName,
                sender: 'admin',
                recipients: recipients,
                text: `You have been added to this room by ${sender}`,
            })
            io.to(roomId).emit('receive-message', {
                sender: 'admin',
                recipient: roomId,
                recipients: recipients,
                text: `${member} joined!`,
                type: 'community',
            })
        }
    })
}

io.on('connection', (socket) => {
    socket.on('update-name', ({ id, name }) => {
        User.findOneAndUpdate(
            { email: id },
            { name: name },
            (err, userresult) => {
                if (err) {
                    console.log('err: ', err)
                }
                //
                Contact.updateMany({ host: id }, { hostname: name })
                Contact.updateMany({ contact: id }, { contactname: name })
                //
                Contact.find({ contact: id }, (err, results) => {
                    if (err) {
                        console.log('err: ', err)
                    }

                    const hosts = results.map((c) => c.host)

                    hosts.forEach((host) => {
                        io.to(host).emit('contactname-updated', {
                            id: id,
                            name: name,
                        })
                    })
                })
            }
        )
    })
    socket.on('add-to-community', ({ roomId, members, sender, recipients }) => {
        //members: new added members
        RoomProfile.findOne({ roomId }, (err, RoomProfileResult) => {
            if (err) {
                console.log('err: ', err)
            }
            if (!RoomProfileResult) {
                return
            } else {
                const roomName = RoomProfileResult.roomName
                Room.find({ roomId: roomId }, (err, results) => {
                    if (err) {
                        console.log('err: ', err)
                    }

                    let newMembers = []

                    members.forEach((m) => {
                        if (!results.find((result) => result.host === m)) {
                            newMembers.push(m)
                        }
                    })

                    const newRecipients = [...newMembers, ...recipients]

                    addContactsToConversation(
                        roomId,
                        roomName,
                        newMembers,
                        sender,
                        newRecipients
                    )
                })
            }
        })
    })

    socket.on(
        'start-conversation',
        ({ sender, recipient, recipients, roomName }, callback) => {
            //recipients:newly added ones
            RoomProfile.findOne(
                { roomId: recipient },
                (err, RoomProfileresult) => {
                    if (err) {
                        console.log('err: ', err)
                    } else {
                        //room already exists
                        if (RoomProfileresult) {
                            Room.find(
                                { roomId: recipient },
                                (err, Roomresults) => {
                                    if (Roomresults.length > 0) {
                                        callback({
                                            status: 'old',
                                            roomId: recipient,
                                            recipients: Roomresults.map(
                                                (room) => room.host
                                            ),
                                        })
                                    }
                                }
                            )
                        } else {
                            //new room
                            const roomId = uuidV4()
                            const newRoomProfile = new RoomProfile({
                                founder: sender,
                                roomId: roomId,
                                roomName: roomName,
                            })
                            newRoomProfile.save()
                            const newRoom = new Room({
                                host: sender,
                                roomId: roomId,
                                roomName,
                            })
                            newRoom.save()
                            callback({ status: 'new', roomId: roomId })
                            socket.join(roomId)
                            const newRecipients = [...recipients, sender]
                            addContactsToConversation(
                                roomId,
                                roomName,
                                recipients,
                                sender,
                                newRecipients
                            )
                        }
                    }
                }
            )
        }
    )

    socket.on(
        'reset-password',
        async ({ token, email, password, confirmedpwd }, callback) => {
            if (!email || !password || password !== confirmedpwd) {
                callback({ status: 'NG', data: 'Userinfo is incorrect' })
                return
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                User.findOneAndUpdate(
                    {
                        email,
                        resetPasswordToken: token,
                        resetPasswordExpires: { $gt: Date.now() },
                    },
                    { password: hashedPassword },
                    (err, result) => {
                        if (!result) {
                            callback({
                                status: 'NG',
                                data:
                                    'Email is incorrect or Password reset token is invalid or expired.',
                            })
                        } else {
                            callback({
                                status: 'OK',
                                data: {
                                    username: result.name,
                                    email: result.email,
                                },
                            })
                        }
                    }
                )
            }
        }
    )
    socket.on('forgot-password', ({ email }, callback) => {
        User.findOne({ email }, (err, result) => {
            if (!result) {
                callback({ status: 'NG', data: 'Email does not exist' })
            } else {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex')
                    User.findOneAndUpdate(
                        { email },
                        {
                            resetPasswordToken: token,
                            resetPasswordExpires: Date.now() + 3600000, // 1 hour
                        },
                        (err, result) => {
                            if (!result) {
                                //
                                return
                            }
                            mailOptions = {
                                ...mailOptions,
                                to: result.email,
                                text: `Please click the following link to reset the password. If the request is not sent by you please ignore it.
http://localhost:3000/auth/resetpassword/${token}
                                `,
                            }
                            transporter.sendMail(mailOptions, (err, data) => {
                                if (err) {
                                    console.log('error:', err)
                                } else {
                                    callback({
                                        status: 'OK',
                                        data:
                                            'A link has been sent to your email box, please check your email box to reset the password',
                                    })
                                }
                            })
                        }
                    )
                    //
                })
            }
        })
    })
    socket.on('login', ({ email, password }, callback) => {
        //   const username = username
        //   const password = password
        User.findOne({ email: email }, async (err, result) => {
            if (result) {
                try {
                    if (await bcrypt.compare(password, result.password)) {
                        //success
                        callback({
                            status: 'OK',
                            data: {
                                email: result.email,
                                username: result.name,
                            },
                        })
                    } else {
                        callback({ status: 'NG', data: 'password incorrect' })
                    }
                } catch (e) {
                    console.log(e)
                }
            } else {
                //username not exists
                callback({ status: 'NG', data: 'username does not exist' })
            }
        })
    })
    socket.on(
        'register',
        ({ email, name, password, confirmedpwd }, callback) => {
            if (!email || !password || password !== confirmedpwd) {
                callback({ status: 'Userinfo is incorrect' })
                return
            } else {
                User.findOne({ email }, async (err, result) => {
                    if (err) {
                        console.log('error: ', err)
                        callback({ status: err })
                        return
                    } else {
                        if (!result) {
                            const hashedPassword = await bcrypt.hash(
                                password,
                                10
                            )
                            //
                            const newUser = new User({
                                email: email,
                                password: hashedPassword,
                                name: name || email,
                                comment: '',
                            })

                            // good. save user
                            newUser.save(function (err) {
                                if (err) return console.log(err)
                                // saved!
                                callback({
                                    status: 'OK',
                                    data: 'Registered successfully',
                                })
                            })
                        } else {
                            callback({
                                status: 'NG',
                                data: 'email already exists',
                            })
                        }
                    }
                })
            }
        }
    )

    socket.on('disconnect', () => {
        socketsArray = socketsArray.filter((s) => s.id !== id)

        Contact.find({ host: id }, (err, contactsResults) => {
            const contacts = contactsResults.map((r) => r.contact)
            contacts.forEach((contact) => {
                //
                if (!io.sockets.adapter.rooms.get(contact)) {
                    const newCache = new Cache({
                        owner: contact,
                        command: 'offline',
                        content: { contactid: id },
                    })
                    newCache.save()
                } else {
                    io.to(contact).emit('offline', { contactid: id })
                }
            })
        })
    })

    const id = socket.handshake.query.id
    socket.join(id)

    Contact.find({ host: id }, (err, contactsResults) => {
        if (!contactsResults) return
        const contacts = contactsResults.map((r) => r.contact)
        //
        let localcontacts = contactsResults.map((r) => {
            return {
                id: r.contact,
                name: r.contactname,
            }
        })

        //all contacts and their names and status
        const newLocalcontacts = localcontacts.map((localcontact) => {
            //       //id,name
            //status
            let status = ''
            if (io.sockets.adapter.rooms.get(localcontact.id)) {
                status = 'online'
            }

            return { ...localcontact, status: status }
        })

        io.to(id).emit('local-contact', { localcontact: newLocalcontacts })
        //  })
        //
        contacts.forEach((contact) => {
            //
            if (!io.sockets.adapter.rooms.get(contact)) {
                const newCache = new Cache({
                    owner: contact,
                    command: 'online',
                    content: { contactid: id },
                })
                newCache.save()
            } else {
                io.to(contact).emit('online', { contactid: id })
            }
        })
    })

    socketsArray = [...socketsArray.filter((s) => s.id !== id), { id, socket }]

    Room.find({ host: id }, (err, roomsResults) => {
        if (!roomsResults) return
        let localrooms = roomsResults.map((r) => {
            return { id: r.roomId, name: r.roomName, type: 'community' }
        })

        io.to(id).emit('local-room', { localroom: localrooms })
        roomsResults.forEach((result) => socket.join(result.roomId))
    })

    //  console.log('io.sockets.adapter.rooms: ', io.sockets.adapter.rooms)

    Cache.find({ owner: id }, (err, caches) => {
        let complete = false

        if (err) {
            console.log('err: ', err)
        } else {
            if (caches.length > 0) {
                complete = true
                caches.map(({ command, content }) => {
                    if (io.sockets.adapter.rooms.get(id)) {
                        io.to(id).emit(command, content)
                    } else {
                        complete === false
                    }
                })
            }
        }
        if (complete) {
            Cache.deleteMany({ owner: id }).exec((err, res) => {
                if (err) {
                    console.log('err: ', err)
                }
            })
        }
    })

    socket.on('search-contact', ({ recipient }, callback) => {
        User.findOne({ email: recipient }, (err, result) => {
            if (err) {
                console.log('err: ', err)
            } else {
                if (result) {
                    callback({
                        status: 'OK',
                        data: {
                            recipient: result.email,
                            comment: result.comment,
                        },
                    })
                } else {
                    callback({
                        status: 'NG',
                        data: recipient + ' cannot be found',
                    })
                }
            }
        })
    })
    socket.on(
        'request-contact',
        ({ sender, recipient, requestmsg }, callback) => {
            //check if you are in recipient's contact list

            Contact.findOne(
                { host: recipient, contact: sender },
                (err, result) => {
                    if (err) {
                        console.log('err: ', err)
                    } else {
                        //in recipient's contact list
                        if (result) {
                            // check if sender's contact includes recipient
                            Contact.findOne(
                                {
                                    host: sender,
                                    contact: recipient,
                                },
                                (err, result) => {
                                    if (err) {
                                        console.log('err: ', err)
                                    }
                                    if (!result) {
                                        //find host name
                                        User.findOne(
                                            { email: sender },
                                            (err, result) => {
                                                if (err) {
                                                    console.log('err: ', err)
                                                } else {
                                                    if (result) {
                                                        const sendername =
                                                            result.name
                                                        User.findOne(
                                                            {
                                                                email: recipient,
                                                            },
                                                            (err, result) => {
                                                                if (err) {
                                                                    console.log(
                                                                        'err: ',
                                                                        err
                                                                    )
                                                                } else {
                                                                    if (
                                                                        result
                                                                    ) {
                                                                        const recipientname =
                                                                            result.name

                                                                        //find contact name
                                                                        const newContact = new Contact(
                                                                            {
                                                                                host: sender,
                                                                                hostname: sendername,
                                                                                contact: recipient,
                                                                                contactname: recipientname,
                                                                            }
                                                                        )
                                                                        newContact.save()
                                                                    }
                                                                }
                                                            }
                                                        )
                                                    }
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                            User.findOne(
                                { email: recipient },
                                (err, result) => {
                                    if (err) {
                                        console.log('err: ', err)
                                    } else {
                                        if (
                                            !io.sockets.adapter.rooms.get(
                                                sender
                                            )
                                        ) {
                                            const newCache = new Cache({
                                                owner: sender,
                                                command: 'approved-contact',
                                                content: {
                                                    contactid: recipient,
                                                    contactname:
                                                        result.name ||
                                                        recipient,
                                                },
                                            })
                                            newCache.save()
                                        } else {
                                            //
                                            io.to(sender).emit(
                                                'approved-contact',
                                                {
                                                    contactid: recipient,
                                                    contactname:
                                                        result.name ||
                                                        recipient,
                                                }
                                            )
                                        }
                                        //
                                    }
                                }
                            )
                        } else {
                            //not in recipient's contact list
                            User.findOne({ email: sender }, (err, result) => {
                                if (err) {
                                    console.log('err: ', err)
                                } else {
                                    if (
                                        !io.sockets.adapter.rooms.get(recipient)
                                    ) {
                                        const newCache = new Cache({
                                            owner: recipient,
                                            command: 'respond-contact',
                                            content: {
                                                sender,
                                                name: result.name || sender,
                                                requestmsg,
                                            },
                                        })
                                        newCache.save()
                                    } else {
                                        io.to(recipient).emit(
                                            'respond-contact',
                                            {
                                                sender,
                                                name: result.name || sender,
                                                requestmsg,
                                            }
                                        )
                                    }
                                }
                            })
                        }
                    }
                }
            )
        }
    )

    socket.on('contact-status-refresh', ({ contactid }, callback) => {
        if (io.sockets.adapter.rooms.get(contactid)) {
            callback({ contactStatus: 'online' })
        } else {
            callback({ contactStatus: 'offline' })
        }
    })
    //  socket.emit('approve-add-contact', { sender: id, recipient: contactid })
    socket.on('approve-add-contact', ({ sender, recipient }) => {
        //find names of sender and recipient
        User.findOne({ email: sender }, (err, result) => {
            if (result) {
                const sendername = result.name

                User.findOne({ email: recipient }, (err, result) => {
                    if (result) {
                        const recipientname = result.name
                        const newContact = new Contact({
                            host: sender,
                            hostname: sendername,
                            contact: recipient,
                            contactname: recipientname,
                        })
                        newContact.save()
                        const newContact1 = new Contact({
                            host: recipient,
                            hostname: recipientname,
                            contact: sender,
                            contactname: sendername,
                        })
                        newContact1.save()
                    }
                })
            }
        })

        User.findOne({ email: sender }, (err, result) => {
            if (err) {
                console.log('err: ', err)
            } else {
                if (!io.sockets.adapter.rooms.get(recipient)) {
                    const newCache = new Cache({
                        owner: recipient,
                        command: 'approved-contact',
                        content: {
                            contactid: sender,
                            contactname: result.name || sender,
                        },
                    })
                    newCache.save()
                } else {
                    io.to(recipient).emit('approved-contact', {
                        contactid: sender,
                        contactname: result.name || sender,
                    })
                }
            }
        })
    })

    socket.on('delete-contact', ({ sender, contactid }) => {
        Contact.findOneAndDelete(
            { host: sender, contact: contactid },
            (err, result) => {
                if (err) {
                    console.log('err: ', err)
                }
            }
        )
    })

    const leaveConversation = ({ sender, roomId }) => {
        Room.findOneAndDelete(
            { host: sender, roomId: roomId },
            (err, result) => {
                if (err) {
                    console.log('err: ', err)
                }
                socket.leave(roomId)
                /* socket.broadcast.to(roomId).emit('receive-message', {
                sender: 'admin',
                recipient: roomId,
                text: `${sender} has left.`,
                type: 'community',
            })*/
                Room.find({ roomId: roomId }, (err, result) => {
                    if (err) {
                        console.log('err: ', err)
                    }
                    const newRecipients = result.map((room) => room.host)
                    //
                    newRecipients.forEach((e) => {
                        if (!io.sockets.adapter.rooms.get(e)) {
                            const newCache = new Cache({
                                owner: e,
                                command: 'conversation-left',
                                content: {
                                    sender: 'admin',
                                    recipient: roomId,
                                    recipients: newRecipients,
                                    text: `${sender} has left.`,
                                    type: 'community',
                                    memeber: sender,
                                },
                            })
                            newCache.save()
                        }
                    })
                    //

                    socket.broadcast.to(roomId).emit('conversation-left', {
                        sender: 'admin',
                        recipient: roomId,
                        recipients: newRecipients,
                        text: `${sender} has left.`,
                        type: 'community',
                        memeber: sender,
                    })
                })
            }
        )
    }
    //  socket.on('leave-conversation', leaveConversation)

    socket.on('delete-room', ({ sender, roomId }, callback) => {
        //sender delete RoomProfile
        RoomProfile.findOneAndDelete(
            { roomId, founder: sender },
            (err, roomProfileResult) => {
                if (err) {
                    console.log('err: ', err)
                } else {
                    //not founder
                    if (!roomProfileResult) {
                        leaveConversation({ sender, roomId })
                        //here, 2 possibility: //???
                        //1 is the room is deleted already
                        //2 is this sender is not founder
                        return
                    }

                    //founder
                    Room.find({ roomId }, (err, results) => {
                        if (err) {
                            console.log('err: ', err)
                        }
                        const newRecipients = results.map(
                            (result) => result.host
                        )
                        //1,delete room on socket
                        //2,delete rooms in db
                        //3,delete roomprofile in db

                        //
                        newRecipients.forEach((r) => {
                            if (!io.sockets.adapter.rooms.get(r)) {
                                const newCache = new Cache({
                                    owner: r,
                                    command: 'room-deleted',
                                    content: {
                                        sender: 'admin',
                                        recipient: roomId,
                                        recipients: [
                                            roomProfileResult.roomName,
                                        ],
                                        text:
                                            'this community is removed by founder',
                                        type: 'community',
                                    },
                                })
                                newCache.save()
                            }
                        })
                        //
                        socket.broadcast.to(roomId).emit('room-deleted', {
                            sender: 'admin',
                            recipient: roomId,
                            recipients: [roomProfileResult.roomName],
                            text: 'this community is removed by founder',
                            type: 'community',
                        })

                        io.sockets.adapter.rooms.delete(roomId)
                    })

                    Room.deleteMany({ roomId: roomId }, (err, result) => {
                        if (err) {
                            console.log('err: ', err)
                        }
                    })
                }
            }
        )
    })
    // socket.on('send-message', ({ recipients, text }) => {
    socket.on('send-message', ({ recipient, recipients, text }) => {
        //recipient is contact or room

        // then check if Contact.findOne({host:recipient,contact:id})
        // if yes(recipient allows host) do emit...
        // else No(recipient not allows host) do admin emitß

        User.findOne({ email: recipient }, (err, result) => {
            if (err) {
                console.log('err: ', err)
            } else {
                if (result) {
                    //recipient is contact
                    //check if sender in recipient's contact list
                    Contact.findOne(
                        { host: recipient, contact: id },
                        (err, result) => {
                            if (err) {
                                console.log('err: ', err)
                            } else {
                                if (result) {
                                    // you are contact
                                    if (
                                        !io.sockets.adapter.rooms.get(recipient)
                                    ) {
                                        const newCache = new Cache({
                                            owner: recipient,
                                            command: 'receive-message',
                                            content: {
                                                sender: id,
                                                recipient: id,
                                                recipients: recipients,
                                                text,
                                                type: 'contact',
                                            },
                                        })
                                        newCache.save()
                                    } else {
                                        io.to(recipient).emit(
                                            'receive-message',
                                            {
                                                sender: id,
                                                recipient: id,
                                                recipients: recipients,
                                                text,
                                                type: 'contact',
                                            }
                                        )
                                    }
                                } else {
                                    // you are not contact
                                    if (!io.sockets.adapter.rooms.get(id)) {
                                        const newCache = new Cache({
                                            owner: id,
                                            command: 'receive-message',
                                            content: {
                                                sender: 'admin',
                                                recipient,
                                                recipients: recipients,
                                                text:
                                                    'you are not in contact list',
                                                type: 'contact',
                                            },
                                        })
                                        newCache.save()
                                    } else {
                                        io.to(id).emit('receive-message', {
                                            sender: 'admin',
                                            recipient,
                                            recipients: recipients,
                                            text: 'you are not in contact list',
                                            type: 'contact',
                                        })
                                    }
                                }
                            }
                        }
                    )
                } else {
                    //recipient is room
                    //  io.to(recipient).emit('receive-message', message)
                    //Room.find({room:recipient}) => if host not online Cache
                    //
                    //
                    RoomProfile.findOne(
                        { roomId: recipient },
                        (err, result) => {
                            if (err) {
                                console.log('err: ', err)
                            } else {
                                if (result) {
                                    Room.find(
                                        { roomId: recipient },
                                        (err, results) => {
                                            if (err) {
                                                console.log('err: ', err)
                                            } else {
                                                const newRecipients = results.map(
                                                    (r) => r.host
                                                )
                                                newRecipients.forEach((r) => {
                                                    if (
                                                        !io.sockets.adapter.rooms.get(
                                                            r
                                                        )
                                                    ) {
                                                        const newCache = new Cache(
                                                            {
                                                                owner: r,
                                                                command:
                                                                    'receive-message',
                                                                content: {
                                                                    sender: id,
                                                                    recipient: recipient,
                                                                    recipients: recipients,
                                                                    text,
                                                                    type:
                                                                        'community',
                                                                },
                                                            }
                                                        )
                                                        newCache.save()
                                                    }
                                                })
                                            }
                                        }
                                    )

                                    //because the recipient is roomid so the sender will also receive if io.to()
                                    //                   VVVV
                                    socket.broadcast
                                        .to(recipient)
                                        .emit('receive-message', {
                                            sender: id,
                                            recipient: recipient,
                                            recipients: recipients,
                                            text,
                                            type: 'community',
                                        })
                                }
                            }
                        }
                    )
                }
            }
        })
    })
})

httpServer.listen(5000)
