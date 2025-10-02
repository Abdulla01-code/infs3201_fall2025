const fs = require('fs/promises')
const prompt = require('prompt-sync')()


/**
 * Load photo data from JSON file
 * @returns {Promise<Array>} Array of photo objects
 */
async function loadPhotoData() {
    let raw = await fs.readFile("photos.json")
    return JSON.parse(raw)
    
}

/**
 * Load album data from JSON file
 * @returns {Promise<Array>} Array of album objects
 */
async function loadAlbumData() {
    let raw = await fs.readFile("albums.json")
    return JSON.parse(raw)

}

/**
 * Save photo data to JSON file
 * @param {Array} photoList Array of photo objects
 * @returns {Promise<void>}
 */
async function savePhotoData(photoList) {
    await fs.writeFile("photos.json", JSON.stringify(photoList, null, 2))
    
}

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
 * Get album names from album IDs
 * @param {Array} albumIds Array of album IDs
 * @param {Array} albumList Array of album objects
 * @returns {string} Comma-separated list of album names
 */
function getAlbumNames(albumIds, albumList) {
    let names = []
    for (let i = 0; i < albumList.length; i++) {
        if (albumIds.includes(albumList[i].id)) {
            names.push(albumList[i].name)
        }
    }
    return names.join(', ')
}

/**
 * Find and display photo by ID
 * @param {number} photoId Photo ID to find
 * @returns {Promise<void>}
 */
async function findPhotoById(photoId) {
    const photoList = await loadPhotoData()
    const albumList = await loadAlbumData()
    
    let found = false
    for (let i = 0; i < photoList.length; i++) {
        if (photoList[i].id === photoId) {
            found = true
            const photo = photoList[i]
            console.log(`Filename: ${photo.filename}`)
            console.log(` Title: ${photo.title}`)
            console.log(`  Date: ${formatDate(photo.date)}`)
            console.log(`Albums: ${getAlbumNames(photo.albums, albumList)}`)
            console.log(`  Tags: ${photo.tags.join(', ')}`)
            break
        }
    }
    
    if (!found) {
        console.log('Photo not found')
    }
}

/**
 * Update photo details (title and description)
 * @param {number} photoId Photo ID to update
 * @returns {Promise<void>}
 */
async function updatePhotoDetails(photoId) {
    const photoList = await loadPhotoData()
    let photoFound = false
    
    for (let i = 0; i < photoList.length; i++) {
        if (photoList[i].id === photoId) {
            photoFound = true
            const photo = photoList[i]
            
            console.log(`Press enter to keep existing value.`)
            const newTitle = prompt(`Enter value for title [${photo.title}]: `)
            const newDescription = prompt(`Enter value for description [${photo.description}]: `)
            
            if (newTitle.trim() !== '') {
                photo.title = newTitle
            }
            
            if (newDescription.trim() !== '') {
                photo.description = newDescription
            }
            
            await savePhotoData(photoList)
            console.log('Photo updated')
            break
        }
    }
    
    if (!photoFound) {
        console.log('Photo not found')
    }
}

/**
 * List photos in an album in CSV format
 * @param {string} albumName Name of the album
 * @returns {Promise<void>}
 */
async function listAlbumPhotos(albumName) {
    const photoList = await loadPhotoData()
    const albumList = await loadAlbumData()
    
    // Find album ID from name
    let albumId = null
    for (let i = 0; i < albumList.length; i++) {
        if (albumList[i].name.toLowerCase() === albumName.toLowerCase()) {
            albumId = albumList[i].id
            break
        }
    }
    
    if (albumId === null) {
        console.log('Album not found')
        return
    }
    
    // Find photos in the album
    const albumPhotos = []
    for (let i = 0; i < photoList.length; i++) {
        if (photoList[i].albums.includes(albumId)) {
            albumPhotos.push(photoList[i])
        }
    }
    
    if (albumPhotos.length === 0) {
        console.log('No photos found in this album')
        return
    }
    
    // Display in CSV format
    console.log('filename,resolution,tags')
    for (let i = 0; i < albumPhotos.length; i++) {
        const photo = albumPhotos[i]
        console.log(`${photo.filename},${photo.resolution},${photo.tags.join(':')}`)
    }
}

/**
 * Add tag to a photo
 * @param {number} photoId Photo ID to tag
 * @param {string} tag Tag to add
 * @returns {Promise<void>}
 */
async function addTagToPhoto(photoId, tag) {
    const photoList = await loadPhotoData()
    let photoFound = false
    
    for (let i = 0; i < photoList.length; i++) {
        if (photoList[i].id === photoId) {
            photoFound = true
            const photo = photoList[i]
            
            if (photo.tags.includes(tag)) {
                console.log('Tag already exists for this photo')
            } else {
                photo.tags.push(tag)
                await savePhotoData(photoList)
                console.log('Updated!')
            }
            
            break
        }
    }
    
    if (!photoFound) {
        console.log('Photo not found')
    }
}

/**
 * Main application function with menu
 * @returns {Promise<void>}
 */
async function application() {
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
            await findPhotoById(photoId)
        } else if (selection === 2) {
            const photoId = Number(prompt('Photo ID? '))
            await updatePhotoDetails(photoId)
        } else if (selection === 3) {
            const albumName = prompt('What is the name of the album? ')
            await listAlbumPhotos(albumName)
        } else if (selection === 4) {
            const photoId = Number(prompt('What photo ID to tag? '))
            const tag = prompt('What tag to add? ')
            await addTagToPhoto(photoId, tag)
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