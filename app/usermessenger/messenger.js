const Websocket = require('./websocket');
const fs = require('fs');
const path = require('path');

let chatbotsSocket = null;

class UserMessenger{
    constructor(gatewayService) {
        if(chatbotsSocket === null){
            chatbotsSocket = new Websocket().connect(gatewayService);
        }
    }

    send(user, message){
        this.userForeach(user, (serviceName, clientId)=>{
            console.log('send to', serviceName, clientId)
            chatbotsSocket.send(serviceName, clientId, message);
        })
    }

    sendFile(user, localFilePath){
        const file = fs.readFileSync(localFilePath);
        console.log('file', file);
        this.userForeach(user, (serviceName, clientId)=>{
            chatbotsSocket.sendFile(serviceName, clientId, path.basename(localFilePath), file);
        })
    }

    userForeach(user, func){
        const userClients = user.clients
        userClients.forEach(client=>{
            const {serviceName, clientId} = client;
            func(serviceName, clientId);
        })
    }
}

module.exports = UserMessenger;
