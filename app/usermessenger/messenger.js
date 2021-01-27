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
        const result = [];
        this.userForeach(user, (serviceName, clientId)=>{
            const resultData = {
                success: false,
                serviceName: serviceName,
                clientId: clientId
            };
            console.log('send to', serviceName, clientId)
            try{
                chatbotsSocket.send(serviceName, clientId, message);
                result.push(Object.assign(resultData, {success: true}));
            }
            catch (e){
                result.push(Object.assign(resultData, {error: e.message}));
            }
        })
        return result;
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
