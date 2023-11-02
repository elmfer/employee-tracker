const database = require('./config/connection')

database.sync( { force: true } );