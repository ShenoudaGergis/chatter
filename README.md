### Chat application
<hr />

#### Features
- Create a new channel with a member name
- Join an existing channel with a member name
- See a list of channel members connected at that moment
- Logout manually or automatically when being idle for 5 mins
- Can see who send a message whoever you or other one
- Listen a sound when a message is arrived
- Listen a sound when you join a channel
- See which member `is typing now`

#### Technicals
- The application is inspired by pusher.js in which a user get an ID and then try to join a channel listening to events
- I created a simple `socket protocol` where there is a known tags between the sender and the reciever
- I use `ws` package from npm to create the `web socket server`
- I use the native javascript `WebSocket` for client communication

#### How to use
- Run the server by the following command `node initiate.js`
- Open a browser new tab and open `page.html` file


