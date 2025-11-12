const persistence = require('./persistence')
const crypto = require("crypto")

/**
 * Get all photos 
 * @returns {Promise<Array>} Array of photos accessible to user
 */
async function allPhotos() {
    return await persistence.getAllPhotos()
}

/**
 * Find album by name
 * @param {string} albumName Album name to find
 * @returns {Promise<Object|undefined>} Album object or undefined if not found
 */
async function findAlbumByName(albumName) {
    return await persistence.findAlbumByName(albumName) 
}

/**
 * Find photo by ID with access control
 * @param {number} photoId Photo ID to find
 * @returns {Promise<Object|undefined>} Photo object or undefined if not found/not accessible
 */
async function findPhoto(photoId) {
    return await persistence.findPhoto(photoId)
}

/**
 * Get album names from album IDs
 * @param {Array} albumIds Array of album IDs
 * @returns {Promise<string>} Comma-separated list of album names
 */
async function getAlbumNames(albumIds) {
    let albums = await persistence.readAlbumData()
    let names = []
    for (let album of albums) {
        if (albumIds.includes(album.id)) {
            names.push(album.name)
        }
    }
    return names.join(', ')
}

/**
 * List photos in an album
 * @param {string} albumName Name of the album
 * @returns {Promise<Array>} Array of photos in the album 
 */
async function listAlbumPhotos(albumName) {
    let album = await persistence.findAlbumByName(albumName)
    if (!album) {
        return []
    }
    
    let photos = await persistence.findPhotosByAlbum(album.id)
    return photos
}

/**
 * Update photo details
 * @param {number} photoId Photo ID to update
 * @param {string} title New title
 * @param {string} description New description  
 * @returns {Promise<boolean>} True if successful, false if not found/not accessible
 */
async function updatePhotoDetails(photoId, title, description) {
    let photo = await persistence.findPhoto(photoId)
    if (!photo) {
        return false
    }
    
    if (title.trim() !== '') {
        photo.title = title
    }
    
    if (description.trim() !== '') {
        photo.description = description
    }
    
    return await persistence.updatePhoto(photo)
}

/**
 * Get all albums
 * @returns {Promise<Array>} Array of all albums
 */
async function allAlbums() {
    return await persistence.readAlbumData()
}

async function getUserById(id) {
    return await persistence.getUserById(id)
}

async function validateCredentials(user) {
    let data = await persistence.getUserById(user.id)
    let password = user.password
    console.log(user)
    console.log(data)
    if (data && data.id === Number(user.id) && data.password === password) {
        return true
    }
    
    return false
}

/**
 * 
 * @param {String} userId 
 * @returns {Promise<object|null>}
 */
async function isUserIdAvailable(id) {
    return await getUserById(id)
}

/**
 * 
 * @param {string} email 
 * @returns {Promise<Object|null>} Student data if available,else null
 */
async function isEmailAvailable(email) {
    return await persistence.getUserByEmail(email)
}

function arePasswordsMatching(password, repeatPassword) {
    return password === repeatPassword
}

async function createUser(user) {
    await persistence.createUser(user.id, user.name , user.email , user.password )
}

async function startSession(data) {
    let uuid = crypto.randomUUID()
    let expiry = new Date(Date.now() + 1000*60*4)
    await persistence.saveSession(uuid, expiry, data)
    return {
        uuid: uuid,
        expiry: expiry
    }
}



module.exports = {
    allPhotos,
    findAlbumByName,  
    findPhoto,
    getAlbumNames,
    listAlbumPhotos,
    updatePhotoDetails,
    allAlbums,

    createUser,
    getUserById,
    isUserIdAvailable,
    validateCredentials,
    isEmailAvailable,
    arePasswordsMatching,

    startSession
}