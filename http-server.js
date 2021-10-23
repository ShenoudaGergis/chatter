let express = require("express");
let app     = express();
let path    = require("path");

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

module.exports = app;