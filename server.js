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

  if (!result) {
    res.render("login", {
      errmsg: "Invalid User Id or Password missmatch"
    })
    return
  }


  let session = await business.startSession({
    id: Number(id),
  })

  res.cookie('session', session.uuid, { expires: session.expiry })

  res.redirect("/dashboard")
})

app.get("/dashboard", async (req, res) => {
  if (!await business.validSession(req.cookies.session)) {
    return res.render("login", {
      errmsg: "You are not logged in"
    });
  }

  let sessionData = await business.getSessionData(req.cookies.session)
  let user = await business.getUserById(sessionData.Data.id)

  res.render("dashboard", {
    layout: undefined,
    user: user
  })
})


app.get("/home", async (req, res) => {
  if (!await business.validSession(req.cookies.session)) {
    res.render("login", {
      errmsg: "You are not logged in"
    })
    return
  }

  let sessionData = await business.getSessionData(req.cookies.session)
  let user = await business.getUserById(sessionData.Data.id)

  let userPhotos = await business.getUserPhotosById(user.id)
  let publicPhotos = await business.getPublicPhotos(user.id)

  res.render('photos', {
    user: { id: user.id, name: user.name },
    userPhotos: userPhotos,
    publicPhotos: publicPhotos
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
  if (notAvailable) {
    res.render('register', { layout: undefined, errmsg: "This User Id is already taken. Please choose another one." })
    return
  }

  notAvailable = await business.isEmailAvailable(user.email)
  if (notAvailable) {
    res.render('register', { layout: undefined, errmsg: "This email is already registered. Please use a different email or log in." })
    return
  }

  notAvailable = business.arePasswordsMatching(user.password, user.confirm)
  if (!notAvailable) {
    res.render('register', { layout: undefined, errmsg: "The passwords you entered do not match. Please try again." })
    return
  }
  await business.createUser(user)

  res.render("login", {
    layout: undefined,
    msg: "Account has been created"
  })

})

// Edit Photo Page (GET)
app.get('/edit-photo/:photoId', async (req, res) => {
  if (!await business.validSession(req.cookies.session)) {
    res.render("login", {
      errmsg: "You are not logged in"
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
  if (!await business.validSession(req.cookies.session)) {
    res.render("login", {
      errmsg: "You are not logged in"
    })
    return
  }

  let photoId = Number(req.params.photoId)
  let title = req.body.title
  let description = req.body.description

  let result = await business.updatePhotoDetails(photoId, title, description)
  if (result) {
    res.redirect("/home")
  } else {
    res.send('Photo could not be updated')
  }
})

app.post("/photos/:id/visibility", async (req, res) => {
  if (!await business.validSession(req.cookies.session)) {
    res.render("login", {
      errmsg: "You are not logged in"
    })
    return
  }

  let id = Number(req.params.id)
  let visibility = req.body.visibility

  await business.changeVisibility(id, visibility)
  res.redirect("/home")
})

app.post("/photos/:id/comments", async (req, res) => {
  if (!await business.validSession(req.cookies.session)) {
    res.render("login", {
      errmsg: "You are not logged in"
    })
    return
  }

  let photoId = req.params.id
  let text = req.body.text

  let sessionData = await business.getSessionData(req.cookies.session)
  let user = await business.getUserById(sessionData.Data.id)
  let comment = {
    userId: user.id,
    userName: user.name,
    text: text.trim(),
    createdAt: new Date()
  }
  await business.addCommentToPhoto(photoId, comment)
  res.redirect("/home")
})

// Albums List Page
app.get("/albums", async (req, res) => {

  // check session
  if (!await business.validSession(req.cookies.session)) {
    return res.render("login", {
      errmsg: "You are not logged in"
    })
  }
  let sessionData = await business.getSessionData(req.cookies.session)
  let user = await business.getUserById(sessionData.Data.id)
  // get albums
  let allAlbums = await business.allAlbums()

  // send data to Handlebars file
  res.render("albums", {
    albums: allAlbums,
    user: user,
    layout: undefined
  })
})

app.get("/albums/:id", async (req, res) => {

  // 1) Check session
  if (!await business.validSession(req.cookies.session)) {
    return res.render("login", { errmsg: "You are not logged in" })
  }

  // 2) Get user for header + logout
  let sessionData = await business.getSessionData(req.cookies.session)
  let user = await business.getUserById(sessionData.Data.id)

  // 3) Get album ID
  let albumId = Number(req.params.id)

  // 4) Load photos inside this album
  let photos = await business.listAlbumPhotos(albumId)
  let album = await business.getAlbumById(albumId)
  // 5) Render page
  res.render("album-photos", {
    layout: undefined,
    user: user,
    album: album,
    photos: photos
  })
})

app.get("/photo/:id", async (req, res) => {

  if (!await business.validSession(req.cookies.session)) {
    return res.render("login", { errmsg: "You are not logged in" });
  }

  let sessionData = await business.getSessionData(req.cookies.session);
  let user = await business.getUserById(sessionData.Data.id);

  let photoId = Number(req.params.id);
  let photo = await business.getPhotoById(photoId);

  if (!photo) {
    return res.send("Photo not found");
  }

  let isOwner = (photo.owner === user.id);

  res.render("photo-details", {
    layout: undefined,
    user: user,
    photo: photo,
    isOwner: isOwner
  });
});


app.post("/logout", async (req, res) => {
  let SessionKey = req.cookies.session

  if (SessionKey) {
    await business.logout(SessionKey)
  }

  res.clearCookie("session")
  res.redirect("/")
})

app.listen(8000, () => {
  console.log("Digital Media Catalog started on port 8000")
})