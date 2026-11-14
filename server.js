
const connectToDB = require('./config/db.js')
const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const morgan = require('morgan')
const cors = require('cors')

// Routes Import
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user-routes')
const skillRoutes = require('./routes/skill.routes')
const sessionRoutes = require('./routes/session.routes')
const messageRoutes = require('./routes/message.routes')
const notificationRoutes = require('./routes/notification.routes')
// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    })
)
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/skills', skillRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
// Connect to database and listen on Port 3000
async function startServer() {
    const PORT = process.env.PORT || 3000
    await connectToDB()

    app.listen(PORT, () => {
        console.log(`App is running on port ${PORT}`)
    })
}

startServer()
