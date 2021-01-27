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

There is just one url you can post a message to.
```http
POST http://<YOUR_GATEWAY_URL>:3000/message
```



### Request Body

```json
{
   "text": "Wie wird das Wetter morgen?",
   "telegramId": 12345,
   ...
}
```

| Property     | Type                 | About                                     |
| ------------ | -------------------- | ----------------------------------------- |
| text         | `String`             | The actual text for the bot.              |
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
