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


var bot = new builder.UniversalBot(connector, [
    function(session){
        session.send(`Bienvenue das le bot Résa!`);
        session.beginDialog('mainMenu');
        //session.beginDialog('greetings');
    }
]);

var menuItems = {
    "Ask Name": {
        item: "askName"
    },
    "Reservation": {
        item: "reservation"
    }
}

bot.dialog('mainMenu', [
    function (session) {
        builder.Prompts.choice(session, `Menu principal: `, menuItems, { listStyle: 3 });
    },
    function(session, results) {
        if(results.response) {
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
])
.triggerAction({
    matches: /^main menu$/i,
    confirmPrompt: "Vous allez perdre la progression actuelle. En êtes-vous sûr?"
});

bot.dialog('askName', [
    function (session) {
        builder.Prompts.text(session, `Comment vous appelez-vous?`);
    },
    function (session, results) {
        var nom = results.response;
        session.userData.nom = nom;
        session.endDialogWithResult(results);
        session.beginDialog('greetings');
    }
]);


bot.dialog('greetings', [
    function (session){
        session.send(`Bonjour ${session.userData.nom} .`);
        session.beginDialog('reservation');
    },
    function (session, results){
        session.send(`Très bien ${session.userData.nom}, la réservation est confirmée.`);
        session.send(`Récapitulatif: <br/>Date: ${session.userData.resaDate} <br/>Nombre de personnes: ${session.userData.combien} <br/>Au nom de: ${session.userData.resaNom}`);
        session.send(`Un message de confirmation a été envoyé au numéro: ${session.userData.resaNum}`);
        session.send(`Bon appétit!`);
    }
]);
    

var tablesResas = {
    "Table pour 2": {
        item: "Table pour 2"
    },
    "Table pour 4": {
        item: "Table pour 4"
    },
    "Table pour 6": {
        item: "Table pour 6"
    },
    "Table pour 8": {
        item: "Table pour 8"
    },
    "Table pour 10": {
        item: "Table pour 10"
    }
}

bot.dialog('reservation', [
    function (session) {
        builder.Prompts.text(session, `Pour quelle date souhaitez-vous réserver?`);
    },
    function (session, results) {
        var resaDate = results.response;
        session.userData.resaDate = resaDate;
        builder.Prompts.choice(session, `Tables disponibles: `, tablesResas, { listStyle: 3 });
    },
    function (session, results) {
        if(results.response) {
            var combien = tablesResas[results.response.entity].item;
        }
        session.userData.combien = combien;
        builder.Prompts.text(session, `Je met la réservation au nom de?`);
    },
    function(session, results) {
        var resaNom = results.response;
        session.userData.resaNom = resaNom;
        builder.Prompts.text(session, `Afin de confirmer la réservation, veuillez saisir votre numéro de téléphone`);
    },
    function (session, results) {
        var resaNum = results.response;
        session.userData.resaNum = resaNum;
        session.endDialog();
    }
])
.reloadAction(
    "restartReservation", "Ok recommençons depuis le début.",
    {
        matches: /^start over$/i,
        confirmPrompt: "Cela va annuler la commande actuelle. En êtes-vous sûr?"
    }
)
.cancelAction(
    "cancelReservation", "Ecrivez 'Main Menu' pour continuer.",
    {
        matches: /^cancel$/i,
        confirmPrompt: "Cela va annuler la commande actuelle. En êtes-vous sûr?"
    }
);