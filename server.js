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
app.get('/', (req, res) => {
  res.render('login', { layout: undefined })
})

// Register Page
app.get('/register', (req, res) => {
  res.render('register', { layout: undefined })
})

// Login POST
app.post('/login', async (req, res) => {
  const { id, password } = req.body
  const user = await business.findUser(id, password)
  if (user) {
    res.redirect('/home')
  } else {
    res.render('login', { errmsg: 'Invalid ID or password', layout: undefined })
  }
})

// Register POST
app.post('/register', async (req, res) => {
  const { id, password } = req.body
  const result = await business.createUser(id, password)
  if (result) {
    res.render('login', { msg: 'Account created successfully!', layout: undefined })
  } else {
    res.render('register', { errmsg: 'User already exists', layout: undefined })
  }
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