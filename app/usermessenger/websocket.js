const WebSocket = require('ws');
const PayloadType = require('./payloads/PayloadType');

class MyWebSocket{

    constructor() {
        this.wss = null;
        this.clients = {};
        this.keepAliveInterval = 10000;
    }

    getChatServiceClient(serviceName){
        return this.clients[serviceName];
    }

    send(serviceName, clientServiceId, message){
        const websocket = this.getChatServiceClient(serviceName);
        if(!websocket){
            throw new Error('Service Name not registered currently');
        }
        websocket.send(JSON.stringify({
            type: 'message',
            userId: clientServiceId,
            message: message
        }))
    }

    sendFile(serviceName, clientServiceId, filename, fileBuffer){
        const websocket = this.getChatServiceClient(serviceName);
        if(!websocket){
            throw new Error('Service Name not registered currently');
        }
        websocket.send(JSON.stringify({
            type: 'file',
            fileName: filename,
            userId: clientServiceId,
            binary: fileBuffer
        }))
    }

    connect(service){
        this.wss = new WebSocket.Server({ server: service.server });

        this.wss.on('connection', (ws) => {

            console.log('client connected', ws._socket.remoteAddress)

            const send = (message) => {ws.send(JSON.stringify({message}))}
            const error = (error, disconnect) => {
                ws.send(JSON.stringify({error}))
                if(disconnect){
                    delete this.clients[ws.serviceName];
                    ws.close();
                }
            }

            ws.on('message', (message) => {

                const json = JSON.parse(message);
                if(!json) {
                    return error('request must be json object')
                }

                ws.lastKeepAliveAnswer = (new Date()).getTime();

                console.log('client message', message)

                if(json.type === PayloadType.RegisterClientAtService){
                    if(!json.name) return error('name must be defined')
                    if(this.clients[json.name]) return error('service already registered', true)
                    this.clients[json.name] = ws;
                    ws.serviceName = json.name;
                    console.log('registered client', json.name);
                    return send('Welcome')
                }

                else{
                    //log the received message and send it back to the client
                    console.log('received from %s: %s', ws.serviceName, message);
                }
            });

            ws.on('close', () => {
                console.log('websocket for service ' + ws.serviceName + ' disconnected');
                clearTimeout(ws.keepAliveTimeout);
                delete this.clients[ws.serviceName];
            });

            this.keepAlive(ws);

            //send immediatly a feedback to the incoming connection
            ws.send('Hi there, I am a WebSocket server');
        });

        return this;
    }

    keepAlive(websocket){

        if(websocket.lastKeepAliveQuery === undefined){
            websocket.lastKeepAliveQuery = (new Date()).getTime();
        }
        if(websocket.lastKeepAliveAnswer === undefined){
            websocket.lastKeepAliveAnswer = (new Date()).getTime();
        }

        const timeSinceQuery = (new Date().getTime()) - websocket.lastKeepAliveQuery;
        const timeSinceAnswer = (new Date().getTime()) - websocket.lastKeepAliveAnswer;

        if(timeSinceAnswer > this.keepAliveInterval){

            if(timeSinceQuery >= timeSinceAnswer){
                console.log('asking for keepAlive ' + websocket.serviceName)
                websocket.lastKeepAliveQuery = (new Date()).getTime();
                websocket.send(JSON.stringify({keepAlive:true}));
                websocket.keepAliveTimeout = setTimeout(()=>this.keepAlive(websocket), this.keepAliveInterval);
            }
            else{
                console.log('no keep alive, removing ' + websocket.serviceName)
                delete this.clients[websocket.serviceName];
                websocket.close()
            }
        }
        else{
            websocket.keepAliveTimeout = setTimeout(()=>this.keepAlive(websocket), this.keepAliveInterval);
        }
    }
}

module.exports = MyWebSocket;
