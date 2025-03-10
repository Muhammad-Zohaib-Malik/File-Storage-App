import { writeFile } from 'fs/promises'
import { Router } from 'express'
const directoryRoutes = Router()
import directoriesData from '../directoryDb.json' with {type: "json"}
import filesData from "../filesDb.json" with { type: "json" };


directoryRoutes.get('/:id?', async (req, res) => {
  const { id } = req.params
  const  directoryData=id ? directoriesData.find((folder) => folder.id === id):directoriesData[0];
  
  const files = directoryData.files.map((fileId) =>
    filesData.find((file) => file.id === fileId)
  )
  const directories = directoryData.directories.map((dirId) => directoriesData.find((dir) => dir.id === dirId)).map(({ id, name }) => ({ id, name }))
  res.json({ ...directoryData, files, directories })
}

)

directoryRoutes.post('/:parentDirId?', async (req, res) => {
  const parentDirId = req.params.parentDirId || directoriesData[0].id
  const { dirname } = req.headers
  const id = crypto.randomUUID()
  const parentDir = directoriesData.find((dir) => dir.id === parentDirId)
  console.log(parentDir)
  parentDir.directories.push(id)
  directoriesData.push({
    id,
    name: dirname,
    parentDirId,
    files: [],
    directories: []
  })
  try {
    await writeFile('./directoryDb.json', JSON.stringify(directoriesData))
    res.json({ message: "Directory created" })
  } catch (error) {

    res.status(400).json({ error })
  }
})

export default directoryRoutes