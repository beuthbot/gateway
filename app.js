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

// load node.js modules
const {Service, AppConfig} = require("@bhtbot/bhtbotservice")

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

    service.expressApp.get('/', function(req, res) {
        res.send('Hello from BeuthBot Gateway')
        res.end()
    })


    //todo audio route is pseudo code
    service.expressApp.post('/audio', function(req, res) {

        //todo send answer first

        const binaryAudio = 'todo: get binary ';

        const text = 'todo send to stt';

        const answer = 'todo use common path';

        const binaryResponseAudio = 'todo send to tts';

        //todo give to usermessenger service
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

