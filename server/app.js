import express from 'express'
import cors from 'cors'
const app = express()
app.use(express.json())
import directoryRoutes from './routes/directory-route.js'
import filesRoutes from './routes/file-route.js'

app.use(cors())

app.use('/directory',directoryRoutes)
app.use('/file',filesRoutes)  



app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})