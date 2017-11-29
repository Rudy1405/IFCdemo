"use strict";
const User = require('./app_api/models/user');
const Files = require('./app_api/models/files');
const mailgun = require('./app_api/config/mailgun');
const moment = require('moment');

var monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

//Se deben llenar los clientes con accountantid para probar esta función.
exports.createFiles = function(){
    let year = moment().year().toString();
    let month = monthName[moment().month()];

    User.find({role : 'Client'}, function(err, clients){
        clients.forEach(function(client){

            let files = new Files({
                clientId : client._id,
                accountantId : client.userType.client.accountantId,
                year : year,
                month : month
            });
            // client.userType.client.accountantId

            files.save(function(err, newfiles){
                if(err) console.log(err);
                //let message = {
                  //  subject : "IFC Recordatorio",
                 //   message : `${client.userType.client.distinctive} ${client.profile.name} ${client.profile.lastname}:
                 //   Le recordamos que debe subir sus archivos del mes de ${month}`
                //}
                //mailgun.sendEmail(client.email, message);
                console.log(JSON.stringify(newfiles));
            });
        });
    });
};

exports.notifyClients = function(){
    let year = moment().year().toString();
    let month = monthName[moment().month()];

    Files.find({})
         .where('month').equals(month)
         .where('year').equals(year)
         .exec(function(err, files){
             files.forEach(function(file){
                 if(file.filesClient.length < 1){
                     User.findById(files.clientId, function(err, client){
                         if(err) console.log(err);
                         //let message = {
                           //  subject : "IFC Recordatorio",
                             //message : `${client.userType.client.distinctive} ${client.profile.name} ${client.profile.lastname}:
                             //Le recordamos que queda solo un día para subir sus archivos del mes de ${month}`
                         //}
                         //mailgun.sendEmail(client.email, message);
                     });
                 }
             });
         });
};

exports.notifyAccountants = function(){
    let year = moment().year().toString();
    let month = monthName[moment().month()];

    Files.find({})
         .where('month').equals(month)
         .where('year').equals(year)
         .exec(function(err, files){
             files.forEach(function(file){
                 if(file.filesClient.length < 1){
                     User.findById(files.accountantId, function(err, accountant){
                         if(err) console.log(err);
                         User.findById(files.clientId, function(err, client){
                             if(err) console.log(err);
                             let message = {
                                subject : 'IFC Mensaje',
                                message : `Este correo es para avisar que el cliente ${client.profile.name} ${client.profile.lastname}
                                no ha subido sus archivos aún`
                            }
                            mailgun.sendEmail(accountant.email, message);
                         });
                     });
                 }
             });
         });
};
