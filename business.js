const persistence = require('./persistence')

/**
 * Get all photos (with access control)
 * @param {number} userId Current user ID
 * @returns {Promise<Array>} Array of photos accessible to user
 */
async function allPhotos(userId) {
    let photos = await persistence.readPhotoData()
    let result = []
    for (let photo of photos) {
        if (photo.owner === userId) {
            result.push(photo)
        }
    }
    return result
}

/**
 * Find photo by ID with access control
 * @param {number} photoId Photo ID to find
 * @param {number} userId Current user ID  
 * @returns {Promise<Object|undefined>} Photo object or undefined if not found/not accessible
 */
async function findPhoto(photoId, userId) {
    let photo = await persistence.findPhoto(photoId)
    if (photo && photo.owner === userId) {
        return photo
    }
    return undefined
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
 * List photos in an album with access control
 * @param {string} albumName Name of the album
 * @param {number} userId Current user ID
 * @returns {Promise<Array>} Array of photos in the album accessible to user
 */
async function listAlbumPhotos(albumName, userId) {
    let album = await persistence.findAlbumByName(albumName)
    if (!album) {
        return []
    }
    
    let photos = await persistence.findPhotosByAlbum(album.id)
    let result = []
    for (let photo of photos) {
        if (photo.owner === userId) {
            result.push(photo)
        }
    }
    return result
}

/**
 * Update photo details with access control
 * @param {number} photoId Photo ID to update
 * @param {string} title New title
 * @param {string} description New description  
 * @param {number} userId Current user ID
 * @returns {Promise<boolean>} True if successful, false if not found/not accessible
 */
async function updatePhotoDetails(photoId, title, description, userId) {
    let photo = await persistence.findPhoto(photoId)
    if (!photo || photo.owner !== userId) {
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
 * Add tag to photo with access control
 * @param {number} photoId Photo ID to tag
 * @param {string} tag Tag to add
 * @param {number} userId Current user ID
 * @returns {Promise<boolean>} True if successful, false if not found/not accessible/tag exists
 */
async function addTagToPhoto(photoId, tag, userId) {
    let photo = await persistence.findPhoto(photoId)
    if (!photo || photo.owner !== userId) {
        return false
    }
    
    if (photo.tags.includes(tag)) {
        return false
    }
    
    photo.tags.push(tag)
    return await persistence.updatePhoto(photo)
}

/**
 * Authenticate user
 * @param {string} username Username
 * @param {string} password Password  
 * @returns {Promise<Object|undefined>} User object if authenticated, undefined otherwise
 */
async function authenticateUser(username, password) {
    let user = await persistence.findUser(username)
    if (user && user.password === password) {
        return user
    }
    return undefined
}

module.exports = {
    allPhotos,
    findPhoto,
    getAlbumNames,
    listAlbumPhotos,
    updatePhotoDetails,
    addTagToPhoto,
    authenticateUser
}