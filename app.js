const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
const helmet = require('helmet');
const CronJob = require('cron').CronJob;
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const config = require('./app_api/config/main');
const passport = require('passport');
var multipart = require('connect-multiparty');
const socketEvents = require('./socketEvents');
const apiRoutes = require('./app_api/routes/index');
module.exports.PathServer = __dirname;

mongoose.connect(config.database);

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(logger('dev'));
app.use(helmet());
app.use(passport.initialize());
app.use(multipart({
    uploadDir: config.uploads
}));

app.use('/', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/api', apiRoutes);



const server = app.listen(port);
console.log(`Listening in port: ${port}`);

const io = require('socket.io').listen(server);
socketEvents(io);


const ctrlCronJobs = require('./cronjobs');
var firstCron = new CronJob('0 0 5 1 * *', ctrlCronJobs.createFiles, function(){
    console.log('CronJob createFiles, finalizado correctamente');
});

var secondCron = new CronJob('0 0 5 4 * *', ctrlCronJobs.notifyClients, function(){
    console.log('CronJob notifyClients, finalizado correctamente');
});

var thirdCron = new CronJob('0 0 5 6 * *', ctrlCronJobs.notifyAccountants, function(){
    console.log('CronJob notifyAccountants, finalizado correctamente');
});

var fourthCron = new CronJob('0 0 5 19 * *', function(){
    //El sistema manda copia de las declaraciones de los contadores a los clientes
}, function(){});

//firstCron.start();
//secondCron.start();
//thirdCron.start();
//fourthCron.start();

//ctrlCronJobs.createFiles();
//ctrlCronJobs.notifyClients();