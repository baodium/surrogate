var express = require('express');  
var bodyParser = require('body-parser');  
var request = require('request'); 

var querystring = require('querystring');
var http = require('http');
var fs = require('fs'); 
var url = require('url');
var app = express();



var started=false;
var backurl="http://surrogation.com.ng/surrogateapp/";
var senderContext = {};

app.use(bodyParser.urlencoded({extended: false}));  
app.use(bodyParser.json());  
app.listen((process.env.PORT || 3000));

app.get('/', function (req, res) {  
	res.send('Surrogate Bot');
	
});

app.get('/EAAJeiL9sIu4BANZAqkGafo', function (req, res) { 
		var d = new Date();
		var n = d.getHours();

		time ="";
		if(n==0){
			time="REMINDER_TIME_TWELVE_AM";
		}else if(n==3){
			time="REMINDER_TIME_THREE_AM";
		}else if(n==6){
			time="REMINDER_TIME_SIX_AM";
		}else if(n==9){
			time="REMINDER_TIME_NINE_AM";
		}else if(n==12){
			time="REMINDER_TIME_TWELVE_PM";
		}else if(n==15){
			time="REMINDER_TIME_THREE_PM";
		}else if(n==18){
			time="REMINDER_TIME_SIX_PM";
		}else if(n==21){
			time ="REMINDER_TIME_NINE_PM";
		}
		
		console.log("hello -"+time);
		
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var d = new Date();
		var dayName = days[d.getDay()];
		dayName  = dayName.toUpperCase();
		
		var post_data = querystring.stringify({'status' : 'completed','day':'REMINDER_'+dayName,'time':time});			
		var sent = new Array();
		if(time!=""){
		request({
			url: backurl+"reminder/getmessages",
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
				console.log(output);
				ms = "";
				if(output.length>0){
					for(var k=0; k<output.length; k++){
						name = output[k].name.split(" ");
						msg = "Hey "+name[0]+"! have you not forgoten your "+output[k].subject+" class today?";
						index = contains.call(sent, output[k].facebook_id); // true
						if(!index){
							sendMessage2(output[k].facebook_id,{text: "" + msg});
							sent[k]=output[k].facebook_id;
							ms+=msg;
						}
					}
				}
				
			}
		});	
		}		
		res.send("Hello "+time);
});


function sendMessage2(recipientId, message) {  
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token: "EAAJeiL9sIu4BANZAqkGafoMRa660rcdg9ViRLX75IFSvkZAZBe2TbgrSrdO2p5bt6psRcbNlrWSRu9GJOWXe9KdrjoB9LGznZASNP1AqWmjYKVeYHZCSjNcdxrtng8kwUk5BInXUsNKoYkfOE4ZCS5WRt0xdiLqb8a3j9zfIug5gZDZD"},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
		//res.send(body);
        if (error) {
            console.log('Error sending message: ', error);
			return false;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
			return false;
        }else{
			console.log(body);
		}
    });

}
// Facebook Webhook

app.get('/webhook', function (req, res) {  
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token supplied');
    }
});

app.post('/webhook', function (req, res) { 
	//removeStarted();
	//removePersistentMenu();
	getStarted();
	addPersistentMenu();
	var helprequest = false;
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {		
        var event = events[i];						
		if (event.message && (event.message.text || event.message.attachments)) {
			msgin = event.message.text+"";	
			if(senderContext[event.sender.id]==null){
				setContext(event.sender.id);
			}
			 if(senderContext[event.sender.id]!=null){				 
				if(msgin.indexOf("thank")>-1 || msgin=="no" || msgin=="help" || msgin=="about" || msgin=="hello" || msgin=="hey" || msgin=="wassup" || msgin=="how are you" || msgin=="how far" || msgin=="about" || msgin=="okay" || msgin=="hi"  || msgin=="ok" || msgin=="cancel" || msgin=="quit"  || msgin=="exit" || msgin=="end" || msgin=="hello" || msgin=="hi" ){
					senderContext[event.sender.id].state="begin";
				}				 
				 
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
				}else if(senderContext[event.sender.id].message==="true"){				 
					var fromm =  event.sender.id;
					var to  = senderContext[event.sender.id].message_to;
					var subject = senderContext[event.sender.id].message_subject;					
				 	if(event.message.attachments){
					 msg = JSON.stringify(event.message.attachments);
					 rp = JSON.parse(msg);
					 for(j=0; j < rp.length; j++){
						 sg = {"attachment":{
										"type":rp[j].type,
										"payload":{"url":rp[j].payload.url}
										}
							};
							var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" sent this file.";
							sendFile(to,sg,fromm,msg,subject);
						/*			
						var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" sent this file.";				  										 
						if(sendMessage(to,sg)){
							if(sendMessage(to, {text: "" + msg})){
								messageOption(to,"Do you want to reply this message?",to,fromm,subject);
							}
							if(sendMessage(event.sender.id, {text: "" + "file sent"})){
								messageOption(event.sender.id,"Do you want to send another message?",fromm,to,subject);	
							}								
						}
					   	*/					
					 }
				  }else if(event.message.text){					  				 
						var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" says:"+event.message.text;				  
						if(sendMessage(to, {text: "" + msg})){
							sendMessage(event.sender.id, {text: "" + "message sent"});
							messageOption(event.sender.id,"Do you want to send another message?",fromm,to,subject);
							messageOption(to,"Do you want to reply this message?",to,fromm,subject);
						}
				  }			 				  
				  senderContext[event.sender.id].message="false";
				  
				}else if(event.message.quick_reply){
					reply = event.message.quick_reply.payload;
					if(senderContext[event.sender.id].request_id!=null){
						reqId =  senderContext[event.sender.id].request_id;
						type =  senderContext[event.sender.id].reminder_type;						
						if(reply.indexOf("REMINDER_TIME")>-1){
							var post_data = querystring.stringify({
											'status' : 'completed',
											'time':reply,
											'facebook_id' : event.sender.id,
											'request_id':reqId
											});					
											submitForm(post_data,backurl+"reminder/updateall",event.sender.id,"update_reminder");
											
						}else{
							var post_data = querystring.stringify({
											'facebook_id' : event.sender.id,
											'request_id':reqId,
											'type':type,
											'day':reply });					
											submitForm(post_data,backurl+"reminder/add",event.sender.id,"add_reminder");
						}

					}
					
				}else if(msgin.indexOf("show reminder")>-1){
					senderContext[event.sender.id].state="begin";
					showReminders(event.sender.id);
				}else if(msgin.indexOf("show expertise")>-1){
					senderContext[event.sender.id].state="begin";
					showExpertise(event.sender.id);
				}else if(msgin.indexOf("show expert")>-1 || msgin.indexOf("show tutor")>-1){
					senderContext[event.sender.id].state="begin";
					showExperts(event.sender.id);
				}else if(msgin.indexOf("show student")>-1){
					senderContext[event.sender.id].state="begin";
					showStudents(event.sender.id);
				}else if(msgin.indexOf("menu")>-1){
					senderContext[event.sender.id].state="begin";
					showMenu(event.sender.id);
				}else if(msgin.indexOf("help")>-1){
					sendMessage(event.sender.id, {text: "" + "Hi "+senderContext[event.sender.id].firstName+", I am surrogate bot. I am an artificial intelligent designed to assist students learn from their friends on messenger. \n\n You can also render help to someone based on your proficiency.\n\n Here are the things I can do "});
					senderContext[event.sender.id].state="begin";
					showMenu(event.sender.id);
				}else if(msgin.indexOf("about")>-1){
					about(event.sender.id);
				}else{
					defaultMsg ="Hello "+senderContext[event.sender.id].firstName+"!";
					if(msgin.indexOf("thank")>-1){
						defaultMsg ="You are welcome "+senderContext[event.sender.id].firstName+".";
					}else if(msgin.indexOf("cancel")>-1 || msgin.indexOf("ok")>-1 || msgin.indexOf("quit")>-1 || msgin.indexOf("end")>-1 || msgin.indexOf("exit")>-1 || msgin.indexOf("stop")>-1 || msgin=="no"){
						defaultMsg ="Okay.";
					}else if(msgin.indexOf("hello")>-1 || msgin.indexOf("hi")>-1 || msgin.indexOf("start")>-1 || msgin.indexOf("hey")>-1 || msgin.indexOf("wassup")>-1 || msgin.indexOf("how far")>-1){
						defaultMsg ="Hi "+senderContext[event.sender.id].firstName+", how are you doing? I am surrogate bot. I am an artificial intelligent designed to assist students learn from their friends on messenger.\n\n You can also render help to someone based on your proficiency. \n\n ";
					}else if(msgin.indexOf("how are you")>-1 || msgin.indexOf("what is happening")>-1 || msgin.indexOf("tell me something")>-1 ){
						defaultMsg ="Cool! "+senderContext[event.sender.id].firstName+".";
					}else if(msgin.indexOf("damn")>-1 || msgin.indexOf("fuck")>-1 || msgin.indexOf("insane")>-1 || msgin.indexOf("crazy")>-1 || msgin.indexOf("mad")>-1 ){
						defaultMsg ="Oh "+senderContext[event.sender.id].firstName+", that is not a very nice thing to say. \n\n Maybe you will feel better by providing help to someone on a subject you are proficient at. ";
					}
										
					sendMessage(event.sender.id, {text: "" + defaultMsg+" This is what I have on my menu "});
					senderContext[event.sender.id].state="begin";
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
			}else if(reply.payload=="get_assignment_help" || (reply.payload=="postback_yes" && senderContext[event.sender.id]!=null && senderContext[event.sender.id].state == "provide_subject" )){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Which subject do you need help on?"});
					senderContext[event.sender.id].state = "provide_subject";
				}
			}else if(reply.payload=="set_expertise" || (reply.payload=="postback_yes" && senderContext[event.sender.id]!=null && senderContext[event.sender.id].state == "expertise_saved" )){
				sendMessage(event.sender.id, {text: "Please type the subject you are expert in"});
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].state = "type_expertise";
				}
			}else if(reply.payload=="professional_expertise_level" || reply.payload=="intermediate_expertise_level" || reply.payload=="amateur_expertise_level"){					
					subject = senderContext[event.sender.id].subject;				
				    checkExpertise(event.sender.id,reply.payload,subject);
			}else if(reply.payload=="postback_no"){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Alright "+senderContext[event.sender.id].firstName+". This is what I have on my menu"});
					showMenu(event.sender.id);
					senderContext[event.sender.id].state="begin";
				}
			}else if(reply.payload=="my_expertise"){
				showExpertise(event.sender.id);
			}else if(reply.payload=="my_experts"){
				showExperts(event.sender.id);
			}else if(reply.payload=="my_students"){
				showStudents(event.sender.id);
			}else if(reply.payload=="my_reminders"){
				showReminders(event.sender.id);
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
			}else if(reply.payload.indexOf("remove_expert")>-1){
				var id = reply.payload.split("-");
				 toId = id[1];
				 requestId = id[2];
				 type="tutor";
				 removeExpertOrStudent(toId,event.sender.id,requestId,type);
			}else if(reply.payload.indexOf("remove_student")>-1){
				var id = reply.payload.split("-");
				 toId = id[1];
				 requestId = id[2];
				 type="student";
				 removeExpertOrStudent(toId,event.sender.id,requestId,type);
			}else if(reply.payload.indexOf("delete_reminder")>-1){
				var id = reply.payload.split("-");
				 reminderId = id[1];
				 title = id[2];
				 removeReminder(event.sender.id,reminderId,title);
			}else if(reply.payload.indexOf("request_expertise")>-1){				
				var expertise_id = reply.payload.split("-");
				 expertise_id = expertise_id[1];
				 sendHelpRequest(event.sender.id,expertise_id);
			}else if(reply.payload.indexOf("reject_request")>-1){				
				var expertise_id = reply.payload.split("-");
				 expertiseId = expertise_id[1];
				 fromId = expertise_id[2];
				 if(senderContext[event.sender.id]!=null){ 
					 sendRejection(fromId,expertiseId,event.sender.id);
				}				
			}else if(reply.payload.indexOf("accept_request")>-1){
				var expertise_id = reply.payload.split("-");
				 expertiseId = expertise_id[1];
				 fromId = expertise_id[2];
				if(senderContext[event.sender.id]!=null){  
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
					senderContext[event.sender.id].status = "select_reminder";
				}
			}else if(reply.payload.indexOf("remind_expert")>-1){				
				var members_id = reply.payload.split("-");
				 request_id = members_id[1];				
				 if(senderContext[event.sender.id]!=null){  
					 senderContext[event.sender.id].request_id=request_id;
					 senderContext[event.sender.id].reminder_type="type_remind_expert";
					 pickPeriod(event.sender.id,"");
				}				
			}else if(reply.payload.indexOf("remind_student")>-1){				
				var members_id = reply.payload.split("-");
				 request_id = members_id[1];
				 if(senderContext[event.sender.id]!=null){
					 senderContext[event.sender.id].request_id=request_id;				 
					 senderContext[event.sender.id].reminder_type="type_remind_student";
					 pickPeriod(event.sender.id,"");
				}				
			}else if(reply.payload=="postback_student_meeting"){
				if(senderContext[event.sender.id]!=null){
					showStudents(event.sender.id);
				}
			}else if(reply.payload=="postback_tutor_meeting"){
				if(senderContext[event.sender.id]!=null){
					showExperts(event.sender.id);
				}
			}else if(reply.payload=="postback_yes_reminder"){
				if(senderContext[event.sender.id]!=null){
					reminderOption(event.sender.id);
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
			return false;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
			return false;
        }
    });
return true;
}


// generic function sending messages
function sendFile(recipientId, message,thirdParty,msg,subject) {  
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
			return false;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
			return false;
        }else{				  										 
					//	if(sendMessage(to,sg)){
							if(sendMessage(recipientId, {text: "" + msg})){
								messageOption(recipientId,"Do you want to reply this message?",recipientId,thirdParty,subject);
							}
							if(sendMessage(thirdParty, {text: "" + "file sent"})){
								messageOption(thirdParty,"Do you want to send another message?",thirdParty,recipientId,subject);	
							}								
					//	}			
		}
    });
return true;
}

function pickPeriod(senderId,msg){
	message = {
			"text":msg+"Pick a reminder period:",
			"quick_replies":[{
							"content_type":"text",
							"title":"Every day",
							"payload":"REMINDER_ALLDAY"
							},{
							"content_type":"text",
							"title":"Every Monday",
							"payload":"REMINDER_MONDAY"
							},
							{
							"content_type":"text",
							"title":"Every Tuesday",
							"payload":"REMINDER_TUESDAY"
							},
							{
							"content_type":"text",
							"title":"Every Wedsday",
							"payload":"REMINDER_WEDSDAY"
							},
							{
							"content_type":"text",
							"title":"Every Thursday",
							"payload":"REMINDER_THURSDAY"
							},
							{
							"content_type":"text",
							"title":"Every Friday",
							"payload":"REMINDER_FRIDAY"
							},
							{
							"content_type":"text",
							"title":"Every Saturday",
							"payload":"REMINDER_SATURDAY"
							},
							{
							"content_type":"text",
							"title":"Every Sunday",
							"payload":"REMINDER_SUNDAY"
							}]
		};
sendMessage(senderId,message);
}

function pickTime(senderId){
	message = {
			"text":"Pick a reminder time:",
			"quick_replies":[{
							"content_type":"text",
							"title":"12 AM ",
							"payload":"REMINDER_TIME_TWELVE_AM"
							},{
							"content_type":"text",
							"title":"3 AM",
							"payload":"REMINDER_TIME_THREE_AM"
							},
							{
							"content_type":"text",
							"title":"6 AM",
							"payload":"REMINDER_TIME_SIX_AM"
							},
							{
							"content_type":"text",
							"title":"9 AM",
							"payload":"REMINDER_TIME_NINE_AM"
							},
							{
							"content_type":"text",
							"title":"12 PM ",
							"payload":"REMINDER_TIME_TWELVE_PM"
							},{
							"content_type":"text",
							"title":"3 PM",
							"payload":"REMINDER_TIME_THREE_PM"
							},
							{
							"content_type":"text",
							"title":"6 PM",
							"payload":"REMINDER_TIME_SIX_PM"
							},
							{
							"content_type":"text",
							"title":"9 PM",
							"payload":"REMINDER_TIME_NINE_PM"
							}
							]
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
							"subtitle":  "Expert in:"+output[i].subject+", \n\n Level:"+level+"",   
                            "buttons": [{
											"title": "Request Expertise",
											"type": "postback",
											"payload": "request_expertise-"+output[i].expertise_id                     
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
					
					sendMessage(senderId,message);	
							
					}else{
						sendMessage(senderId, {text: "Sorry, I dont personally know people with "+subject+" expertise"});
						displayOption(senderId,"Do you want to try another subject?","yes_no");
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
			
			sendMessage(fromId, {text: senderContext[senderId].firstName+" "+senderContext[senderId].lastName+" has accepted your "+subject+" expertise request. He's now in your tutors list."});
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
                            "title": " Surrogate is an artificial intelligent designed to assist students learn from their friends on messenger. \n\n It also allows experts/tutors to render help to people based on their individual proficiencies.\n\n ",
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
		msg="Surrogate is an artificial intelligent designed to assist students learn from their friends on messenger. \n\n It also allows experts/tutors to render help to people based on their proficiencies.\n\n Since college is a lot of work on its own, Surrogate bot takes off of the stress of its human counterpart and does the less desirable job of having to find a suitable tutor.";
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


function reminderOptionYesNo(recipientId){
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
						"template_type":"button",
						"text":"Do you want to set up another reminder?",
                        "buttons": [{
								"type": "postback",
                                "title": "Yes",
                                "payload": "postback_yes_reminder",
                                },
								{
								"type": "postback",
                                "title": "No",
                                "payload": "postback_no",
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
            },{
              type:"postback",
              title:"My expertise",
              payload:"my_expertise"
            },{
              type:"postback",
              title:"My Tutors",
              payload:"my_experts"
            },{
              type:"postback",
              title:"My Students",
              payload:"my_students"
            },{
              type:"postback",
              title:"My Class Reminders",
              payload:"my_reminders"
            },{
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
		var postt = {"get_started":{
						"payload":"get_started_button"
						}
					};
											
		
		request({
        url: 'https://graph.facebook.com/v2.8/me/messenger_profile',			
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',	
        json: postt
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{
					var welcome = {"greeting":[{
						"locale":"default",
						"text":"Good to have you {{user_first_name}}!."
						}] 
					};
				
				request({
					url: 'https://graph.facebook.com/v2.8/me/thread_settings',		
					qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
					method: 'POST',		
					json: welcome
					}, function(error, response, body) {
							if (error) {
								console.log('Error sending message: ', error);
							} else if (response.body.error) {
								console.log('Error: ', response.body.error);
							}else{
								
							}
					});				
			}
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


function removePersistentMenu(){
		var json = {
		"setting_type":"call_to_actions",
		"thread_state":"existing_thread"
		};
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
						
						if(action=="add_reminder"){
							if(!exists){
								pickTime(userId);
								senderContext[userId].status="pick_reminder_time";
							}else{
								var period = post_data.split("=");
								period = period[period.length-1];
								period = period.split("_");
								period = period[1].toLowerCase();
								msg = "You have already set up a reminder for "+period+" \n. Please pick another day \n\n";
								//if(sendMessage(userId, {text: "You have already set up a reminder for "+period+" \n\n please select another day"})){
									pickPeriod(userId,msg);
								//}
							}
						}
						
						if(action=="update_reminder"){
							sendMessage(userId, {text: "Your reminder has been saved"});
							reminderOptionYesNo(userId);						
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
				elementss = new Array();
				if(total<1){
					sendMessage(recipientId, {text: "Oh! your expertise list is empty"});
					
				message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title":"Would you like to add an expertise?",
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


function showReminders(recipientId){
	var post_data = querystring.stringify({'facebook_id' : recipientId});	
	request({
			url: backurl+"reminder/getreminders",
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
					sendMessage(recipientId, {text: "Oh! your class reminder list is empty"});					
				message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title":"Would you like to an add a class reminder?",
                            "buttons": [{
								"type": "postback",
                                "title": "Yes",
                                "payload": "set_class_reminder",
                                },
								{
								"type": "postback",
                                "title": "No",
                                "payload": "postback_no",
                                }]
                        }]
                    }
                }
				};			
				sendMessage(recipientId, message);											
				}else{
					sendMessage(recipientId, {text: "Here is your class reminder list "});					
					try{
					for(i = 0; i<output.length; i++){
						day = output[i].day;//.split("_");
						time = output[i].time;
						
						if(day!=null){
							day = output[i].day.split("_");
							day=day[1].toLowerCase();
						}else{
							day="";
						}						
						if(time!=null){
							time = output[i].time.split("_");
							time=time[2].toLowerCase()+" "+time[3].toLowerCase();
						}else{
							time="";
						}
												
						elementss[i]={                           
							"title": output[i].subject.toUpperCase(),                  
							"subtitle":"DAY:"+day+"\n\n TIME:"+time,   
                            "buttons": [{
								"type": "postback",
                                "title": "Delete",
                                "payload": "delete_reminder-"+output[i].reminder_id+"-"+output[i].subject+", "+day+", "+time
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
				}catch(err){
				sendMessage(recipientId,{text: err+" "+body});
				}
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
                                "payload": "remind_expert-"+output[i].request_id,
                                },{
								"type": "postback",
                                "title": "Send Message",
                                "payload": "postback_message_yes-"+output[i].from_id+"-"+output[i].to_id+"-"+output[i].subject,
                                },{
								"type": "postback",
                                "title": "Remove",
                                "payload": "remove_expert-"+output[i].from_id+"-"+output[i].expertise_id,
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
							"subtitle": output[i].subject+" student",   
                            "buttons": [{
								"type": "postback",
                                "title": "Set class reminder",
                                "payload": "remind_student-"+output[i].request_id,
                                },{
								"type": "postback",
                                "title": "Send Message",
                                "payload": "postback_message_yes-"+output[i].to_id+"-"+output[i].from_id+"-"+output[i].subject,
                                },{
								"type": "postback",
                                "title": "Remove",
                                "payload": "remove_student-"+output[i].to_id+"-"+output[i].expertise_id,
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
				if(sendMessage(toId, {text: "Here is your student list"})){
						sendMessage(toId,message);
					}	
				}					
			}			
		});	
}

function removeExpertise(recipientId,expertise_id,subject){
	var post_data = querystring.stringify({'facebook_id' : recipientId,'expertise_id':expertise_id});
	request({
			url: backurl+"expertise/remove",
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
				sendMessage(recipientId, {text: subject+ " expertise has been successfully deleted \n\n "});
				showExpertise(recipientId);	
			}			
		});
}


function removeExpertOrStudent(fromId,senderId,requestId,type){
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
			type2=(type=="tutor")?"student":"tutor";
			sendMessage(to, {text: senderContext[senderId].firstName+" "+senderContext[senderId].lastName+" has removed you from his "+subject+" "+type2+" list"});
			sendMessage(senderId, {text: name+" has been removed  from your "+subject+" "+type+" list"});
			var p_data = querystring.stringify({'request_id' : reqId});
			var p_data2 = querystring.stringify({'facebook_id':senderId,'expertise_id' : requestId});
			submitForm(p_data,backurl+"requests/remove",senderId,"update_request");
			submitForm(p_data2,backurl+"reminder/remove",senderId,"update_request");
		}catch(err){
			sendMessage(senderId, {text: body+""});  
		}       		
		}
		});
			
    return true;
}


function removeStudent(recipientId,expertise_id,subject){
	var post_data = querystring.stringify({'facebook_id' : recipientId,'expertise_id':expertise_id});
	request({
			url: backurl+"requests/remove",
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
				sendMessage(recipientId, {text: subject+ " student has been successfully removed \n\n "});
				showStudents(recipientId);	
			}			
		});
}


function removeReminder(recipientId,reminder_id,title){
		var post_data = querystring.stringify({'facebook_id' : recipientId,'reminder_id':reminder_id});
	request({
			url: backurl+"reminder/remove",
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
				sendMessage(recipientId, {text: title+ " reminder has been successfully deleted \n\n "});
				showReminders(recipientId);	
			}			
		});
}


var contains = function(needle) {
    var findNaN = needle !== needle;
    var indexOf;
    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;
            for(i = 0; i < this.length; i++) {
                var item = this[i];
                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    }
    return indexOf.call(this, needle) > -1;
};