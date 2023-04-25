
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', { 
    userNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('open', function (err: any) {
    if (err) {
        console.log('Failed to connect database');
    } else {
        console.log('Database is connected');
    }
})