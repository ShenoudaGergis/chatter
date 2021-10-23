let express = require("express");
let app     = express();
let path    = require("path");
let getTCPport = require("./ports.js");

//-----------------------------------------------------------------------------

app.use(express.static("client"));

//-----------------------------------------------------------------------------

app.get("/" , (req , res , next) => {
    res.sendFile(path.join(__dirname , "client/" , "page.html"));
});

//-----------------------------------------------------------------------------

app.use((req , res , next) => {
    res.status(404).send("<h1>Error 404</h1>");
});

//-----------------------------------------------------------------------------

let port = null;
if(process.env.PORT) {
    port = Promise.resolve(process.env.PORT);
} else {
    port = getTCPport(3000);
}
port.then((port) => {
    app.listen(port , () => {
        console.log(":: http server starts :" , port);
    });
})