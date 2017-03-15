var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request'); 

var querystring = require('querystring');
var http = require('http');
var fs = require('fs'); 
var app = express();


var started=false;
var backurl="http://surrogation.com.ng/surrogateapp/";

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

app.get('/', function (req, res) {   	
		res.send('Test Bot');
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
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
		addPersistentMenu();
        var event = events[i];						
		if (event.message && event.message.text) {
				var text = event.message.text;
				text = text || "";
				var values = text.split(' ');
				if (values.length === 2 && values[0] === 'get' && values[1] === 'started') {
					welcomeUser(event.sender.id);
				}else{
					sendMessage(event.sender.id, {text: "" + event.message.text});
				}
			
		} else if (event.postback) {
			var reply = JSON.stringify(event.postback);
			reply = JSON.parse(reply);
			if(reply.payload=="help_me"){
				help(event.sender.id);
			}else if(reply.payload=="about_me"){
				about(event.sender.id);
			}
			 continue;
			//console.log("Postback received: " + JSON.stringify(event.postback));
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


function displayWelcomeMessage(recipientId) {
			message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Surrogate app helps lets you get help or render help on various subject matters",
                            "buttons": [{
								"type": "postback",
                                "title": "Get Started",
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

    return false;
};


function welcomeUser(recipientId) {

		request({
			url: 'https://graph.facebook.com/v2.6/'+recipientId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
			method: 'GET'
		}, function(error, response, body) {
		
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
			var response =JSON.stringify(body);
			var reply = JSON.parse(response);
			/*
			var post_data = querystring.stringify({
				'facebook_id' : recipientId,
				'name':reply.first_name
			});
			*/			
			
			//submitForm(post_data,backurl+"users/add");
			
			     message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "started",
                            "buttons": [{
								"type": "postback",
                                "title": "Get Started",
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
			
    return true;
};


function about(recipientId) {
			     message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "About message",
                            "buttons": [{
								"type": "postback",
                                "title": "I got it!",
                                "payload": "quit_help_about",
                                }]
                        }]
                    }
                }
            };
			
			sendMessage(recipientId, message);
            return true;		
};


function help(recipientId) {
			message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "You can get help here",
                            "buttons": [{
								"type": "postback",
                                "title": "I got it!",
                                "payload": "quit_help_about",
                                }]
                        }]
                    }
                }
            };
			
			sendMessage(recipientId, message);
			
            return false;		
};

function addPersistentMenu(){
 request({
    url: 'https://graph.facebook.com/v2.6/me/thread_settings',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json:{
        setting_type : "call_to_actions",
        thread_state : "existing_thread",
        call_to_actions:[
            {
              type:"postback",
              title:"Home",
              payload:"home"
            },
            {
              type:"postback",
              title:"Assignments",
              payload:"assignment_solutions"
            },
            {
              type:"postback",
              title:"Class reminder",
              payload:"set_class_reminder"
            },
			{
              type:"postback",
              title:"My expertise",
              payload:"my_expsertise"
            }
          ]
    }

}, function(error, response, body) {
    console.log(response)
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
})

}

function showMenu(){
  var menu =  {
  "setting_type" : "call_to_actions",
  "thread_state" : "existing_thread",
  "call_to_actions":[
    {
      "type":"postback",
      "title":"Help",
      "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_HELP"
    },
    {
      "type":"postback",
      "title":"Start a New Order",
      "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_START_ORDER"
    },
    {
      "type":"web_url",
      "title":"Checkout",
      "url":"http://petersapparel.parseapp.com/checkout",
      "webview_height_ratio": "full",
      "messenger_extensions": true
    },
    {
      "type":"web_url",
      "title":"View Website",
      "url":"http://petersapparel.parseapp.com/"
    }
  ]
};
	
	request({
        url: 'https://graph.facebook.com/v2.6/me/thread_settings',
        method: 'POST',		
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        json: menu
    }, function(error, response, body) {
        console.log(body);
    });
}


function submitForm(post_data,url){
		request({
			url: url,
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
		
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
			console.log(body);//res.send(body);
		}
		});
}