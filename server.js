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
      id: Number(id),
  })

  res.cookie('session', session.uuid, {expires: session.expiry})

  res.redirect("/home")
})

app.get("/home", async (req ,res) => {
  if(!await business.validSession(req.cookies.session)){
    res.render("login", {
        errmsg : "You are not logged in"
    })
    return
  }

  let sessionData = await business.getSessionData(req.cookies.session)
  let user = await business.getUserById(sessionData.Data.id)

  let userPhotos = await business.getUserPhotosById(user.id)
  let publicPhotos = await business.getPublicPhotos(user.id)
  res.render('photos', {
  user: { id : user.id, name : user.name },
  userPhotos : userPhotos,
  publicPhotos : publicPhotos
  })

})

// Register Page
app.get('/register', (req, res) => {
  res.render('register', { layout: undefined })
})

// Register POST
app.post('/register', async (req, res) => {
  let user = req.body
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

// Edit Photo Page (GET)
app.get('/edit-photo/:photoId', async (req, res) => {
  if(!await business.validSession(req.cookies.session)){
    res.render("login", {
        errmsg : "You are not logged in"
    })
    return
  }

  let photo = await business.getPhotoById(Number(req.params.photoId))
  if (!photo) {
    res.send('Photo not found')
    return
  }
  
  res.render('edit-photo', { photo: photo, layout: undefined })
})


// Edit Photo Page (POST)
app.post('/edit-photo/:photoId', async (req, res) => {
  if(!await business.validSession(req.cookies.session)){
    res.render("login", {
        errmsg : "You are not logged in"
    })
    return
  }

  let photoId = Number(req.params.photoId)
  let title = req.body.title
  let description = req.body.description
  
  let result = await business.updatePhotoDetails(photoId, title, description)
  console.log(result)
  if (result) {
      res.redirect("/home")
  } else {
      res.send('Photo could not be updated')
  }
})

app.listen(8000, () => {
    console.log("Digital Media Catalog started on port 8000")
})