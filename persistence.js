const fs = require('fs/promises')

/**
 * Read user data from JSON file
 * @returns {Promise<Array>} Array of user objects
 */
async function readUserData() {
    let raw = await fs.readFile('users.json', 'utf8')
    return await JSON.parse(raw)
}

/**
 * 
 * Read photo data from JSON file
 * @returns {Promise<Array>} Array of photo objects
 */
async function readPhotoData() {
    let raw = await fs.readFile('photos.json', 'utf8')
    return await JSON.parse(raw)
}

/**
 * Read album data from JSON file  
 * @returns {Promise<Array>} Array of album objects
 */
async function readAlbumData() {
    let raw = await fs.readFile('albums.json', 'utf8')
    return await JSON.parse(raw)
}

/**
 * Write photo data to JSON file
 * @param {Array} photoList Array of photo objects
 * @returns {Promise<void>}
 */
async function writePhotoData(photoList) {
    await fs.writeFile('photos.json', JSON.stringify(photoList, null, 2))
}

/**
 * Find user by username
 * @param {string} username Username to find
 * @returns {Promise<Object|undefined>} User object or undefined if not found
 */
async function findUser(username) {
    let users = await readUserData()
    for (let user of users) {
        if (user.username === username) {
            return user
        }
    }
    return undefined
}

/**
 * Find photo by ID
 * @param {number} photoId Photo ID to find
 * @returns {Promise<Object|undefined>} Photo object or undefined if not found
 */
async function findPhoto(photoId) {
    let photos = await readPhotoData()
    for (let photo of photos) {
        if (photo.id === photoId) {
            return photo
        }
    }
    return undefined
}

/**
 * Find photos by album ID
 * @param {number} albumId Album ID to search
 * @returns {Promise<Array>} Array of photos in the album
 */
async function findPhotosByAlbum(albumId) {
    let photos = await readPhotoData()
    let result = []
    for (let photo of photos) {
        if (photo.albums.includes(albumId)) {
            result.push(photo)
        }
    }
    return result
}

/**
 * Find album by name
 * @param {string} albumName Album name to find
 * @returns {Promise<Object|undefined>} Album object or undefined if not found
 */
async function findAlbumByName(albumName) {
    let albums = await readAlbumData()
    for (let album of albums) {
        if (album.name.toLowerCase() === albumName.toLowerCase()) {
            return album
        }
    }
    return undefined
}

/**
 * Update photo in storage
 * @param {Object} updatedPhoto Updated photo object
 * @returns {Promise<boolean>} True if successful, false if photo not found
 */
async function updatePhoto(updatedPhoto) {
    let photos = await readPhotoData()
    let changed = false
    
    for (let i = 0; i < photos.length; i++) {
        if (photos[i].id === updatedPhoto.id) {
            photos[i] = updatedPhoto
            changed = true
            break
        }
    }
    
    if (changed) {
        await writePhotoData(photos)
    }
    return changed
}


const mongodb = require("mongodb")
let db = undefined
let photos = undefined
let albums = undefined
let users = undefined

async function connect() {
    if(!db){
        let client = new mongodb.MongoClient("mongodb+srv://60105012:essam123@cluster0.rvdq9ou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        await client.connect()
        db = client.db("Assignment_3")
        users = db.collection("users")
        photos = db.collection("photos")
        albums = db.collection("albums")
    }
}

async function getAllUsers() {
    await connect()
    let allUsers = await users.find().toArray()
    console.log(allUsers)
}

async function getAllPhotos() {
    await connect()
    let allPhotos = await photos.find().toArray()
    console.log(allPhotos)
}

async function getAllAlbums() {
    await connect()
    let allAlbums = await albums.find().toArray()
    console.log(allAlbums)
}


module.exports = {
    getAllUsers,
    getAllPhotos,
    getAllAlbums,
    writePhotoData,
    findUser,
    findPhoto,
    findPhotosByAlbum,
    findAlbumByName,
    updatePhoto
}