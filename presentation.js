const prompt = require('prompt-sync')()
const business = require('./business')

/**
 * Format date from ISO string to readable format
 * @param {string} dateString ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })
}

/**
 * Display photo details
 * @param {Object} photo Photo object
 * @returns {Promise<void>}
 */
async function displayPhotoDetails(photo) {
    const albumNames = await business.getAlbumNames(photo.albums)
    console.log(`Filename: ${photo.filename}`)
    console.log(` Title: ${photo.title}`)
    console.log(`  Date: ${formatDate(photo.date)}`)
    console.log(`Albums: ${albumNames}`)
    console.log(`  Tags: ${photo.tags.join(', ')}`)
}

/**
 * Find and display photo by ID
 * @param {number} photoId Photo ID to find
 * @param {number} userId Current user ID
 * @returns {Promise<void>}
 */
async function findPhotoById(photoId, userId) {
    let photo = await business.findPhoto(photoId, userId)
    if (photo) {
        await displayPhotoDetails(photo)
    } else {
        console.log('Photo not found or access denied')
    }
}

/**
 * Update photo details
 * @param {number} photoId Photo ID to update
 * @param {number} userId Current user ID
 * @returns {Promise<void>}
 */
async function updatePhotoDetails(photoId, userId) {
    let photo = await business.findPhoto(photoId, userId)
    if (!photo) {
        console.log('Photo not found or access denied')
        return
    }
    
    console.log(`Press enter to keep existing value.`)
    const newTitle = prompt(`Enter value for title [${photo.title}]: `)
    const newDescription = prompt(`Enter value for description [${photo.description}]: `)
    
    if (await business.updatePhotoDetails(photoId, newTitle, newDescription, userId)) {
        console.log('Photo updated')
    } else {
        console.log('Failed to update photo')
    }
}

/**
 * List photos in an album in CSV format
 * @param {string} albumName Name of the album
 * @param {number} userId Current user ID
 * @returns {Promise<void>}
 */
async function listAlbumPhotos(albumName, userId) {
    let photos = await business.listAlbumPhotos(albumName, userId)
    
    if (photos.length === 0) {
        console.log('No photos found in this album or album not found')
        return
    }
    
    console.log('filename,resolution,tags')
    for (let photo of photos) {
        console.log(`${photo.filename},${photo.resolution},${photo.tags.join(':')}`)
    }
}

/**
 * Add tag to a photo
 * @param {number} photoId Photo ID to tag
 * @param {string} tag Tag to add
 * @param {number} userId Current user ID
 * @returns {Promise<void>}
 */
async function addTagToPhoto(photoId, tag, userId) {
    if (await business.addTagToPhoto(photoId, tag, userId)) {
        console.log('Updated!')
    } else {
        console.log('Photo not found, access denied, or tag already exists')
    }
}

/**
 * Login function
 * @returns {Promise<Object|undefined>} User object if login successful
 */
async function login() {
    console.log('=== Digital Media Catalog Login ===')
    let username = prompt('Username: ')
    let password = prompt('Password: ')
    
    let user = await business.authenticateUser(username, password)
    if (user) {
        console.log(`Welcome, ${user.username}!`)
        return user
    } else {
        console.log('Invalid username or password')
        return undefined
    }
}

/**
 * Main application function with menu
 * @returns {Promise<void>}
 */
async function application() {
    let user = await login()
    if (!user) {
        console.log('Login failed. Exiting...')
        return
    }
    
    console.log('=== Digital Media Catalog ===')
    
    while (true) {
        console.log('\nOptions:')
        console.log('1. Find Photo')
        console.log('2. Update Photo Details')
        console.log('3. Album Photo List')
        console.log('4. Add Tag to Photo')
        console.log('5. Exit')
        
        const selection = Number(prompt('Your selection> '))
        
        if (selection === 1) {
            const photoId = Number(prompt('Photo ID? '))
            await findPhotoById(photoId, user.id)
        } else if (selection === 2) {
            const photoId = Number(prompt('Photo ID? '))
            await updatePhotoDetails(photoId, user.id)
        } else if (selection === 3) {
            const albumName = prompt('What is the name of the album? ')
            await listAlbumPhotos(albumName, user.id)
        } else if (selection === 4) {
            const photoId = Number(prompt('What photo ID to tag? '))
            const tag = prompt('What tag to add? ')
            await addTagToPhoto(photoId, tag, user.id)
        } else if (selection === 5) {
            console.log('Goodbye!')
            break
        } else {
            console.log('Invalid option. Please choose between 1-5.')
        }
    }
}

// Start the application
application()