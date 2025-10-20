const fs = require('fs/promises')

const mongodb = require("mongodb")
let db = undefined
let photos = undefined
let albums = undefined
let users = undefined

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
    return await photos.findOne({id: photoId})
}


/**
 * Find photos by album ID
 * @param {number} albumId Album ID to search
 * @returns {Promise<Array>} Array of photos in the album
 */
async function findPhotosByAlbum(albumId) {
    await connect()
    return await albums.find({ albums: { $in: [albumId] } }).toArray()
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
        {id: updatedPhoto.id},
        {$set: updatedPhoto}
    )
    return result.modifiedCount === 1
}

async function getAllUsers() {

    return []
}

async function getAllPhotos() {
    await connect()
    return await photos.find({}).toArray()
}

async function getAllAlbums() {
    await connect()
    return await albums.find({}).toArray()
}

getAllUsers()


module.exports = {
    getAllUsers,
    getAllPhotos,
    getAllAlbums,
    findPhoto,
    findPhotosByAlbum,
    findAlbumByName,
    updatePhoto,
    readAlbumData,
    readPhotoData
}