const dotenv = require("dotenv");
const express = require("express");
const { WorkOS } = require("@workos-inc/node");
const logger = require("morgan");
const session = require("express-session");
const { Cerbos } = require("@cerbos/sdk");
const db = require("./db.js");

dotenv.config();

const app = express();

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.WORKOS_CLIENT_ID;

const cerbos = new Cerbos({
  hostname: process.env.CERBOS_HOSTNAME, // The Cerbos PDP instance
  playgroundInstance: process.env.CERBOS_PLAYGROUND, // The playground instance ID to test
});

app.set("views", "./views");
app.set("view engine", "pug");
app.use(logger("dev"));

app.get("/auth", (_req, res) => {
  const redirectUri = `http://localhost:${process.env.PORT}/callback`;
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    // Specify that we'd like AuthKit to handle the authentication flow
    provider: "authkit",

    // The callback endpoint that WorkOS will redirect to after a user authenticates
    redirectUri,
    clientId,
  });

  // Redirect the user to the AuthKit sign-in page
  res.redirect(authorizationUrl);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;

  const { user } = await workos.userManagement.authenticateWithCode({
    code,
    clientId,
  });

  const contacts = db.find(req.params.id);
  const cerbosRequest = {
    principal: {
      id: user.id,
      roles: ["user"],
      attr: user,
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
    subtitle: `Logged in as ${user.email}`,
    user,
    cerbosRequest,
    cerbosResponse,
  });
});

app.get("/", async (req, res) => {
  res.render("index-loggedout", {
    title: "Cerbos/WorkOS Demo",
    subtitle: `Not logged in`,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Running on http://localhost:${process.env.PORT}`);
});
