// Beuthbot [Gateway]
// contributed by Christopher Lehmann and Timo Bruns
// v 1.0 - 01/12/2020

/**
* Doc:		Each message contains "text" and a "chat" object, which has an "id" which is the chat id.
* Bot:		cbeuthbot | 916877791:AAEcIVYenYLjbjt7xzAr4fan6SlDIxzlDz4
* URL:		"https://api.telegram.org/bot<API_token>/sendMessage"
* cURL:		curl -F "url=https://my-telegram-bot.beuthbot.now.sh/message-in" https://api.telegram.org/bot916877791:AAEcIVYenYLjbjt7xzAr4fan6SlDIxzlDz4/setWebhook
* Deploy:	https://zeit.co/beuthbot | https://zeit.co/beuthbot/my-telegram-bot/piw9yrfez [ZEIT | <now>]
*/

// references: https://www.sohamkamani.com/blog/2016/09/21/making-a-telegram-bot/ | https://docs.microsoft.com/de-de/azure/javascript/

// load modules (node.js):
const axios = require('axios')
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
	const { message } = req.body // message object

	if (!message || message.text.length < 1) { // if message is not present or message text is empty
		return res.end() // return empty response
	}

	const options = { // options object (especially headers for POST)
		headers: {
			'Host': 'northeurope.api.cognitive.microsoft.com',
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key': '54dbb69669be4638b704460c96e8c8f3'
		}
	}

	axios
	.post( // POST -> Microsoft Azure - Cognitive Services | NLU | (Response = json[entities, content, score, ...])
		'https://northeurope.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment',
		{
			"documents": [{
				"language": "en",
				"id": message.chat.id,
				"text": message.text
			}]
		}, options
	)
	
	.then(function (response) {
		message_out = "[" + message.chat.id + "]: " + "Hi, your score is " + response.data.documents[0].score + "."
		
		axios
		.post( // nested chat answer to avoid missing Azure response
			'https://api.telegram.org/bot916877791:AAEcIVYenYLjbjt7xzAr4fan6SlDIxzlDz4/sendMessage',
			{
				chat_id: message.chat.id,
				text: message_out
			}
		)
		
		.then(response => { // if the message was successfully posted
			console.log('Message posted')
			res.end('ok')
		})
	})
})

// outsource code [deprecated]
// function evaluate(message) { }

// start server
app.listen(3000, function() {
	console.log('Telegram app listening on port 3000!')
})