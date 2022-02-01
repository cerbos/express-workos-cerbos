# express-auth0-cerbos

An example application of integrating [Cerbos](https://cerbos.dev) with an [Express](https://expressjs.com/) server using [WorkOS](https://workos.com/) for authentication.

## Dependencies

- Node.js
- An WorkOS account

## Getting Started


1. Install node dependencies

```bash
npm install
```

2. Set Config

Create a `.env` file with the following values:

```
PORT=8000
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_CONNECTION_ID=
CERBOS_HOSTNAME=https://demo-pdp.cerbos.cloud
CERBOS_PLAYGROUND=ygW612cc9c9xXOsOZjI40ovY2LZvXf43
```
You can find the WorkOS values in your dashboard.

> This example is using the hosted Demo PDP of Cerbos and an example Playground instance. If you are running your own Cerbos PDP then update the `CERBOS_HOSTNAME` field to your own instance and remove the `CERBOS_PLAYGROUND` field.

3. Start the express server

```bash
node index.js
```

4. Test the App

Now that everything is wired up you should be able to goto [http://localhost:8000](http://localhost:8000) and press the login link to authenticate with your WorkOS account.

## Policies

This example has a simple CRUD policy in place for a resource kind of `contact` - like a CRM system would have. Should you wish to experiment with this policy, you can <a href="https://play.cerbos.dev/p/ygW612cc9c9xXOsOZjI40ovY2LZvXf43" target="_blank">try it in the Cerbos Playground</a>.

<a href="https://play.cerbos.dev/p/ygW612cc9c9xXOsOZjI40ovY2LZvXf43" target="_blank"><img src="docs/launch.jpg" height="48" /></a>

The policy expects one of two roles to be set on the principal - `admin` and `user`. These roles are authorized as follows:

| Action | User     | Admin |
| ------ | -------- | ----- |
| list   | Y        | Y     |
| read   | Y        | Y     |
| create | Y        | Y     |
| update | If owner | Y     |
| delete | If owner | Y     |
