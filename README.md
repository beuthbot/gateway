# gateway

![Icon](.documentation/Icon100.png "Icon")

BeuthBot Gateway written in JavaScript. The Gateway is the central endpoint for client bots to communicate with the BeuthBot.

## Contents

* [Getting Startet](#Getting-Startet)
* [API](#API)
  * [Request Body](#Request-Body)
  * [Response](#Response)
  * [`curl` Example](#curl-Example)
* [Dot Env](#Dot-Env)



### Functionality

![function](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/beuthbot/gateway/master/.documentation/uml/function.txt)




## API

### Messages
Test communication is done by /message endpoint
```http
POST http://<YOUR_GATEWAY_URL>:3000/message
```
### Voice
Voice messages are sent to /audio endpoint
```http
POST http://<YOUR_GATEWAY_URL>:3000/audio
```

Voice messages also require having a websocket connection to the gateway, since voice answer will be sent asynchronously due to potentially high response times.

### Websocket
Asynchronous communication with clients is done by websocket connections. Each Chat-Bot-Client is required to have a websocket connection for this purpose.

Chat Bot Clients are registered with unique service-Ids and the database user-service stores mapped data of those service and user-ids. 

Websocket Connection is handled in [websocket.js](./gateway/app/usermessenger/websocket.js) - thats where discord, telegram and friends are connected to.

Messages can then be sent to Service-Users using the messenger interface at [messenger.js](./gateway/app/usermessenger/messenger.js)

### Send Asynchronous Message to Chatbot Client
For Accessing the "User Messenger" holding Websocket connections to the Chatbot Clients like telegram or discord there's another REST endpoint callable at
```http
POST http://<YOUR_GATEWAY_URL>:3000/send
```
This endpoint is secured by a token since it's meant for internal service use rather than public use. The token must be set by [.env](./.env.sample) and shared with services in need

One service implementing asynchronous messages is [Reminder Service](https://github.com/beuthbot/reminder_microservice), sending asynchronous reminders by cronjob



### Request Body

The request body differs for every messenger type. It might contain the following

| Property     | Type                 | About                                     |
| ------------ | -------------------- | ----------------------------------------- |
| text         | `String`             | The actual text for the bot.              |
| serviceId   | `String` (optional) | The name of the chatbot service (for example telegram, discord, ..)              |
| serviceUserId   | `String` (optional) | chatbot service specific user id              |
| nickname     | `String` (optional)  | A possible nickname of the user.          |
| firstName    | `String` (optional)  | A possible first name of the user.        |
| lastName     | `String` (optional)  | A possible last name of the user.         |
| clientDate   | `Timestamp` (option) | The current date of the client app / bot. |
| clientSecret | `String` (optional)  | The client's api key.                     |

#### Request to the database-service

Before sending the request to the database-service, the gateway will filter the message to transform the id-information from the message into the folling format:

| Property     | Type                 | About                                     |
| ------------ | -------------------- | ----------------------------------------- |
| id           | `Integer` (optional) | The id of the user.                       |
| messenger    | `String` (optional)  | the messenger of the user.                |

The specific information from the different messengers, like firstName and lastName from telegram, are not removed in this process.
As a result, the sended template of a telegram message looks like this:

| Property     | Type                 | About                                     |
| ------------ | -------------------- | ----------------------------------------- |
| text         | `String`             | The actual text for the bot.              |
| id           | `Integer` (optional) | The id of the user.                       |
| messenger    | `String` (optional)  | the messenger of the user.                |
| telegramId   | `Integer` (optional) | The telegram id of the user.              |
| nickname     | `String` (optional)  | A possible nickname of the user.          |
| firstName    | `String` (optional)  | A possible first name of the user.        |
| lastName     | `String` (optional)  | A possible last name of the user.         |
| clientDate   | `Timestamp` (option) | The current date of the client app / bot. |
| clientSecret | `String` (optional)  | The client's api key.                     |





Whereas everything except of the `text` property is optional. So at a bare minimum a body of a request could looks like the following.

```json
{ "text": "Wie wird das Wetter morgen?" }
```
> Sending a message like this the bot won't have much information about a context like with whom he is chatting or e.g. the date of the client application. Thus he won't give a good answer.



### Response

```json
{
   "text": "Wie wird das Wetter morgen?",
   "answer" : {
      "content" : "Morgen gibt es Sonnenschein bei 29 Grad.",
      "history" : ["gateway", "registry", "weather-microservice"]
   },
   ...
}
```

| Property       | Type                | About                                                        |
| -------------- | ------------------- | ------------------------------------------------------------ |
| text           | `String`            | The actual text for the bot.                                 |
| answer.content | `String` (optional) | The answer of the bot.                                       |
| answer.history | `Array<String>` (optional) | A trace of the services the message passed till the <br>answer. |



### `curl` Example



```shell
curl http://localhost:3000/message \
    -X POST \
    -H "Content-Type: application/json" \
    --data "{\"text\":\"Wie wird das Wetter morgen?\"}"
```



## Dot Env

The `.env` file of the gateway needs to specify the URLs of the endpoints of the deconcentrator and of the registry. The default port for the deconcentrator is `8338` and for the registry is `9922`. You may edit it dependant on you needs.

```dotenv
DECONCENTRATOR_ENDPOINT=http://0.0.0.0:8338/message
REGISTRY_ENDPOINT=http://host.docker.internal:9922/get-response
DATABASE_ENDPOINT=http://host.docker.internal:27000
```
