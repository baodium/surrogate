var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request'); 

var querystring = require('querystring');
var http = require('http');
var fs = require('fs'); 
var app = express();


var started=false;
var backurl="http://surrogation.com.ng/surrogateapp/";
var senderContext = {};

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
	getStarted();
	addPersistentMenu();
	var helprequest = false;
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {		
        var event = events[i];						
		if (event.message && event.message.text) {
			 if(senderContext[event.sender.id]!=null){
				if(senderContext[event.sender.id].state === "provide_subject"){					
					checkHelper(event.message.text,event.sender.id);									
				}else if(senderContext[event.sender.id].state === "type_expertise"){
					var subject = event.message.text;
					senderContext[event.sender.id].subject = subject;
					var post_data = querystring.stringify({
						'facebook_id' : event.sender.id,
						'subject':subject,
						'status':'pending'
					});					
					submitForm(post_data,backurl+"expertise/add",event.sender.id,"type_expertise");															
				}else{
					sendMessage(event.sender.id, {text: "" + "Sorry, I don't understand that. Anyway, this is what I have on my menu"});
					showMenu(event.sender.id);
				}
			 }else{
				welcomeUser(event.sender.id);
			 }
		} else if (event.postback) {
			var reply = JSON.stringify(event.postback);
			reply = JSON.parse(reply);
			if(reply.payload=="get_started_button"){
				welcomeUser(event.sender.id);
			}else if(reply.payload=="help_me"){
				help(event.sender.id);
			}else if(reply.payload=="about_me"){
				about(event.sender.id);
			}else if(reply.payload=="get_assignment_help"){
				sendMessage(event.sender.id, {text: "which subject do you need help on?"});
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].state = "provide_subject";
				}
			}else if(reply.payload=="set_expertise" || (reply.payload=="postback_yes" && senderContext[event.sender.id]!=null && senderContext[event.sender.id].state == "expertise_saved" )){
				sendMessage(event.sender.id, {text: "Please type the subject you are expert in"});
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].state = "type_expertise";
				}
			}else if(reply.payload=="professional_expertise_level" || reply.payload=="intermediate_expertise_level" || reply.payload=="amateur_expertise_level"){					
					subject = senderContext[event.sender.id].subject;
					var post_data = querystring.stringify({
						'status':'completed',
						'level':reply.payload,
						'facebook_id' : event.sender.id,
						'subject':subject
					});
								
				submitForm(post_data,backurl+"expertise/update",event.sender.id,"update_expertise");
			}else if(reply.payload=="postback_no"){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Okay then. This is what I have on my menu"});
					showMenu(event.sender.id);
				}
			}else if(reply.payload=="my_expertise"){
				showExpertise(event.sender.id);
			}else if(reply.payload=="next_expertise"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].next++;
					showExpertise(event.sender.id);
				}
			}else if(reply.payload=="previous_expertise"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].next--;
					showExpertise(event.sender.id);
				}
			/*}else if(reply.payload.indexOf("delete_expertise")>-1){
				sendMessage(event.sender.id, {text: reply.payload});
				/*
				var expertise_id = reply.payload.split("-");
				 expertise_id = expertise_id[1];
				 removeExpertise(event.sender.id,expertise_id);
				 
			}*/else{
				sendMessage(event.sender.id, {text: reply.payload});
			}
			
			 continue;
		}
				
    }
    res.sendStatus(200);
});


// generic function sending messages
function sendMessage(recipientId, message) {  
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
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


function checkHelper(subject,senderId){
	
	var post_data = querystring.stringify({'facebook_id_not' : senderId,'subject':subject});	
	request({
			url: backurl+"expertise/getwherenot",
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
			sendMessage(senderId, {text: "" + JSON.stringify(body)});
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{
				output = JSON.parse(body);	

					if(output.length>0){
							sendMessage(senderId, {text: "Oh! that is nice we have people that can help you with "+subject});
							//getExpertiseList(output,event.sender.id);
							senderContext[senderId].state = "provide_subject_done";	
						/*
						
					for(i = 0; i<output.length; i++){
						console.log(output[i].subject);
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}
						elementss[i+1]={
									"title": output[i].subject,                   
									"subtitle": "Expertise Level:"+level,
									"buttons": [{
												"title": "Delete",
												"type": "postback",
												"payload": "delete_expertise_"+output[i].expertise_id                     
												}]
										};
				
					}
					
					 message = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
			"top_element_style": "large",
            "elements": elementss,
             "buttons": [
				{
                    "title": ((start+3)<total)?"More":(((start+3)==total)?"Close":"Previous"),
                    "type": "postback",
                    "payload":((start+3)<total)?"next_expertise":(((start+3)==total)?"postback_no":"previous_expertise")                        
                }
            ]  
        }
    }
};

sendMessage(recipientId,message);
						*/
					}else{
						sendMessage(senderId, {text: "Sorry, I dont perosnally know people with "+subject+" expertise"});
					}

			}			
		});
	
}

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
			url: 'https://graph.facebook.com/v2.8/'+recipientId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
			method: 'GET'
		}, function(error, response, body) {
		
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
			
			var bodyObject = JSON.parse(body);
			firstName = bodyObject.first_name;
			lastName = bodyObject.last_name;
			profilePic=bodyObject.profile_pic;
			locale = bodyObject.locale;
			
			senderContext[recipientId] = {};
			senderContext[recipientId].firstName = firstName;
			senderContext[recipientId].lastName = lastName;
			senderContext[recipientId].profilePic = profilePic;
			senderContext[recipientId].state = "newly_welcomed";
			senderContext[recipientId].next=0;
			
			//{"first_name":"Adedayo","last_name":"Olubunmi","profile_pic":"https:\/\/scontent.xx.fbcdn.net\/v\/t1.0-1\/180239_1589652066179_7006637_n.jpg?oh=7ca52055172d91e1c914fcd1110d17a6&oe=596F62FA","locale":"en_US","timezone":1,"gender":"male"}
			var post_data = querystring.stringify({
				'facebook_id' : recipientId,
				'name':firstName+" "+lastName,
				'profile_pic':profilePic
			});
								
			submitForm(post_data,backurl+"users/add",recipientId,"add_user");
			var msg = "Hi "+firstName+"! Surrogate bot lets you get help or render help on various subjects";			
			sendMessage(recipientId, {text: "" + msg});
			showMenu(recipientId);
            return true;		
		}
		});
			
    return true;
};


function showMenu(recipientId){
			message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "What would you like?",
                            "buttons": [{
								"type": "postback",
                                "title": "Get subject help",
                                "payload": "get_assignment_help",
                                }, {
                                "type": "postback",
                                "title": "Set class reminder",
                                "payload": "set_class_reminder",
                                }, {
								"title": "Set expertise",
                                "type": "postback",
                                "payload": "set_expertise",
                            }]
                        }]
                    }
                }
            };
			
			sendMessage(recipientId, message);
			return true;
}

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

function getExpertiseLevel(recipientId){
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Expertise level",
                            "buttons": [{
								"type": "postback",
                                "title": "Professional",
                                "payload": "professional_expertise_level",
                                },
								{
								"type": "postback",
                                "title": "Intermediate",
                                "payload": "intermediate_expertise_level",
                                },
								{
								"type": "postback",
                                "title": "Amateur",
                                "payload": "amateur_expertise_level",
                                }
								]
                        }]
                    }
                }
            };
			
			sendMessage(recipientId, message);			
            return false;		
}

function displayOption(recipientId,msg,option_type){
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": msg,
                            "buttons": [{
								"type": "postback",
                                "title": "Yes",
                                "payload": "postback_yes",
                                },
								{
								"type": "postback",
                                "title": "No",
                                "payload": "postback_no",
                                }
								]
                        }]
                    }
                }
            };			
			sendMessage(recipientId, message);			
            return false;
}

function getOut(recipientId){
		message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Exit if don't want to continue",
                            "buttons": [
								{
								"type": "postback",
                                "title": "Yes. take me out",
                                "payload": "postback_no",
                                }
								]
                        }]
                    }
                }
            };		
			sendMessage(recipientId, message);			
            return true;
}

function addPersistentMenu(){
 request({
    url: 'https://graph.facebook.com/v2.8/me/thread_settings',
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
              payload:"my_expertise"
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



function getStarted(){
		var post = {"get_started":{
						"payload":"get_started_button"
						}
					};
		var welcome = {"greeting":[{
						"locale":"default",
						"text":"Good to have you {{user_first_name}}!"
						}] 
					};		
		request({
        url: 'https://graph.facebook.com/v2.8/me/messenger_profile',
        method: 'POST',		
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        json: post
		}, function(error, response, body) {

		});
}


function submitForm(post_data,url,userId,action){
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
				var output = JSON.parse(body);
				sendMessage(userId, {text: "" + body});
				var exists = (output.status=="ok")?false:true;
				if(senderContext[userId]!=null){

						if(action=="update_expertise" && !exists){
							senderContext[userId].error = false;
							sendMessage(userId, {text: "Your expertise has been successfully saved"});
							displayOption(userId,"Do you want to add another expertise?","yes_no");
							senderContext[userId].state = "expertise_saved"; 
						}
						
						if(action == "type_expertise"){
							if(!exists){
								sendMessage(userId, {text: "Please select your expertise level in "+senderContext[userId].subject});				
								getExpertiseLevel(userId);
								senderContext[userId].state = "type_expertise_done";
							}else{
								sendMessage(userId, {text: "You have saved this expertise before. Please specify another expertise"});
								getOut(userId);								
								senderContext[userId].state = "type_expertise";
							}
						}else if(action=="show_expertise"){
								showExpertise(userId);	
						}
							
				} 
			}
		});
		return true;
}

function showExpertise(recipientId){
	var post_data = querystring.stringify({'facebook_id' : recipientId});	
	request({
			url: backurl+"expertise/get",
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
			//sendMessage(recipientId, {text: "" + JSON.stringify(body)});
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{
				output = JSON.parse(body);
				var total = output.length;
				var start =(senderContext[recipientId].next!=null)?senderContext[recipientId].next:0;
				if(total>3){
					output = output.slice((start*2), ((start*2) + 2));
				}
				elementss = new Array();
				if(total<1){
					sendMessage(recipientId, {text: "You have not added any expertise yet"});
				}else{
					elementss[0] = {
                    "title": "Expertise list",
                    "image_url": (senderContext[recipientId]!=null)?senderContext[recipientId].profilePic:"http://graph.facebook.com/"+recipientId+"/picture?width=100&height=100",
                    "subtitle": "Here's the list of your expertise"
					};
					
				
					
					for(i = 0; i<output.length; i++){
						console.log(output[i].subject);
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}
						elementss[i+1]={
									"title": output[i].subject,                   
									"subtitle": "Expertise Level:"+level,
									"buttons": [{
												"title": "Delete",
												"type": "postback",
												"payload": "delete_expertise-"+output[i].expertise_id                     
												}]
										};
				
					}
					
					 message = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
			"top_element_style": "large",
            "elements": elementss,
             "buttons": [
				{
                    "title": ((total<3)?"Close":(((start+3)<total)?"More":"previous")),//((start+3)<total)?"More":(((start+3)==total)?"Close":"Previous"),
                    "type": "postback",
                    "payload":((total<3)?"postback_no":(((start+3)<total)?"next_expertise":"previous_expertise"))//((start+3)<total)?"next_expertise":(((start+3)==total)?"postback_no":"previous_expertise")                        
                }
            ]  
        }
    }
};

sendMessage(recipientId,message);
				}
					
			}			
		});
	
}


function removeExpertise(recipient_id,expertise_id){
		var post_data = querystring.stringify({'facebook_id' : recipientId,'expertise_id':expertise_id});
		submitForm(post_data,backurl+"expertise/delete",recipient_id,"show_expertise");
}
/*
curl -X POST -H "Content-Type: application/json" -d '{
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Welcome to Peter\'s Hats",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We\'ve got the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "http://surrogation.com.ng/view?item=103",
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": "http://surrogation.com.ng/"
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersfancybrownhats.com",
                "title":"View Website"
              },{
                "type":"postback",
                "title":"Start Chatting",
                "payload":"DEVELOPER_DEFINED_PAYLOAD"
              }              
            ]      
          }
        ]
      }
    }
  }
}' "https://graph.facebook.com/v2.8/me/messages?access_token=PAGE_ACCESS_TOKEN" 




curl -X POST -H "Content-Type: application/json" -d '{
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":"What do you want to do next?",
        "buttons":[
          {
            "type":"web_url",
            "url":"https://petersapparel.parseapp.com",
            "title":"Show Website"
          },
          {
            "type":"postback",
            "title":"Start Chatting",
            "payload":"USER_DEFINED_PAYLOAD"
          }
        ]
      }
    }
  }
}' "https://graph.facebook.com/v2.8/me/messages?access_token=PAGE_ACCESS_TOKEN"
*/




function getExpertiseList(subject,recipientId){
	/*
	message = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
            "elements": [
                {
                    "title": "List of "+subject+" expert",
                    "image_url": "http://surrogation.com.ng/img/collection.png",
                    "subtitle": "Here are who we think may be helpful",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/shop_collection",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    }
                },
                {
                    "title": "Adedayo Ayodele",
                    "image_url": "http://surrogation.com.ng/img/white-t-shirt.png",
                    "subtitle": "Expert in "+subject+", Level:intermediate",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/view?item=100",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Contact Now",
                            "type": "postback",
                            "payload": "contact_expert"                    
                        }
                    ]                
                },
                {
                    "title": "Obadimu Adewale",
                    "image_url": "http://surrogation.com.ng/img/blue-t-shirt.png",
                    "subtitle": "Expert in "+subject+", Level:advanced",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/view?item=101",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Contact Now",
                            "type": "postback",
                            "payload": "contact_expert"                       
                        }
                    ]                
                },
                {
                    "title": "Ajayi crowder",
                    "image_url": "http://surrogation.com.ng/img/black-t-shirt.png",
                    "subtitle": "Expert in "+subject+" and stats, Level:beginner",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/view?item=102",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Contact Now",
                            "type": "postback",
                            "payload": "contact_expert"                      
                        }
                    ]                
                },
				 {
                    "title": "Alani crowder",
                    "image_url": "http://surrogation.com.ng/img/black-t-shirt.png",
                    "subtitle": "Expert in "+subject+" and stats, Level:beginner",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/view?item=102",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Contact Now",
                            "type": "postback",
                            "payload": "contact_expert"                      
                        }
                    ]                
                }
            ],
             "buttons": [
                {
                    "title": "View More",
                    "type": "postback",
                    "payload": "payload"                        
                }
            ]  
        }
    }   
	};*/

	
	message = {
    "attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
            "elements": [
                {
                    "title": "Classic T-Shirt Collection",
                    "image_url": "https://pbs.twimg.com/profile_images/2629833004/1f07dda7e7dcf011e96807a0f10239f9_400x400.jpeg",
                    "subtitle": "See all our colors",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "View",
                            "type": "web_url",
                            "url": "http://surrogation.com.ng/collection",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "http://surrogation.com.ng/"                        
                        }
                    ]
                },
                {
                    "title": "Classic White T-Shirt",
                    "image_url": "https://pbs.twimg.com/profile_images/2629833004/1f07dda7e7dcf011e96807a0f10239f9_400x400.jpeg",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Shop Now",
                            "type": "web_url",
                            "url": "http://surrogation.com.ng/",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "http://surrogation.com.ng/"                        
                        }
                    ]                
                },
                {
                    "title": "Classic Blue T-Shirt",
                    "image_url": "https://pbs.twimg.com/profile_images/2629833004/1f07dda7e7dcf011e96807a0f10239f9_400x400.jpeg",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Shop Now",
                            "type": "web_url",
                            "url": "http://surrogation.com.ng/",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "http://surrogation.com.ng/"                        
                        }
                    ]                
                },
                {
                    "title": "Classic Black T-Shirt",
                    "image_url": "https://pbs.twimg.com/profile_images/2629833004/1f07dda7e7dcf011e96807a0f10239f9_400x400.jpeg",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "http://surrogation.com.ng/",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "http://surrogation.com.ng/"
                    },
                    "buttons": [
                        {
                            "title": "Shop Now",
                            "type": "web_url",
                            "url": "http://surrogation.com.ng/",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "http://surrogation.com.ng/"                        
                        }
                    ]                
                }
            ],
             "buttons": [
                {
                    "title": "View More",
                    "type": "postback",
                    "payload": "payload"                        
                }
            ]  
        }
    }
};
sendMessage(recipientId, message);
return true;
}