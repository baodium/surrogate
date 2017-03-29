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
/*
var body ='[{"expertise_id":"2","facebook_id":"1441254119239126","subject":"English","level":"amateur_expertise_level","date_added":"2017-03-18","status":"completed"}]';
var js  = JSON.parse(body);
console.log(js[0].facebook_id); 
*/
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
	removeStarted();
	getStarted();
	addPersistentMenu();
	var helprequest = false;
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {		
        var event = events[i];						
		if (event.message && event.message.text) {
			if(senderContext[event.sender.id]==null){
				setContext(event.sender.id);
			}
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
				}else if(senderContext[event.sender.id].state === "type_reminder"){
					 sendMessage(event.sender.id, {text: "" + "reminder typed"});
					/*
					var reminder_title = event.message.text;
					senderContext[event.sender.id].reminder_title = reminder_title;
					
					var post_data = querystring.stringify({
						'facebook_id' : event.sender.id,
						'title':reminder_title,
						'status':'pending'
					});					
					submitForm(post_data,backurl+"reminder/add",event.sender.id,"type_reminder");	
					*/
				}else if(senderContext[event.sender.id].message==="true"){
				  var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" says :"+event.message.text;				  
				  var fromm =  event.sender.id;
				  var to  = senderContext[event.sender.id].message_to;
				  var subject = senderContext[event.sender.id].message_subject;
				  sendMessage(to, {text: "" + msg});
				  sendMessage(event.sender.id, {text: "" + "message sent"});
				  messageOption(event.sender.id,"Do you want to send another message?",fromm,to,subject);
				  messageOption(to,"Do you want to reply this message?",to,fromm,subject);
				  senderContext[event.sender.id].message="false";				
				}else{
					sendMessage(event.sender.id, {text: "" + "Sorry, I don't understand that. Anyway, this is what I have on my menu"});
					showMenu(event.sender.id);
				}
			 }else{
				welcomeUser(event.sender.id);
			 }
		} else if (event.postback) {
			if(senderContext[event.sender.id]==null){
				setContext(event.sender.id);
			}
			var reply = JSON.stringify(event.postback);
			reply = JSON.parse(reply);
			if(reply.payload=="get_started_button"){
				welcomeUser(event.sender.id);
			}else if(reply.payload=="help_me"){
				help(event.sender.id);
			}else if(reply.payload=="about_me"){
				about(event.sender.id);
			}else if(reply.payload=="get_assignment_help"){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "which subject do you need help on?"});
					senderContext[event.sender.id].state = "provide_subject";
				}
			}else if(reply.payload=="set_expertise" || (reply.payload=="postback_yes" && senderContext[event.sender.id]!=null && senderContext[event.sender.id].state == "expertise_saved" )){
				sendMessage(event.sender.id, {text: "Please type the subject you are expert in"});
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].state = "type_expertise";
				}
			}else if(reply.payload=="professional_expertise_level" || reply.payload=="intermediate_expertise_level" || reply.payload=="amateur_expertise_level"){					
					subject = senderContext[event.sender.id].subject;
				/*	var post_data = querystring.stringify({
						'status':'completed',
						'level':reply.payload,
						'facebook_id' : event.sender.id,
						'subject':subject
					});					
								
				submitForm(post_data,backurl+"expertise/update",event.sender.id,"update_expertise");
				*/
				checkExpertise(event.sender.id,reply.payload,subject);
			}else if(reply.payload=="postback_no"){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Okay then. This is what I have on my menu"});
					showMenu(event.sender.id);
				}
			}else if(reply.payload=="my_expertise"){
				showExpertise(event.sender.id);
			}else if(reply.payload=="my_experts"){
				showExperts(event.sender.id);
			}else if(reply.payload=="my_students"){
				showStudents(event.sender.id);
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
			}else if(reply.payload=="next_expert_list"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].nextexp++;
					showExpertise(event.sender.id);
				}
			}else if(reply.payload=="previous_expert_list"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].nextexp--;
					showExpertise(event.sender.id);
				}
			}else if(reply.payload.indexOf("delete_expertise")>-1){
				var id = reply.payload.split("-");
				 expertiseId = id[1];
				 subject = id[2];
				 removeExpertise(event.sender.id,expertiseId,subject);
			}else if(reply.payload.indexOf("request_expertise")>-1){				
				var expertise_id = reply.payload.split("-");
				 expertise_id = expertise_id[1];
				 sendHelpRequest(event.sender.id,expertise_id);
			}else if(reply.payload.indexOf("reject_request")>-1){				
				var expertise_id = reply.payload.split("-");
				 expertiseId = expertise_id[1];
				 fromId = expertise_id[2];
				 if(senderContext[event.sender.id]!=null){
					// sendMessage(fromId, {text: "hello from_id"+fromId+" - "+expertiseId});   
					 sendRejection(fromId,expertiseId,event.sender.id);
				}
				
			}else if(reply.payload.indexOf("accept_request")>-1){

				var expertise_id = reply.payload.split("-");
				 expertiseId = expertise_id[1];
				 fromId = expertise_id[2];
				if(senderContext[event.sender.id]!=null){  
				 //sendMessage(event.sender.id, {text: "user online "});
					sendAcceptance(fromId,expertiseId,event.sender.id);
				}
				
				
			}else if(reply.payload=="home"){
				welcomeUser(event.sender.id);				
			}else if(reply.payload.indexOf("postback_message_yes")>-1){				
				var members_id = reply.payload.split("-");
				 fromId = members_id[1];
				 toId = members_id[2];
				 sub= members_id[3];
				 if(senderContext[event.sender.id]!=null){  
					 sendMessage(event.sender.id, {text: "Okay then! please type your messege "});
					 senderContext[event.sender.id].message="true";
					 senderContext[event.sender.id].message_from=event.sender.id;
					 senderContext[event.sender.id].message_to=toId;
					 senderContext[event.sender.id].message_subject=sub;
				}				
			}else if(reply.payload=="set_class_reminder"){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Cool! you can now setup a class reminder for meetings with your tutor(s) or student(s) \n\n\n"});
					reminderOption(event.sender.id);
					//senderContext[event.sender.id].status = "type_reminder";
				}
			}else if(reply.payload.indexOf("remind_expert")>-1){				
				var members_id = reply.payload.split("-");
				 fromId = members_id[1];
				 toId = members_id[2];
				 sub= members_id[3];
				 if(senderContext[event.sender.id]!=null){  
					 //sendMessage(event.sender.id, {text: "Okay then! please pick a reminder time"});
					 senderContext[event.sender.id].status="type_remind_expert_time";
					 pickTime(event.sender.id);
				}				
			}else if(reply.payload.indexOf("remind_student")>-1){				
				var members_id = reply.payload.split("-");
				 fromId = members_id[1];
				 toId = members_id[2];
				 sub= members_id[3];
				 if(senderContext[event.sender.id]!=null){  
					// sendMessage(event.sender.id, {text: "Okay then! please pick a reminder time"});
					 senderContext[event.sender.id].status="type_remind_student_time";
					 pickTime(event.sender.id);
				}				
			}else if(reply.payload=="postback_student_meeting"){
				if(senderContext[event.sender.id]!=null){
					showStudents(event.sender.id);
				}
			}else if(reply.payload=="postback_tutor_meeting"){
				if(senderContext[event.sender.id]!=null){
					showExperts(event.sender.id);
				}
			}else{
				sendMessage(event.sender.id, {text: reply.payload+" "});
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
return true;
}


function pickTime(senderId){
	message = {
			"text":"Pick a reminder period:",
			"quick_replies":[{
							"content_type":"text",
							"title":"Monday",
							"payload":"REMINDER_MONDAY"
							},
							{
							"content_type":"text",
							"title":"Tuesday",
							"payload":"REMINDER_TUESDAY"
							},
							{
							"content_type":"text",
							"title":"Wedsday",
							"payload":"REMINDER_WEDSDAY"
							},
							{
							"content_type":"text",
							"title":"Thursday",
							"payload":"REMINDER_THURSDAY"
							},
							{
							"content_type":"text",
							"title":"Friday",
							"payload":"REMINDER_FRIDAY"
							},
							{
							"content_type":"text",
							"title":"Saturday",
							"payload":"REMINDER_SATURDAY"
							},
							{
							"content_type":"text",
							"title":"Sunday",
							"payload":"REMINDER_SUNDAY"
							}]
		};
sendMessage(senderId,message);
}

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
			//sendMessage(senderId, {text: "" + JSON.stringify(body)});
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{
				try{
					output = JSON.parse(body);	
					if(output.length>0){
							sendMessage(senderId, {text: "Oh! that is nice we have people that can help you with "+subject+".\n\n Here is the list"});
							senderContext[senderId].state = "provide_subject_done";	
						
					var total = output.length;
					elementss = new Array();
					/*
							var start = (senderContext[senderId].nextexp!=null)?senderContext[senderId].nextexp:0;
							if(total>3){
								output = output.slice((start*2), ((start*2) + 2));
							}
					
					elementss = new Array();
					elementss[0] = {
                    "title": "Expertise Help List",
					"subtitle": "For "+subject+" "
					};
					*/		
					for(i = 0; i<output.length; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}
						
						
						/*
						elementss[i+1]={
									"title": output[i].name,  
									"image_url": output[i].profile_pic,									
									"subtitle": "Level:"+level,
									"buttons": [{
												"title": "Request Expertise",
												"type": "postback",
												"payload": "request_expertise-"+output[i].expertise_id                     
												}]
										};
										*/
					elementss[i]={                           
							"title": output[i].name, 
							"image_url": output[i].profile_pic,                  
							"subtitle":  "Expert in:"+output[i].subject+", \n\n Level:"+level+"",   
                            "buttons": [{
											"title": "Request Expertise",
											"type": "postback",
											"payload": "request_expertise-"+output[i].expertise_id                     
										}]
                        };
				
					}
					
					
					/*
					message = {
						"attachment": {
						"type": "template",
						"payload": {
									"template_type": "list",
									"top_element_style": "compact",
									"elements": elementss,
									"buttons": [{
												"title": ((total<=3)?"Close":(((start+3)<total)?"More":"previous")),//((start+3)<total)?"More":(((start+3)==total)?"Close":"Previous"),
												"type": "postback",
												"payload":((total<=3)?"postback_no":(((start+3)<total)?"next_expert_list":"previous_expert_list"))//((start+3)<total)?"next_expertise":(((start+3)==total)?"postback_no":"previous_expertise")                        
												}]  
									}
						}
					};
					
					*/
					
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elementss
                    }
					}
				};
					
					sendMessage(senderId,message);	
							
					}else{
						sendMessage(senderId, {text: "Sorry, I dont personally know people with "+subject+" expertise"});
					}
					
					}catch(err){
						//sendMessage(senderId, {text: "Error fetching expert "});
					}	

			}
					
		});
	
}

function sendHelpRequest(senderId,requestId){
	var post_data = querystring.stringify({'expertise_id' : requestId});
			request({
			url: backurl+"expertise/get",
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
		
        if (error) {
			sendMessage(senderId, {text: "hey "+error});
        } else if (response.body.error) {
           sendMessage(senderId, {text: "hey "+error});
        }else{
			//sendMessage(senderId, {text: "hey "+body});
			
			var bodyObject = JSON.parse(body);
			bodyObject = bodyObject[0];
			subject = bodyObject.subject;
			level = bodyObject.level;
			ownerId=bodyObject.facebook_id;
			
			var post_data = querystring.stringify({
				'from_id' : senderId,
				'to_id':ownerId,
				'subject':subject,
				'expertise_id':requestId
			});
			
			//sendMessage(senderId, {text: "hey "+post_data});
			if(senderContext[senderId]!=null){	
				senderContext[senderId].requestSubject = subject;
				senderContext[senderId].requestTo = ownerId;
				senderContext[senderId].expertiseId = requestId;
				submitForm(post_data,backurl+"requests/add",senderId,"save_request");
			}
          		
		}
		});
			
    return true;
}


function sendRejection(fromId,requestId,senderId){
	var post_data = querystring.stringify({'expertise_id' : requestId,'from_id':fromId,'special_field':'from_id'});
			request({
			url: backurl+"requests/get",
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
		
        if (error) {
			//
        } else if (response.body.error) {
           //
        }else{
		try{		
			var bodyObject = JSON.parse(body);
			bodyObject = bodyObject[0];
			subject = bodyObject.subject;
			to = bodyObject.to_id;
			name = bodyObject.name;	
			reqId = bodyObject.request_id;
			sendMessage(fromId, {text: senderContext[senderId].firstName+" "+senderContext[senderId].lastName+" has rejected your "+subject+" expertise request"});
			var p_data = querystring.stringify({'request_id' : reqId});
			submitForm(p_data,backurl+"requests/remove",senderId,"update_request");
		}catch(err){
			sendMessage(fromId, {text: body+""});  
		}       		
		}
		});
			
    return true;
}

function sendAcceptance(fromId,requestId,senderId){
	//fromId,expertiseId,event.sender.id
	var post_data = querystring.stringify({'expertise_id' : requestId,'from_id':fromId,'special_field':'from_id'});
			request({
			url: backurl+"requests/get",
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
		
        if (error) {
			//
        } else if (response.body.error) {
           //
        }else{
		try{		
			var bodyObject = JSON.parse(body);
			bodyObject = bodyObject[0];
			//sendMessage(senderId, {text: body+""});  		
			subject = bodyObject.subject;
			to = bodyObject.to_id;
			name = bodyObject.name;	
			reqId = bodyObject.request_id;
			
			sendMessage(senderId, {text: name+" is now your "+subject+" student."});
			messageOption(senderId,"Do you want to message him?",senderId,fromId,subject);
			//recipientId,msg,fromm,to,subject
			
			//senderContext[senderId].firstName+" "+senderContext[senderId].lastName
			
			sendMessage(fromId, {text: "Obadimu wale has accepted your "+subject+" expertise request. He's now in your tutors list."});
			messageOption(fromId,"Do you want to message him?",fromId,senderId,subject);
						
			var p_data = querystring.stringify({'request_id' : reqId,'status':'completed'});
			submitForm(p_data,backurl+"requests/update",senderId,"update_request2");
						
		}catch(err){
			sendMessage(senderId, {text: " exception "+err});  
		}       		
		}
		});
			
    return true;
}


function checkExpertise(senderId,payload,subject){
	
				var post_data = querystring.stringify({
						'status':'completed',
						'level':payload,
						'facebook_id' : senderId,
						'subject':subject
				});					
				
			request({
			url: backurl+"expertise/get",
			method: 'POST',
			body: post_data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
				}
		}, function(error, response, body) {
		
        if (error) {
			//
        } else if (response.body.error) {
           //
        }else{
      		
		try{		
			var bodyObject = JSON.parse(body);
			if(bodyObject.length>0){
				sendMessage(senderId, {text: "Oh! did you forget? you have already added this subject. Please specify another subject"}); 
				var p_data = querystring.stringify({
						'status':'pending',
						'facebook_id' : senderId,
						'subject':subject,
						'level':payload
				});	
				getOut(senderId);								
				senderContext[senderId].state = "type_expertise";
				submitForm(p_data,backurl+"expertise/remove",senderId,"remove_expertise");				
			}else{
				var post_data = querystring.stringify({
						'status':'completed',
						'level':payload,
						'facebook_id' : senderId,
						'subject':subject
				});		
				submitForm(post_data,backurl+"expertise/updateall",senderId,"update_expertise");
			}
		}catch(err){
			sendMessage(senderId, {text: body+""});  
		}       				
		}
		});			
    return true;
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
                            "title": "Surrogate app helps you get help or render help on various subject matters",
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


function setContext(recipientId) {

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
			senderContext[recipientId].state = "just_welcomed";
			senderContext[recipientId].next=0;
            return true;		
		}
		});
			
    return true;
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
			senderContext[recipientId].message="false";
			
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
		msg="Since college is a lot of work on its own, Surrogate bot takes off of the stress of its human counterpart and does the less desirable job of having to find a suitable tutor.";
			sendMessage(recipientId,{text: "" + msg});
			     message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "About Surrogate",
                            "buttons": [{
								"type": "postback",
                                "title": "I got it!",
                                "payload": "postback_no",
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


function reminderOption(recipientId){
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
						"template_type":"button",
						"text":"Which type of reminder do you want to setup?",
                        "buttons": [{
								"type": "postback",
                                "title": "Meeting with expert",
                                "payload": "postback_tutor_meeting",
                                },
								{
								"type": "postback",
                                "title": "Meeting with student",
                                "payload": "postback_student_meeting",
                                }]
                    }
                }
            };			
			sendMessage(recipientId, message);			
            return false;
}


function messageOption(recipientId,msg,fromm,to,subject){
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
                                "payload": "postback_message_yes-"+fromm+"-"+to+"-"+subject,
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
	if( senderContext[recipientId]!=null){
		senderContext[recipientId].state = "send message";
	}
		sendMessage(recipientId, message);			
        return true;
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
                                "title": "Yes take me out!",
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
              title:"My expertise",
              payload:"my_expertise"
            },
			{
              type:"postback",
              title:"My Tutors",
              payload:"my_experts"
            },
			{
              type:"postback",
              title:"My Students",
              payload:"my_students"
            },
			{
              type:"postback",
              title:"About",
              payload:"about_me"
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
						"text":"You are welcome {{user_first_name}}!."
						}] 
					};		
					
		
		
		request({
        url: 'https://graph.facebook.com/v2.8/me/messenger_profile',			
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',	
        json: post
		}, function(error, response, body) {

		});
		
		request({
        url: 'https://graph.facebook.com/v2.8/me/thread_settings',		
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',		
        json: welcome
		}, function(error, response, body) {

		});
}


function removeStarted(){
		var json = {"setting_type":"greeting"};
		request({
        url: 'https://graph.facebook.com/v2.8/me/thread_settings',
        method: 'DELETE',		
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        json: json
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
				//sendMessage(userId, {text: "" + body+"-"+output.status});
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
						}
						
						if(action == "save_request"){
							if(!exists){		
								name = senderContext[userId].firstName + " "+senderContext[userId].lastName;
								subject = senderContext[userId].requestSubject;
								ownerId = senderContext[userId].requestTo;
								requestId = senderContext[userId].expertiseId;
								sendMessage(userId, {text: "Your request has been sent. Hopefully, you will get a reply very soon."});				
								//sendMessage(userId, {text: "You have a new request. "+name+" wants to learn "+subject+" from you"});	
								sendMessage(ownerId, {text: "You have a new request. "+name+" wants to learn "+subject+" from you"});									
								
								message = {"attachment": {
											"type": "template",
											"payload": {
											"template_type": "generic",
											"elements": [{
														"title": "Would you teach "+name+" "+subject+"?",
														"buttons": [{
															"type": "postback",
															"title": "I will",
															"payload": "accept_request-"+requestId+"-"+userId,
														}, {
															"type": "postback",
															"title": "No",
															"payload": "reject_request-"+requestId+"-"+userId,
															}]
														}]
													}
												}
											};
								sendMessage(ownerId, message);									
							}else{
								sendMessage(userId, {text: "Oh! did you forget? You have already requested this expertise!"});																
							}
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
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{
				output = JSON.parse(body);
				var total = output.length;
				/*
				var start =(senderContext[recipientId].next!=null)?senderContext[recipientId].next:0;
				if(total>3){
					output = output.slice((start*2), ((start*2) + 2));
				}*/
				elementss = new Array();
				if(total<1){
					sendMessage(recipientId, {text: "Oh! your expertise list is empty"});
					
				message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title":"Would you like to an add expertise?",
                            "buttons": [{
								"type": "postback",
                                "title": "Yes",
                                "payload": "set_expertise",
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
					
					
				}else{
					sendMessage(recipientId, {text: "Here is your expertise list"});
					/*
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
											"buttons": [{
														"title": ((total<3)?"Close":(((start+3)<total)?"More":"previous")),//((start+3)<total)?"More":(((start+3)==total)?"Close":"Previous"),
														"type": "postback",
														"payload":((total<3)?"postback_no":(((start+3)<total)?"next_expertise":"previous_expertise"))//((start+3)<total)?"next_expertise":(((start+3)==total)?"postback_no":"previous_expertise")                        
														}]  
										}
								}
					};
					
					*/
					

					for(i = 0; i<output.length; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						elementss[i]={                           
							"title": output[i].subject.toUpperCase(),                  
							"subtitle": level+" level",   
                            "buttons": [{
								"type": "postback",
                                "title": "Delete",
                                "payload": "delete_expertise-"+output[i].expertise_id+"-"+output[i].subject,
                                }]
                        };
				
					}
										
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elementss
                    }
					}
				};
				
				sendMessage(recipientId,message);
				}
					
			}			
		});
	
}


function showExperts(fromId){
	var post_data = querystring.stringify({'from_id':fromId,'status':'completed'});	
	request({
			url: backurl+"requests/get",
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
				output = JSON.parse(body);
				var total = output.length;
				elementss = new Array();
				if(total<1){
					sendMessage(fromId, {text: "Oh! your tutor list is empty"});
				}else{										
					for(i = 0; i<output.length; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						elementss[i]={                           
							"title": output[i].name, 
							"image_url": output[i].profile_pic,                  
							"subtitle": output[i].subject+" expert, Level:"+level,   
                            "buttons": [{
								"type": "postback",
                                "title": "Set class reminder",
                                "payload": "remind_expert-"+output[i].from_id+"-"+output[i].to_id+"-"+output[i].subject,
                                },{
								"type": "postback",
                                "title": "Send Message",
                                "payload": "postback_message_yes-"+output[i].from_id+"-"+output[i].to_id+"-"+output[i].subject,
                                },{
								"type": "postback",
                                "title": "Remove",
                                "payload": "remove_expert-"+output[i].from_id+"-"+"-"+output[i].request_id,
                                }]
                        };
				
					}
										
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elementss
                    }
					}
				};
					senderContext[fromId].state="send message";
					if(sendMessage(fromId, {text: "Here is your expert list"})){
						sendMessage(fromId,message);
					}			
				}					
			}			
		});	
}


function showStudents(toId){
	var post_data = querystring.stringify({'to_id':toId});	
	request({
			url: backurl+"requests/get",
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
				output = JSON.parse(body);
				var total = output.length;
				elementss = new Array();
				if(total<1){
					sendMessage(toId, {text: "Oh! your student list is empty"});
				}else{										
					for(i = 0; i<output.length; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						elementss[i]={                           
							"title": output[i].name, 
							"image_url": output[i].profile_pic,                  
							"subtitle": output[i].subject+", Level:"+level+" student",   
                            "buttons": [{
								"type": "postback",
                                "title": "Set class reminder",
                                "payload": "remind_student-"+output[i].from_id+"-"+output[i].to_id+"-"+output[i].subject,
                                },{
								"type": "postback",
                                "title": "Send Message",
                                "payload": "postback_message_yes-"+output[i].from_id+"-"+output[i].to_id+"-"+output[i].subject,
                                },{
								"type": "postback",
                                "title": "Remove",
                                "payload": "remove_expert-"+output[i].from_id+"-"+"-"+output[i].request_id,
                                }]
                        };
				
					}
										
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elementss
                    }
					}
				};	
				//sendMessage(toId, {text: "Here is your student list"});
				//sendMessage(toId,message);
				if(sendMessage(toId, {text: "Here is your student list"})){
						sendMessage(toId,message);
					}	
				}					
			}			
		});	
}

function removeExpertise(recipientId,expertise_id,subject){
		var post_data = querystring.stringify({'facebook_id' : recipientId,'expertise_id':expertise_id});
		//submitForm(post_data,backurl+"expertise/delete");
	request({
			url: backurl+"expertise/remove",
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
				sendMessage(recipientId, {text: subject+ " expertise has been successfully deleted \n\n "});
				showExpertise(recipientId);	
			}			
		});
}
