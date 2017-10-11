var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
 //Va récupérer la variable d'environnement de Azure ou prendre le 3978 si il n'y est pas
server.listen(process.env.port || 3978, function(){
    console.log(`server name:${server.name} | server url: ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, function(session){

    //bot.on('typing', function(){
    //    session.send(`haha t'es en train d'ecrire! :)`);
    //});

    var userMessage = session.message.text;
    if (userMessage == "doheavywork"){
        session.send(`work is done!`);
    }


    //session.send(`OK, ca fonctionne !! | [Message.length = ${session.message.text.length}]`);
    //session.send(`DialogData = ${JSON.stringify(session.dialogData)}`);
    //session.send(`Session = ${JSON.stringify(session.sessionState)}`);
});