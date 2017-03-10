var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request');  
var app = express();


var started=false;

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

// Server frontpage
//http://www.flickr.com/services/feeds/photos_public.gne?tags=soccer&format=json&jsoncallback=?
app.get('/', function (req, res) {   
   		request({
			url: 'http://www.flickr.com/services/feeds/photos_public.gne?tags=soccer&format=json&jsoncallback=?',
			method: 'GET'
		}, function(error, response, body) {
		
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
			var response = '{ "title": "Recent Uploads tagged soccer", "link": "http:\/\/www.flickr.com\/photos\/tags\/soccer\/", "description": ""}';//JSON.stringify(body);
			var arr =JSON.parse(response);
			//console.log(response);
			res.send(arr.title);
		}
		});
  // res.send('Test Bot');
});

// Facebook Webhook

app.get('/webhook', function (req, res) {  
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token supplied');
    }
});

app.post('/webhook', function (req, res) { 
	if(!started){
		//welcomeUser();
		//curl -X GET "https://graph.facebook.com/v2.6/<USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=PAGE_ACCESS_TOKEN" 
	}
	
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
		/*
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
		*/
		/*
		if (event.message && event.message.text) {  
			if (!kittenMessage(event.sender.id, event.message.text)) {
				sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
			}
		}
		*/
				
		if (event.message && event.message.text) {  
			if (!welcomeMessage(event.sender.id, event.message.text)) {
				if (!kittenMessage(event.sender.id, event.message.text)) {
					sendMessage(event.sender.id, {text: "" + event.message.text});
				}
			}
			
		} else if (event.postback) {
			console.log("Postback received: " + JSON.stringify(event.postback));
		}
				
    }
    res.sendStatus(200);
});


// generic function sending messages
function sendMessage(recipientId, message) {  
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


function kittenMessage(recipientId, text) {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {
            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);
			
			
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
        }
    }

    return false;

};


function welcomeMessage(recipientId, text) {
	text = text || "";
    var values = text.split(' ');

    if (values.length === 2 && values[0] === 'get' && values[1] === 'started') {
			
			request({
			url: 'https://graph.facebook.com/v2.6/'+recipientId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAJeiL9sIu4BANZAqkGafoMRa660rcdg9ViRLX75IFSvkZAZBe2TbgrSrdO2p5bt6psRcbNlrWSRu9GJOWXe9KdrjoB9LGznZASNP1AqWmjYKVeYHZCSjNcdxrtng8kwUk5BInXUsNKoYkfOE4ZCS5WRt0xdiLqb8a3j9zfIug5gZDZD',
			method: 'GET'
		}, function(error, response, body) {
		
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
			var response =JSON.stringify(body);
			var arr =JSON.parse(response);
			console.log(arr);
				//var surname = response.first_name; 
				 //sendMessage(recipientId, arr+"");
			
			     message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": arr,
                            "buttons": [{
								"type": "postback",
                                "title": "Let's Go",
                                "payload": "start_me",
                                }, {
                                "type": "postback",
                                "title": "About",
                                "payload": "about_me",
                                }, {
								"title": "Help",
                                "type": "postback",
                                "payload": "help_me",
                            }]
                        }]
                    }
                }
            };
			
			sendMessage(recipientId, message);
            return true;		
		}
		});
			
       
    }

    return false;
};


