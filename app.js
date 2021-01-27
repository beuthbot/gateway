/**
 * BeuthBot Gateway
 *
 * Contributed by:
 *  - Christopher Lehmann
 *  - Timo Bruns
 *  - Lukas Danckwerth
 *
 * Version: 2.1 (01/23/2020)
 */

const dotenv = require('dotenv')
dotenv.config()

// load node.js modules
const {Service, AppConfig} = require("@bhtbot/bhtbotservice")
const Messenger = require('./app/usermessenger/messenger');
let messengerService = null;

const util = require('util')
const cors = require('cors')

const deconcentrator = require('./app/deconcentrator')
const registry = require('./app/registry')
const database = require('./app/database')

const config = new AppConfig();
config.port = 3000;
config.addMiddleWare(cors());

const app = new Service('gateway', config );

const dontKnow = [
    "Das kann ich nicht.",
    "Das weiß ich nicht.",
    "Kein Ahnung.",
    "Hier bin ich überfragt.",
    "Da bin ich überfragt.",
    "..."
]

function randomDontKnowAnswer() {
    let randomNumber = Math.floor(Math.random() * dontKnow.length)
    return dontKnow[randomNumber]
}

app.start().then(service => {

    messengerService = new Messenger(service);

    /*

    console.log('sending test message in 5 seconds')
    setTimeout(()=>{
        console.log('send message to client')

        const dennis = {
            clients: [
                {serviceName: 'discord', clientId: '185540011314249729'}
            ]
        };

        // messengerService.send(dennis, 'Test User Messenger')

        messengerService.sendFile(dennis, __dirname + '/app.js')

    }, 5000)

   */

    service.expressApp.get('/', function(req, res) {
        res.send('Hello from BeuthBot Gateway')
        res.end()
    })

    service.expressApp.post('/send', (req, res)=>{

        console.log(req)
        if(req.body.token !== process.env.USERMESSENGER_TOKEN)
            return res.send('token invalid');

        const valid = ['service', 'user', 'message'].reduce((prev, curr) => {
            if(!req.body[curr]) res.send('missing param: ' + curr);
            return prev && !!req.body[curr]
        } , true)
        if(!valid){
            return;
        }

        const result = messengerService.send({
            clients: [
                {serviceName: req.body.service, clientId: req.body.user}
            ]
        }, req.body.message)
        return res.send(result)
    })

    //todo audio route is pseudo code
    service.fileUploadEndpoint('/audio', function(req, res) {

        //todo execute async
        (()=>{

            const binaryAudio = ''; //todo: get binary

            const text = ''; //todo send to stt

            const answer = ''; //todo use common path

            const binaryResponseAudio = ''; //todo send to tts

            const user = ''; //todo get user client / service mappings

            messengerService.sendFile(user, __dirname + '/audioanswer.ogg') //todo send file answer

        }).call()

        return res.setContent('Deine Sprachnachricht wird verarbeitet...');
    })

// the route the API will call:
    service.expressApp.post('/message', function(req, res) {

        // top JSON object is our message.  see README.md for definition
        const message = req.body
        console.log('incoming message', message)

        // receive actual text of message
        const text = message.text

        // guard the existence of a valid text content
        if (!text || text.length < 1) {
            message.error = "message has no text property"
            message.answer = {
                "content": "Es tut mir leid. Es ist ein interner Fehler im Gateway aufgetreten. Die Nachricht enthält keinen Text.",
                "history": ["gateway"]
            }
            res.json(message)
            res.end();
            return
        }

        const deconcentratorMessage = {}
        deconcentratorMessage.text = text

        // deconcentratorMessage.min_confidence_score = 0.50
        deconcentratorMessage.processors = ["rasa"]
        deconcentratorMessage.history = ["gateway"]

        database.getUser(message)
            .then(function (user) {
                // console.debug("user:\n" + util.inspect(user, false, null, true) + "\n\n")
                deconcentratorMessage.user = user
                return deconcentrator.interpretate(deconcentratorMessage)
            })
            .then(function (deconcentratorResponse) {

                if (!deconcentratorResponse || !deconcentratorResponse.data) {
                    let errorMessage = message
                    errorMessage.answer = {
                        "content": "Es tut mir leid. Es ist ein interner Fehler aufgetreten. Der Deconcentrator ist nicht erreichbar.",
                        "history": ["gateway"]
                    }
                    res.json(errorMessage)
                    res.end()
                    return
                }

                const intent = deconcentratorResponse.data.intent

                // the bot didn't understand the message
                if (!intent || !intent.name) {
                    let errorMessage = message
                    errorMessage.answer = {
                        "content": randomDontKnowAnswer(),
                        "history": ["gateway"]
                    }
                    res.json(errorMessage)
                    res.end()

                    return
                }

                const registryMessage = deconcentratorResponse.data
                registryMessage.text = deconcentratorMessage.text
                registryMessage.user = deconcentratorMessage.user

                return registry.postMessage(registryMessage)

            })
            .then(function (registryResponse) {

                if (!registryResponse) {
                    console.log("no registryResponse")
                    return
                }

                if (!registryResponse.data) {
                    console.log("no registryResponse.data")
                    let errorMessage = message
                    errorMessage.answer = {
                        "content": "Es tut mir leid. Es ist ein interner Fehler aufgetreten. Die Registry ist nicht erreichbar.",
                        "history": ["gateway"]
                    }
                    res.json(errorMessage)
                    res.end()
                    return
                }

                const registryAnswer = registryResponse.data

                console.debug("registryAnswer:\n" + util.inspect(registryAnswer, false, null, true) + "\n\n")

                if (registryAnswer.answer && registryAnswer.answer.history) {
                    registryAnswer.answer.history.push('gateway')
                }

                res.json(registryAnswer)
                res.end()

            })
            .catch(function (error) {
                console.log(error)
                let errorMessage = message
                errorMessage.error = String(error)
                errorMessage.answer = {
                    "content": "Es tut mir leid. Es ist ein interner Fehler im Gateway aufgetreten.",
                    "history": ["gateway"]
                }
                res.json(errorMessage)
                res.end();
            })
    })

})

