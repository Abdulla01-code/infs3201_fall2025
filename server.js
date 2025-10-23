const express = require('express')
const business = require('./business')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')

const app = express()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser)
app.use(express.static('public'))

// Set up Handlebars with helper for photo count
const hbs = exphbs.create({ 
    defaultLayout: undefined,
    helpers: {
        eq: (a, b) => a === b
    }
})

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')


// Serve static files
app.use(express.static('public'))

// Landing Page
app.get('/', async (req, res) => {
    let albums = await business.allAlbums()
    res.render('home', { albums: albums, layout: undefined })
})


// Album Details Page
app.get('/album/:albumName', async (req, res) => {
    let album = await business.findAlbumByName(req.params.albumName)
    if (!album) {
        res.send('Album not found')
        return
    }
    
    let photos = await business.listAlbumPhotos(album.name)
    res.render('album', { 
        album: album, 
        photos: photos,
        photoCount: photos.length,
        layout: undefined
    })
})

// Photo Details Page
app.get('/photo/:photoId', async (req, res) => {
    let photo = await business.findPhoto(Number(req.params.photoId))
    if (!photo) {
        res.send('Photo not found')
        return
    }
    
    res.render('photo', { photo: photo, layout: undefined })
})

// Edit Photo Page (GET)
app.get('/edit-photo/:photoId', async (req, res) => {
    let photo = await business.findPhoto(Number(req.params.photoId))
    if (!photo) {
        res.send('Photo not found')
        return
    }
    
    res.render('edit-photo', { photo: photo, layout: undefined })
})


// Edit Photo Page (POST) - PRG Pattern
app.post('/edit-photo/:photoId', async (req, res) => {
    let photoId = Number(req.params.photoId)
    let title = req.body.title
    let description = req.body.description
    
    let result = await business.updatePhotoDetails(photoId, title, description)
    if (result) {
        res.redirect(`/photo/${photoId}`)
    } else {
        res.send('Photo could not be updated')
    }
})

app.listen(8000, () => {
    console.log("Digital Media Catalog started on port 8000")
})