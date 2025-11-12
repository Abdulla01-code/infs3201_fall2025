const fs = require('fs/promises')

const mongodb = require("mongodb")
let db = undefined
let photos = undefined
let albums = undefined
let users = undefined
let session = undefined

/**
 *  Connect to mongo DB
 */

async function connect() {
    if(!db){
        let client = new mongodb.MongoClient("mongodb+srv://60105012:essam123@cluster0.rvdq9ou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        await client.connect()
        db = client.db("infs3201_fall2025")
        photos = db.collection("photos")
        albums = db.collection("albums")
        users = db.collection("users")
        session = db.collection("session")
        console.log('Connected to MongoDB')
    }
}

/**
 * Read photo data from MongoDB
 * @returns {Promise<Array>} Array of album objects
 */
async function readPhotoData() {
    await connect()
    return await photos.find({}).toArray()
}

/**
 * Read album data from MongoDB
 * @returns {Promise<Array>} Array of album objects
 */
async function readAlbumData() {
    await connect()
    return await albums.find({}).toArray()
}

/**
 * Find photo by ID
 * @param {number} photoId Photo ID to find
 * @returns {Promise<Object|undefined>} Photo object or undefined if not found
 */
async function findPhoto(photoId) {
    await connect()
    return await photos.findOne({id: Number(photoId)})
}


/**
 * Find photos by album ID
 * @param {number} albumId Album ID to search
 * @returns {Promise<Array>} Array of photos in the album
 */
async function findPhotosByAlbum(albumId) {
    await connect()
    return await photos.find({ albums: { $in: [Number(albumId)] } }).toArray()
}

/**
 * Find album by name
 * @param {string} albumName Album name to find
 * @returns {Promise<Object|undefined>} Album object or undefined if not found
 */
async function findAlbumByName(albumName) {
    await connect()
    return await albums.findOne({ name: albumName})
}


/**
 * Update photo in storage
 * @param {Object} updatedPhoto Updated photo object
 * @returns {Promise<boolean>} True if successful, false if photo not found
 */
async function updatePhoto(updatedPhoto) {
    await connect()
    const result = await photos.updateOne(
        {id: Number(updatedPhoto.id)},
        {$set: updatedPhoto}
    )
    return result.modifiedCount === 1
}

/**
 * Find user by id
 * @param {number} id
 * @returns {Promise<Object|null>} user document or null if not found
 */
async function findUser(id) {
    await connect()
    return await users.findOne({ id : Number(id) })
}

/**
 * Create a new user account
 * @param {number|string} id - Unique user ID (will be stored as Number)
 * @param {string} name - Full name
 * @param {string} email - (optional) email; kept for future use
 * @param {string} password - Plain password (simple version)
 * @returns {Promise<boolean>} true if created, false if ID already exists
 */
async function createUser(id, name, email, password) {
    await connect()
    await users.insertOne({
        id: Number(id),
        name : name,
        email : email,
        password : password
    })

  return true;
}

async function getAllUsers() {
    await connect()
    return await users.find({}).toArray()
}

async function getAllPhotos() {
    await connect()
    return await photos.find({}).toArray()
}

async function getAllAlbums() {
    await connect()
    return await albums.find({}).toArray()
}

/**
 * 
 * Saves a new session in the sessions collection.
 * @param {string} uuid - Unique session key.
 * @param {Date} expiry - Session expiry date/time.
 * @param {Object} data - Additional session data to store.
 */
async function saveSession(uuid, expiry, data) {
    await connect()
    await session.insertOne({
        SessionKey: uuid,
        Expiry: expiry,
        Data: data
    })
}


/**
 * Retrieves session data based on session key.
 * @param {string} key - The session key to look up.
 * @returns {Object|null} The session object or null.
 */
async function getSessionData(key) {
    await connect()
    let result = await session.find({ SessionKey: key })
    let resultData = await result.toArray()
    return resultData[0]
}


/**
 * Deletes a session by its key.
 * @param {string} key - The session key to delete.
 */
async function deleteSession(key) {
    await connect()
    await session.deleteOne({ SessionKey: key })
}



module.exports = {
    // Everything
    getAllUsers,
    getAllPhotos,
    getAllAlbums,
    
    // user
    findUser,
    createUser,

    // photo
    findPhoto,
    findPhotosByAlbum,
    updatePhoto,
    readPhotoData,

    // album
    findAlbumByName,
    readAlbumData,

    // session
    saveSession,
    getSessionData,
    deleteSession
}