const express = require('express')
const business = require('./business')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const app = express()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser)
app.use(express.static('public'))
app.use(cookieParser())
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

// Login POST
app.post('/login', async (req, res) => {
  let result = await business.validateCredentials(req.body)

  let id = req.body.id

  if(!result){
      res.render("login", {
          errmsg : "Invalid User Id or Password missmatch"
      })
      return
  }


  let session = await business.startSession({
      id: id,
  })

  res.cookie('session', session.uuid, {expires: session.expiry})
  res.redirect("/kfoo")
})

app.get("/kfoo", async (req, res) => {
  res.send("Kfooooooooooo")
})

// Register Page
app.get('/register', (req, res) => {
  res.render('register', { layout: undefined })
})

// Register POST
app.post('/register', async (req, res) => {
  let user = req.body
  console.log(user)
  let notAvailable = await business.isUserIdAvailable(user.id)
  if(notAvailable){
      res.render('register', {layout:undefined, errmsg : "This User Id is already taken. Please choose another one."})
      return
  }

  notAvailable = await business.isEmailAvailable(user.email)
  if(notAvailable){
      res.render('register', {layout:undefined, errmsg : "This email is already registered. Please use a different email or log in."})
      return
  }

  notAvailable = business.arePasswordsMatching(user.password, user.confirm)
  if(!notAvailable){
      res.render('register', {layout:undefined, errmsg : "The passwords you entered do not match. Please try again."})
      return
  }
  await business.createUser(user)
  
  res.render("login", {
      layout : undefined,
      msg : "Account has been created"
  })

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