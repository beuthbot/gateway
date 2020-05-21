# gateway
BeuthBot Gateway written in JavaScript. The Gateway is the
central endpoint for client bots to communicate with the 
BeuthBot.

# API
There is just one url you can post a message against:
```shell script
POST http://<YOUR_GATEWAY_URL>:3000/message
```

## `Message` - Request Model
```json
{
  "message_id": 1006,
  "from":
    {
      "first_name": "Alan",
      "last_name": "Turing",
      "nickname": "Al"
    },
  "chat":
    {
      "first_name": "Alan",
      "last_name": "Turing",
      "nickname": "Al"
    },
  "date": 1590059247,
  "text": "Wie wird das Wetter morgen?",
  "client_language": "de",
  "client_secret": "1a2b3c4e5g6h7i8j9k0l1a2b3c4e5g6h7i8j9k0l"
}
```
Whereas everything except of the `text` property is optional. So at
a bare minimum a body of a request could looks like:
```json
{
  "text": "Wie wird das Wetter morgen?"
}
```
Sending a message like this the bot won't have much information about
a context like with whom he is chatting or e.g. the date of the
client application. Thus he won't give a good answer.

## `Answer` - Response Model
```json
{
  "message_id": 1006,
  "from":
    {
      "first_name": "Alan",
      "last_name": "Turing",
      "nickname": "Al"
    },
  "chat":
    {
      "first_name": "Alan",
      "last_name": "Turing",
      "nickname": "Al"
    },
  "date": 1590059247,
  "text": "Wie wird das Wetter morgen?",
  "answer":
    {
      "content" : "Morgen gibt es Sonnenschein bei 29 Grad.",
      "history" : ["WeatherService", "registry", "gateway"]
    }
}
```

# `.env` - Environment
The `.env` file of the gateway needs to specify the URLs of the
endpoints of the deconcentrator and of the registry. The default
port for the deconcentrator is `8338` and for the registry is `9922`.
You may edit it dependant on you needs. Have alook

```dotenv
DECONCENTRATOR_ENDPOINT=http://0.0.0.0:8338/message
REGISTRY_ENDPOINT=http://host.docker.internal:9922/get-response
```