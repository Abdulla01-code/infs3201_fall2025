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
async function getAlbumByName(albumName) {
    return await persistence.getAlbumByName(albumName) 
}

/**
 * Find photo by ID with access control
 * @param {number} photoId Photo ID to find
 * @returns {Promise<Object|undefined>} Photo object or undefined if not found/not accessible
 */
async function getPhotoById(photoId) {
    return await persistence.getPhotoById(photoId)
}

/**
 * Get album names from album IDs
 * @param {Array} albumIds Array of album IDs
 * @returns {Promise<string>} Comma-separated list of album names
 */
async function getAlbumNames(albumIds) {
    let albums = await persistence.getAllAlbums()
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
 * @param {string} albumId id of the album
 * @returns {Promise<Array>} Array of photos in the album 
 */
async function listAlbumPhotos(albumId) {
    let album = await persistence.getAlbumById(albumId)
    if (!album) {
        return []
    }
    
    let photos = await persistence.getPhotosByAlbumId(album.id)
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
    let photo = await persistence.getPhotoById(photoId)
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
    return await persistence.getAllAlbums()
}

async function getAlbumById(albumId) {
    return await persistence.getAlbumById(albumId)
}

async function getUserById(id) {
    return await persistence.getUserById(id)
}

async function validateCredentials(user) {
    let data = await persistence.getUserById(user.id)
    let password = user.password
    if (data && data.id === Number(user.id) && data.password === hashPass(password)) {
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
    hashedPass = hashPass(user.password)
    await persistence.createUser(user.id, user.name , user.email , hashedPass )
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

/**
 * 
 * @param {string} sessionKey - The session key to validate
 * @returns {Promise<boolean>} - Returns true if the session is valid
 */
async function validSession(sessionKey) {
    if (!sessionKey) {
        return false
    }

    let sessionData = await persistence.getSessionData(sessionKey)
    if (!sessionData) {
        return false
    }

    return true
}

async function getSessionData(sessionKey) {
    return await persistence.getSessionData(sessionKey)
}

async function getUserPhotosById(id) {
    return await persistence.getUserPhotosById(id)
}

async function getPublicPhotos(id) {
    return await persistence.getPublicPhotos(id)
}

async function changeVisibility(id, visibility) {
    await persistence.changeVisibility(id, visibility)
}

async function addCommentToPhoto(photoId, comment) {
    await persistence.addCommentToPhoto(photoId, comment)
}

async function logout(SessionKey) {
  await persistence.deleteSession(SessionKey);
}

/**
 * 
 * @param {string} password - hashing for the password for more security
 * @returns 
 */
function hashPass(password){
    let hash = crypto.createHash('sha256')
    hash.update(password)
    let result = hash.digest('hex')
    return result
}


module.exports = {
    allPhotos,
    getPublicPhotos,
    getAlbumByName,  
    getPhotoById,
    changeVisibility,
    addCommentToPhoto,

    getUserPhotosById,
    getAlbumNames,
    getAlbumById,
    listAlbumPhotos,
    updatePhotoDetails,
    allAlbums,

    createUser,
    getUserById,
    isUserIdAvailable,
    validateCredentials,
    isEmailAvailable,
    arePasswordsMatching,

    startSession,
    validSession,
    getSessionData,
    logout
}