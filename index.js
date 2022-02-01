const dotenv = require("dotenv");
const express = require("express");
const { WorkOS } = require("@workos-inc/node");
const logger = require("morgan");
const session = require("express-session");
const { Cerbos } = require("cerbos");
const db = require("./db.js");

dotenv.config();

const app = express();

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientID = process.env.WORKOS_CLIENT_ID;

const cerbos = new Cerbos({
  hostname: process.env.CERBOS_HOSTNAME, // The Cerbos PDP instance
  playgroundInstance: process.env.CERBOS_PLAYGROUND, // The playground instance ID to test
});

app.set("views", "./views");
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/auth", (_req, res) => {
  const connection = process.env.WORKOS_CONNECTION_ID;
  const redirectURI = `http://localhost:${process.env.PORT}/callback`;

  const authorizationURL = workos.sso.getAuthorizationURL({
    clientID: clientID,
    redirectURI: redirectURI,
    connection: connection,
  });

  res.redirect(authorizationURL);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  const { profile } = await workos.sso.getProfileAndToken({
    code,
    clientID,
  });

  req.session.profile = profile;
  req.session.save();

  // Use the information in `profile` for further business logic.
  res.redirect("/");
});

app.get("/", async (req, res) => {
  if (req.session.profile) {
    const contacts = db.find(req.params.id);
    const cerbosRequest = {
      principal: {
        id: req.session.profile.id,
        roles: ["user"],
        attr: req.session.profile.raw_attributes,
      },
      resource: {
        kind: "contact",
        instances: contacts.reduce(function (result, item, index, array) {
          result[item.id] = { attr: item }; //a, b, c
          return result;
        }, {}),
      },
      actions: ["read", "update", "delete"],
    };
    // check user is authorized
    const cerbosResponse = await cerbos.check(cerbosRequest);

    res.render("index-loggedin", {
      title: "Cerbos/WorkOS Demo",
      subtitle: `Logged in as ${req.session.profile.email}`,
      user: req.session.profile,
      cerbosRequest,
      cerbosResponse,
    });
  } else {
    res.render("index-loggedout", {
      title: "Cerbos/WorkOS Demo",
      subtitle: `Not logged in`,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Running on http://localhost:${process.env.PORT}`);
});
