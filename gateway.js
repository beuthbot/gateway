// BeuthBot [Gateway]
// contributed by Christopher Lehmann and Timo Bruns
// v 2.1 - 01/23/2020

/**
* Doc:		Each message [req.body.data.message] contains e.g. "text" and a "chat" object, which has an "id" that is the chat id.
* Bot:		<bot> | 123456789:ABCdEFGhiJKlmno1pqRs2tuv3W4XYzabCd5 [sample token]
* URL:		"https://api.telegram.org/bot<API_token>/sendMessage" [reply]
* cURL:		curl -F "url=https://my-telegram-bot.beuthbot.now.sh/message-in" https://api.telegram.org/bot916877791:AAEcIVYenYLjbjt7xzAr4fan6SlDIxzlDz4/setWebhook
* Deploy:	https://zeit.co/beuthbot | https://zeit.co/beuthbot/my-telegram-bot/piw9yrfez [ZEIT | <now>]
*/

// references: https://www.sohamkamani.com/blog/2016/09/21/making-a-telegram-bot/ | https://docs.microsoft.com/de-de/azure/javascript/

// load modules (node.js):
const axios = require('axios')
const util = require('util')
var express = require('express')
var bodyParser = require('body-parser')

var app = express() // express

app.use(bodyParser.json()) // for parsing application/json
app.use(
	bodyParser.urlencoded({
		extended: true
	})
) // for parsing application/x-www-form-urlencoded

// the route the API will call:
app.post('/message-in', function(req, res) {
	const message = req.body.data.message // message object

	if (!message || message.text.length < 1) { // if message is not present or message text is empty
		return res.end() // return empty response
	}
	

	// step one: send to deconcentrator, hope for the best.
	axios
	.post(
		process.env.DECONCENTRATOR_ENDPOINT,
		{
			"payload": {
				"type": "text",
				"data": Buffer.from(message.text).toString('base64')
			},
			"args": [],
			"kwargs": {
				"sync": true, // causes the request to be processed in-sync (instead of async). 
				// "callback": "some-url", // can be used to push state upon progress (most useful in async mode)
				"confidence_score": 0.8 // minimum score to reach, if possible. useful if multiple endpoints available
			},
			"strategy": "objectivesstrategiesnlu_score"
		}
	)
	
	.catch(function (error) {
		console.error(error)
	})
	
	.then(function (deconResponse) { 
		// step two: forward to registry
		intent = deconResponse.data.jobs[0].results[0].payload.intent.name
		confidence = deconResponse.data.jobs[0].results[0].payload.intent.confidence
		message_out = "[" + message.chat.id + "]: " + "Your intent: " + intent + ", confidence: " + confidence + "."
		console.debug(message_out)

		axios.post(
			process.env.REGISTRY_ENDPOINT,
			deconResponse.data.jobs[0].results[0].payload
		)
		.catch(function(error) {
			console.error(error)
		})
		.then(function(regResponse) {
			// step three: build answer to send back to the bot
//			console.debug(util.inspect(regResponse, false, null, true))
			console.debug(regResponse.data.answer)
			regResponse.data.answer.history.push('gateway')
			res.json(regResponse.data.answer)
			res.end()
		})
	})
})

app.listen(3000, function() {
	console.log('Gateway app listening on port 3000!')
})
