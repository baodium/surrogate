//Wale's comment
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();

var started=false;
var message_count=0;
var student_page=0;
var request_page=0;
var tutor_page=0;
var expert_page=0;
var expertise_page=0;


var backurl="http://surrogation.com.ng/surrogateapp/";
var senderContext = {};
var greetings_pool = ["how are you","how far","wassup","kilonshele","bawo ni","how you dey","wetin dey happen","wassup?","wetin dey happen?","wetin dey","what is happening","how are you?","how far?","what is happening?"];
var time_pool=["morning","afternoon","evening","good morning","good afternoon","good evening"];
var cancellation_pool=["quit","cancel","bye","get out","out","exit","abort","no","end","terminate","stop"];
var abuse_pool=["damn","fuck","insane","crazy","mad","shit","oloriburuku","mugun","idiot"];
var students_pool=["show student","show my student","message student","send message to student","send student message","my student","show me my student","who are my student","who is my student"];
var experts_pool=["show tutor","message expert","message tutor","send message to tutor","send tutor message","message expert","send message to expert","send expert message","show my tutor","my tutor","show me my tutor","who are my tutor","show expert","show my expert","my expert","show me my expert","who are my expert","who is my expert","show expert","show my expert","my expert","show me my expert"];
var expertise_pool=["show expertise","change expertise","delete expertise","update expertise","remove expertise","edit expertise","show my expertise","my expertise","show me my expertise","show subject","show my subject","my subject","show me my subject"];
var reminder_pool=["reminder","show reminder","change reminder","update reminder","delete reminder","remove reminder","edit reminder","show my reminder","my reminder","show me my reminder","show reminder"];
var help_pool=["help","help me","show help","show me help","help please","please help","please help me","i need help","how to","how to use","i want help"];
var about_pool=["about","what can i do","what can you do","about me","about surrogate","who are you","who are you?","what can i do?","what can you do?","what is surrogate","what is surrogate app","about you"];
var menu_pool=["show menu","menu","my menu","show me menu","show me the menu","where is the menu","menu please","the menu"];
var hi_pool=["hello","hi","hey","may i know you","tell me something"];
var welcome_pool=["thank","thanks","thank you","oshe","thanks a bunch"];
var appreciative_pool=["wonderful","awesome"];
var statistics_pool=["my statistics","statistics","show stats","show statistics"];
var wellwish_pool=["god bless","god bless you","bless you","you're cool","you are the best","you are cool","you are awesome","you're the best","you're great","you are great","you are good","you are too much","wish you the best","good luck"];
var love_pool =["love you","missed you","in love with you","i am in love with you","i missed you","i love you","miss you"];
var hours = ["","","","THREE","","","SIX","","","NINE","","","TWELVE"];
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

/*

*/

app.get('/', function (req, res) {

res.send('Surrogate Bot<br/>');	

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
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wedsday', 'Thursday', 'Friday', 'Saturday'];
		var d = new Date();
		dayy = d.getDay();
		if(dayy=="Wednessday"){
			dayy=="Wedsday";
		}
		var dayName = days[dayy];
		dayName  = dayName.toUpperCase();
		//time="12";
		//dayName="THURSDAY";
		var post_data = querystring.stringify({'status' : 'completed','day':'REMINDER_'+dayName,'time':time});
		//var post_data = querystring.stringify({'status' : 'completed','day':'REMINDER_'+dayName,'time':'REMINDER_TIME_TWELVE_PM'});
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
						var tp ="";
						rtype =  output[k].type;
						if(rtype=="type_remind_expert"){
							rtype="WITH TUTOR";
							tp="tutor";
						}else{
							rtype="WITH STUDENT";
							tp="student";
						}
						msg = "Hi "+name[0]+", I hope you have not forgotten your "+output[k].subject+" class with "+output[k].from_name+", your "+tp+", today!";
						day = output[k].day;//.split("_");
						time = output[k].time;

						if(day!=null){
							day = output[k].day.split("_");
							day=day[1].toLowerCase();
							if(day=="allday"){
								day ="every day";
							}
						}else{
							day="";
						}

						if(time!=null){
							time = output[k].time.split("_");
							time=time[2].toLowerCase()+" "+time[3].toLowerCase();
						}else{
							time="";
						}

						index = contains.call(sent, output[k].facebook_id); // true
						if(!index){
						message = {
								"attachment": {
								"type": "template",
								"payload": {
											"template_type":"button",
											"text":msg,
											"buttons": [{
														"type": "postback",
														"title": "Attend Class",
														"payload": "postback_attend_class-"+output[k].request_id+"-"+output[k].subject+"-"+output[k].type
											},
											{
														"type": "postback",
														"title": "Delete Reminder",
														"payload": "delete_reminder-"+output[k].reminder_id+"-"+output[k].subject+", "+day+", "+time
											}
											]
											}
								}
							};

							sendMessage2(output[k].facebook_id,message);
							sent[k]=output[k].facebook_id;
							ms+=msg;
						}
					}
				}

			}
		});
		}
		res.send("Hello "+time+" - "+dayName);
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

	getStarted();
	var helprequest = false;
	var message_count=0;
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];


		var intialized = setContext(event.sender.id);
		if (event.message && (event.message.text || event.message.attachments)) {
			try{
			msgin = event.message.text+"";
			msgin = msgin.toLowerCase();
			msgin2  = msgin.replace(/s+$/, '');
			
			//msgin3  = msgin.replace(/?+$/, '');

			 if(senderContext[event.sender.id]!=null){
				if(contains.call(greetings_pool, msgin) || contains.call(cancellation_pool, msgin)){
					senderContext[event.sender.id].state="begin";
				}

				if(senderContext[event.sender.id].state === "provide_subject"){
					checkHelper(event.message.text,event.sender.id,"0");
				}else if(senderContext[event.sender.id].state === "type_expertise"){
					var subject = event.message.text;
					subject = subject.split(",");
					subject = subject[0];
					senderContext[event.sender.id].subject = subject;
					var post_data = querystring.stringify({
						'facebook_id' : event.sender.id,
						'subject':subject,
						'status':'pending'
					});
					submitForm(post_data,backurl+"expertise/add",event.sender.id,"type_expertise");
				}else if(senderContext[event.sender.id].message==="true" && event.message.quick_reply==null){
					var fromm =  event.sender.id;
					var to  = senderContext[event.sender.id].message_to;
					var subject = senderContext[event.sender.id].message_subject;
					var userSel = senderContext[event.sender.id].userType;
					var pic =  senderContext[event.sender.id].profilePic;
						if(userSel=="expert" || userSel=="tutor"){
							userSel="student";
						}else{
							userSel="tutor";
						}
				 	if(event.message.attachments){
						msg = JSON.stringify(event.message.attachments);
						rp = JSON.parse(msg);
						for(j=0; j < rp.length; j++){
							sg = {"attachment":{
										"type":rp[j].type,
										"payload":{"url":rp[j].payload.url}
										}
							};
							//var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+"("+subject+" "+userSel+") sent this file.";
							var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" sent this file"
							sendFile(to,sg,fromm,msg,subject);
						}
					}

				  if(event.message.text){
						var msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" ("+subject+" "+userSel+"): \n "+event.message.text;
						if(senderContext[to]!=null){
								if(senderContext[to].conversation_started=="true"){
									sent = endConversation(to,"" + msg);
								}else{
									msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" ("+subject+" "+userSel+") sent: \n"+event.message.text;
									sent = sendMessage(to, {text: "" + msg});
									replyOption(to,"Do you want to reply "+senderContext[event.sender.id].firstName+"?",to,fromm,subject,userSel,pic);
								}
						}else{
								 msg = senderContext[event.sender.id].firstName+" "+senderContext[event.sender.id].lastName+" ("+subject+" "+userSel+") sent: \n"+event.message.text;
							     sent = sendMessage(to, {text: "" + msg});
								 replyOption(to,"Do you want to reply "+senderContext[event.sender.id].firstName+"?",to,fromm,subject,userSel,pic);
						}

						if(sent){
							sendBusy(to,"typing_off");
							//endConversation(event.sender.id,"✔�� ");
							endConversation(event.sender.id,"✔️ ");
						}
				  }

				}else if(event.message.quick_reply){
					reply = event.message.quick_reply.payload;
					if(reply.indexOf("RATING")>-1){
						var rating = reply.split("-");
						expertise_id = rating[1];
						rating = rating[0].split("_");
						rating = rating[1];
							var post_data = querystring.stringify({
											'rated_by' : event.sender.id,
											'expertise_id':expertise_id,
											'rating':rating });
											submitForm(post_data,backurl+"ratings/add",event.sender.id,"add_rating");
					}else if(reply=="END_CONVERSATION"){
						senderContext[event.sender.id].message="false";
						senderContext[event.sender.id].conversation_started="false";
						 if(senderContext[event.sender.id].userType=="expert" && message_count==0){
							currentExpertise = senderContext[event.sender.id].currentExpertise;
							rateOption(event.sender.id,currentExpertise);
						}else{
							senderContext[event.sender.id].state="begin";
							sendMessage(event.sender.id, {text: "Alright "+senderContext[event.sender.id].firstName+". This is what I have on my menu"});
							showMenu(event.sender.id);
						}
					}else{
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
				 }
				}else if(contains.call(reminder_pool, msgin) || contains.call(reminder_pool, msgin2) ){
					senderContext[event.sender.id].state="begin";
					showReminders(event.sender.id);
				}else if(contains.call(statistics_pool, msgin)){
					senderContext[event.sender.id].state="begin";
					showStatistic(event.sender.id,senderContext[event.sender.id].firstName);
				}else if(contains.call(expertise_pool, msgin) || contains.call(expertise_pool, msgin2)){
					senderContext[event.sender.id].state="begin";
					showExpertise(event.sender.id);
				}else if(contains.call(experts_pool, msgin) || contains.call(experts_pool, msgin2)){
					senderContext[event.sender.id].state="begin";
					showExperts(event.sender.id,false,"0");
				}else if(contains.call(students_pool, msgin) || contains.call(students_pool, msgin2)){
					senderContext[event.sender.id].state="begin";
					showStudents(event.sender.id,false,"0");
				}else if(contains.call(menu_pool, msgin) || contains.call(menu_pool, msgin2)){
					senderContext[event.sender.id].state="begin";
					showMenu(event.sender.id);
				}else if(contains.call(help_pool, msgin) || contains.call(help_pool, msgin2) || msgin.indexOf("help")>-1 || msgin.indexOf("how")>-1){
					//sendMessage(event.sender.id, {text: "" + "Hi "+senderContext[event.sender.id].firstName+", I am surrogate bot. I am an artificial intelligent designed to assist students learn from experts on messenger. \n\n You can also render help to someone based on your proficiency.\n\n Here are the things I can do "});
					help(event.sender.id,senderContext[event.sender.id].firstName);
					senderContext[event.sender.id].state="begin";
				}else if(contains.call(about_pool, msgin) || contains.call(about_pool, msgin2) || msgin.indexOf("about")>-1 || msgin.indexOf("what")>-1 || msgin.indexOf("who")>-1 || msgin.indexOf("know")>-1){
					about(event.sender.id);
				}else if(msgin=="set expertise" || msgin=="add expertise" ){
				sendMessage(event.sender.id, {text: "Please type the subject you are expert in"});
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].state = "type_expertise";
				}
				}else if(msgin=="set class reminder" || msgin=="add reminder" || msgin=="set reminder"){				
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Cool! you can now setup a class reminder for meetings with your tutor(s) or student(s) \n\n\n"});
					reminderOption(event.sender.id);
					senderContext[event.sender.id].status = "select_reminder";
				}				
				}else if(msgin=="get subject help" ){				
					if(senderContext[event.sender.id]!=null){
						sendMessage(event.sender.id, {text: "Which subject do you need help on?"});
						senderContext[event.sender.id].state = "provide_subject";
					}
				}else{
					defaultMsg ="Hello "+senderContext[event.sender.id].firstName+"! \n\n";
					if(contains.call(welcome_pool, msgin)  || msgin.indexOf("thanks")>-1){
						defaultMsg ="You are welcome "+senderContext[event.sender.id].firstName+".\n\n";
					}else if(contains.call(cancellation_pool, msgin)){
						defaultMsg ="Okay. ";
					}else if(contains.call(hi_pool, msgin)){
						defaultMsg ="Hi "+senderContext[event.sender.id].firstName+", how are you doing? I am surrogate bot. I am an artificial intelligent designed to assist students learn from experts on messenger.\n\n You can also render help to someone based on your proficiency. \n\n ";
					}else if(contains.call(wellwish_pool, msgin)){
						defaultMsg ="And you too, "+senderContext[event.sender.id].firstName+". \n\n";
					}else if(contains.call(greetings_pool, msgin)){
						defaultMsg ="I'm cool! "+senderContext[event.sender.id].firstName+". \n\n";
					}else if(msgin.indexOf("wonderful")>-1 || msgin.indexOf("awesome")>-1){
						defaultMsg ="Thank you "+senderContext[event.sender.id].firstName+". \n\n";
					}else if(msgin.indexOf("damn")>-1 || msgin.indexOf("fuck")>-1 || msgin.indexOf("fool")>-1 || msgin.indexOf("insane")>-1 || msgin.indexOf("crazy")>-1 || msgin.indexOf("mad")>-1 ){
						defaultMsg ="Oh "+senderContext[event.sender.id].firstName+", that is not a very nice thing to say. \n\n Maybe you will feel better by providing help to someone on a subject you are proficient at. \n\n ";
					}else if(contains.call(love_pool, msgin)){
						defaultMsg ="That's awesome! actually, I feel the same way too. \n\n";
					}else if(msgin.indexOf("hate you")>-1){
						defaultMsg ="Oh! I am so sorry if I have offended you in any way. \n\n";
					}else if(contains.call(time_pool, msgin)){
						var d = new Date();
						var n = d.getHours();
						if(msgin.indexOf("morning")>-1 || msgin.indexOf("afternoon")>-1 || msgin.indexOf("evening")>-1){
							if(n<12){
								defaultMsg ="Good morning ";
							}else if(n >=12 && n < 17){
								defaultMsg ="Good afternoon ";
							}else{
								defaultMsg ="Good evening ";
							}
							defaultMsg+=" "+senderContext[event.sender.id].firstName+"."
						}else{
							defaultMsg = msgin+" "+senderContext[event.sender.id].firstName;
						}
					}

					sendMessage(event.sender.id, {text: "" + defaultMsg+"This is what I have on my menu "});
					senderContext[event.sender.id].state="begin";
					showMenu(event.sender.id);
				}



			 }else{
				showDefault(event.sender.id);
			 }
			}catch(err){sendMessage(event.sender.id, {text: "Oh! I'm having some problem handling your request"});}
			continue;
		} else if (event.postback) {
			var reply = JSON.stringify(event.postback);
			reply = JSON.parse(reply);
			if(reply.payload=="get_started_button"){
				welcomeUser(event.sender.id);
			}else if(reply.payload=="help_me"){
				if(senderContext[event.sender.id]!=null){
						senderContext[event.sender.id].state = "stop_subject_selection";
						senderContext[event.sender.id].message="false";
						help(event.sender.id,senderContext[event.sender.id].firstName);
				}
			}else if(reply.payload=="about_me"){
				if(senderContext[event.sender.id]!=null){
						senderContext[event.sender.id].message="false";
						senderContext[event.sender.id].state = "stop_subject_selection";						
				}
				about(event.sender.id);
			}else if(reply.payload=="get_assignment_help" || reply.payload=="postback_expertise_request_yes" || (reply.payload=="postback_yes" && senderContext[event.sender.id]!=null && senderContext[event.sender.id].state == "provide_subject")){
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
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].message="false";
					senderContext[event.sender.id].state = "stop_subject_selection";
				}
				showExpertise(event.sender.id);
			}else if(reply.payload=="my_experts"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].message="false";
					senderContext[event.sender.id].state = "stop_subject_selection";
				}
				showExperts(event.sender.id,false,"0");
			}else if(reply.payload=="my_students"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].message="false";
					senderContext[event.sender.id].state = "stop_subject_selection";
				}
				showStudents(event.sender.id,false,"0");
			}else if(reply.payload=="my_reminders"){
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].message="false";
					senderContext[event.sender.id].state = "stop_subject_selection";
				}
				showReminders(event.sender.id);//postback_viewmore_student
			}else if(reply.payload.indexOf("postback_viewmore_student")>-1){
				var id = reply.payload.split("-");
				 page = id[1];
				 showStudents(event.sender.id,false,page);
			}else if(reply.payload.indexOf("postback_viewmore_expert")>-1){
				var id = reply.payload.split("-");
				 page = id[1];
				 showExperts(event.sender.id,false,page);
			}else if(reply.payload.indexOf("postback_viewmore_request")>-1){
				var id = reply.payload.split("-");
				 page = id[1];
				 sub = id[2];
				 checkHelper(sub,event.sender.id,page);
			}else if(reply.payload.indexOf("delete_expertise")>-1){
				var id = reply.payload.split("-");
				 expertiseId = id[1];
				 subject = id[2];
				 removeExpertise(event.sender.id,expertiseId,subject);
			}else if(reply.payload.indexOf("postback_attend_class")>-1){
				var id = reply.payload.split("-");
				 reqId = id[1];
				 subject = id[2];
				 type = id[3];

				 if(type=="type_remind_expert"){
					showExpertDetail(event.sender.id,reqId);
				 }else{
					showStudentDetail(event.sender.id,reqId);
				 }
			}else if(reply.payload.indexOf("show_student_detail")>-1){
				var id = reply.payload.split("-");
				 reqId = id[1];
				 showStudentDetail(event.sender.id,reqId);
			}else if(reply.payload.indexOf("show_expert_detail")>-1){
				var id = reply.payload.split("-");
				 reqId = id[1];
				 showExpertDetail(event.sender.id,reqId);
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
			}else if(reply.payload=="my_home"){				
				if(senderContext[event.sender.id]!=null){
					senderContext[event.sender.id].state = "stop_subject_selection";
					senderContext[event.sender.id].message="false";
				}
				showMenu(event.sender.id);
			}else if(reply.payload=="my_statistics"){
				if(senderContext[event.sender.id]!=null){
						senderContext[event.sender.id].state = "stop_subject_selection";
						senderContext[event.sender.id].message="false";
						showStatistic(event.sender.id,senderContext[event.sender.id].firstName);
				}
			}else if(reply.payload.indexOf("postback_message_yes")>-1){
				var members_id = reply.payload.split("-");
				 fromId = members_id[1];
				 toId = members_id[2];
				 sub= members_id[3];
				 usertype= members_id[4].split(":");
				 expertise_id = usertype[1];
				 usertype=usertype[0];
				 if(senderContext[event.sender.id]!=null){
					 sendBusy(toId,"typing_on");
					 sendMessage(event.sender.id, {text: "Okay then! please type your message "});
					 senderContext[event.sender.id].message="true";
					 senderContext[event.sender.id].userType=usertype;
					 senderContext[event.sender.id].currentExpertise=expertise_id;
					 if(usertype=="expert"){
						 message_count++;
					 }
					 senderContext[event.sender.id].message_from=event.sender.id;
					 senderContext[event.sender.id].conversation_started="true";
					 senderContext[event.sender.id].message_to=toId;
					 senderContext[event.sender.id].message_subject=sub;

				}
			}else if(reply.payload.indexOf("postback_message_no")>-1){
				 if(senderContext[event.sender.id].userType=="expert" && message_count==0){
					currentExpertise = senderContext[event.sender.id].currentExpertise;
					rateOption(event.sender.id,currentExpertise);
				}else{
					sendMessage(event.sender.id, {text: "Alright "+senderContext[event.sender.id].firstName+". This is what I have on my menu"});
					showMenu(event.sender.id);
					senderContext[event.sender.id].state="begin";
				}
			}else if(reply.payload.indexOf("postback_rate_yes")>-1){
				 var members_id = reply.payload.split("-");
				 expId = members_id[1];
				 pickRating(event.sender.id,expId);
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
					showStudents(event.sender.id,false,"0");
				}
			}else if(reply.payload=="postback_tutor_meeting"){
				if(senderContext[event.sender.id]!=null){
					showExperts(event.sender.id,false);
				}
			}else if(reply.payload=="postback_yes_reminder"){
				if(senderContext[event.sender.id]!=null){
					reminderOption(event.sender.id);
				}
			}else if(reply.payload=="postback_just_registered"){
				if(senderContext[event.sender.id]!=null){
					sendMessage(event.sender.id, {text: "Hi "+senderContext[event.sender.id].firstName+", I am excited to have you around "});
					showMenu(event.sender.id);
				}
			}else if(reply.payload=="postback_more_about"){
				showMoreAbout(event.sender.id);
			}else{
				//sendMessage(event.sender.id, {text: reply.payload+" "});
				defaultMsg ="This is what I have on my menu";
				sendMessage(event.sender.id, {text: ""+defaultMsg});
				showMenu(event.sender.id);
			}
			//postback_just_registered
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
            console.log('Error-here: ', response.body.error);
			return false;
        }else{

		}
    });
return true;
}
// Notify message recipient of current user action
function sendBusy(recipientId,type) {
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            sender_action: type,
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
								//messageOption(recipientId,"Do you want to reply this message?",recipientId,thirdParty,subject);
							}
							if(sendMessage(thirdParty, {text: "✔️ "})){
								//messageOption(thirdParty,"Do you want to send another message?",thirdParty,recipientId,subject);
							}
					//	}
						return true;
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


function pickRating(senderId,expertise_id){
	message = {
			"text":"please pick a rating out of 5, with 5 being the highest:",
			"quick_replies":[{
							"content_type":"text",
							"title":"1",
							"payload":"RATING_1-"+expertise_id
							},{
							"content_type":"text",
							"title":"2",
							"payload":"RATING_2-"+expertise_id
							},
							{
							"content_type":"text",
							"title":"3",
							"payload":"RATING_3-"+expertise_id
							},
							{
							"content_type":"text",
							"title":"4",
							"payload":"RATING_4-"+expertise_id
							},
							{
							"content_type":"text",
							"title":"5",
							"payload":"RATING_5-"+expertise_id
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


function endConversation(senderId,msg){
	message = {
			"text":msg,
			"quick_replies":[{
							"content_type":"text",
							"title":"suspend conversation",
							"payload":"END_CONVERSATION"
							}]
		};
sendMessage(senderId,message);
return true;
}





function checkHelper(subject,senderId,page){
	var post_data = querystring.stringify({'facebook_id_not' : senderId,'subject':subject,'page':page});
	request({
			url: backurl+"expertise/getwherenot",
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
				try{
					output = JSON.parse(body);
					if(output.length>0){
							sendMessage(senderId, {text: "Oh! that is nice, I know people that can help you in "+subject+".\n\n"});
							senderContext[senderId].state = "provide_subject_done";

					var total = output.length;
					elementss = new Array();

					if(total>3){
						page++;
					}
					var j=(total>3)?3:total;
					elementss[0]={
							"title":"🎓 "+subject+" request list",
							"subtitle": "Here is what I found",
					};
					//var i=0;
					for(i = 0; i<j ; i++){
					//for(i = 0; i<output.length; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						con="";
						var rating = output[i].rating;
						var totalr = output[i].total_rating;
						if(rating==null || rating=="NULL"){
							rating = 0;
						}

						if(totalr==null || totalr=="NULL"){
							totalr=1;
						}

						rate = Math.round(rating/totalr);
						for(k=0; k<rate; k++){
							con+="🌟";
						}

					elementss[i+1]={
							"title": output[i].name,
							"image_url": output[i].profile_pic,
							"subtitle":  ""+output[i].subject+", "+level+" level \n"+con,
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
                        "template_type": "list",
						"top_element_style": "compact",
                        "elements": elementss,
						"buttons":[{
									"title": (total<4)?"Close":"View More",
									"type": "postback",
									"payload": (total<4)?"postback_no":"postback_viewmore_request-"+page+"-"+subject,
						}]
						}
					}
				};

					sendMessage(senderId,message);

					}else{
						//kindly tell your friends about me so I can render help to more people
						sendMessage(senderId, {text: "Sorry, I don't know anyone that is proficient in "+subject+"\n\n"});						
						senderContext[senderId].state = "stop_subject_selection";
						suggestBooks(senderId,subject);
							//displayExpertiseOption(senderId,"Do you want to try another subject?","yes_no");																		
					}

					}catch(err){
						sendMessage(senderId, {text: "Oh I'm having some problem handling your request"});
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
			sendMessage(fromId, {text: "Oh! I'm having some problem handling your request"});
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
			subject = bodyObject.subject;
			to = bodyObject.to_id;
			name = bodyObject.name;
			reqId = bodyObject.request_id;

			sendMessage(senderId, {text: name+" is now your "+subject+" student."});
			messageOption(senderId,"Would you like to message "+name+"?",senderId,fromId,subject,"student",requestId);

			sendMessage(fromId, {text: senderContext[senderId].firstName+" "+senderContext[senderId].lastName+" has accepted your "+subject+" expertise request. He's now in your tutors list."});
			messageOption(fromId,"Would you like to message "+senderContext[senderId].firstName+"?",fromId,senderId,subject,"expert",requestId);

			var p_data = querystring.stringify({'request_id' : reqId,'status':'completed'});
			submitForm(p_data,backurl+"requests/update",senderId,"update_request2");

		}catch(err){
			sendMessage(senderId, {text: "Oh, I'm having a little problem handling your request"});
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
			sendMessage(senderId, {text:"Oh I'm having a little problem handling your request"});
		}
		}
		});
    return true;
}

function setContext(recipientId) {
		if(senderContext[recipientId] !=null){
			return true;
		}
		request({
			url: 'https://graph.facebook.com/v2.8/'+recipientId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
			method: 'GET'
		}, function(error, response, body) {

        if (error) {
            console.log('Error sending message: ', error);
			return false;
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
			return false;
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
			senderContext[recipientId].message="false";
			senderContext[recipientId].userType="anonymous";
			senderContext[recipientId].conversation_started="false";
            return true;
		}
		});

};

function welcomeUser(recipientId) {

		request({
			url: 'https://graph.facebook.com/v2.8/'+recipientId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
			method: 'GET'
		}, function(error, response, body) {

        if (error) {
            console.log('Error sending message @ welcome user: ', error);
        } else if (response.body.error) {
            console.log('Error: @welcome user', response.body.error);
        }else{
			try{
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
			senderContext[recipientId].userType="anonymous";
			senderContext[recipientId].conversation_started="false";

			//{"first_name":"Adedayo","last_name":"Olubunmi","profile_pic":"https:\/\/scontent.xx.fbcdn.net\/v\/t1.0-1\/180239_1589652066179_7006637_n.jpg?oh=7ca52055172d91e1c914fcd1110d17a6&oe=596F62FA","locale":"en_US","timezone":1,"gender":"male"}
			var post_data = querystring.stringify({
				'facebook_id' : recipientId,
				'name':firstName+" "+lastName,
				'profile_pic':profilePic
			});

			if(firstName!=null){
				submitForm(post_data,backurl+"users/add",recipientId,"add_user");
				//var msg = "Hi "+firstName+"! I am excited to have you around. I can help you get tutors on subjects you need help on. \n\n I can also assist you to render help to people based on your proficiency. \n\n You'll get recognition for that, you know?";
				//sendMessage(recipientId, {text: "" + msg});
				var msg="Hi "+firstName+"! 😃 \nMy name is Surrogate bot, I believe together we can build a stronger learning community on messenger 📖";

				message = {
                "attachment": {
                    "type": "template",
                    "payload": {
						"template_type":"button",
						"text":msg,
                        "buttons": [{
								"type": "postback",
                                "title": "I got it!",
                                "payload": "postback_just_registered",
                                }]
                    }
                }
             };
			sendMessage(recipientId, {text: "" + msg});
				showMenu(recipientId);
			}
            return true;
		}catch(err){
			console.log("Error here @ welcome user");
			sendMessage(recipientId, {text: "Oh I'm having problem handling your request"});
		}
		}

		});

    return true;
}


function showDefault(recipientId) {
		request({
			url: 'https://graph.facebook.com/v2.8/'+recipientId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+process.env.PAGE_ACCESS_TOKEN,
			method: 'GET'
		}, function(error, response, body) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
			try{
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
				defaultMsg ="Hello "+firstName+"!  This is what I have on my menu";
				sendMessage(recipientId, {text: ""+defaultMsg});
				showMenu(recipientId);
			}catch(err){
				console.log("error at show default");
			}
		}
		});

    return true;
}

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
			//shareIt(recipientId);
			sendMessage(recipientId, message);
			return true;
}


function showStatistic(recipientId,name) {
 message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"💡 Surrogate Bot Statistics",
			"image_url": "http://surrogation.com.ng/surrogateapp/image?name="+name,
			"buttons": [{
                      "type": "web_url",
                      "url": "http://surrogation.com.ng/surrogateapp/image?name="+name,
                      "title": "View in full"
                    }]
          } ]
      }
    }
  };
 sendMessage(recipientId, message);
 return true;
}



function about(recipientId) {
	msg="My name is Surrogate, I am an artificial intelligent designed to assist students learn from experts on messenger. \n\n I also allow experts or tutors to render help to people based on their proficiencies.\n\n";
	sendMessage(recipientId, {text:msg});
  message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"💡 Surrogate Bot",
            "subtitle":"Building a stronger learning community.",
			"image_url": "http://surrogation.com.ng/surrogateapp/resources/images/logo.jpg",
            "buttons":[
				{
					"type": "postback",
                    "title": "More",
                    "payload": "postback_more_about"
                },
				{
				  "type": "element_share"
				},
				{
					"type": "postback",
                    "title": "Check it out!",
                     "payload": "postback_no",
                }
            ]
          }
        ]
      }
    }
  };
			sendMessage(recipientId, message);
            return true;
}

function showMoreAbout(recipientId){
				var msg="Surrogate bot is an artificial intelligent designed to assist students learn from experts on messenger. \n\n It also allows experts/tutors to render help to people based on their area of expertise.";
				message = {
                "attachment": {
                    "type": "template",
                    "payload": {
						"template_type":"button",
						"text":msg,
                        "buttons": [{
								"type": "postback",
                                "title": "I got it!",
                                "payload": "postback_no",
                                }]
                    }
                }
             };
			sendMessage(recipientId, message);
}


function help(recipientId,name) {
			msg="Hi "+name+", I am Surrogate, you can use the following commands to communicate with me.\n\n -Type menu to access the main menu.\n\n -Type cancel or exit to cancel current operation. \n\n -Type my expertise to access your subject list. \n\n -Type my tutors to access your tutor list. \n\n -Type my students to access your student list. \n\n -Type my reminders to access your reminder list. \n\n -Type about to know more about me. \n\n -Type statistics to show my current statistics. \n\n Thank you.";
			message = {
                "attachment": {
                    "type": "template",
                    "payload": {
						"template_type":"button",
						"text":msg,
                        "buttons": [{
								"type": "postback",
                                "title": "I got it!",
                                "payload": "postback_no",
                                }]
                    }
                }
             };

			sendMessage(recipientId, message);
            return true;
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

function displayExpertiseOption(recipientId,msg,option_type){
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
                                "payload": "postback_expertise_request_yes",
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


function messageOption(recipientId,msg,fromm,to,subject,usertype,exp_id){
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
                                "payload": "postback_message_yes-"+fromm+"-"+to+"-"+subject+"-"+usertype+":"+exp_id,
                                },
								{
								"type": "postback",
                                "title": "No",
                                "payload": "postback_no"
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

function replyOption(recipientId,msg,fromm,to,subject,fromtype,profilePic){
	message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": msg,
							"image_url": profilePic,
                            "buttons": [{
								"type": "postback",
                                "title": "Reply",
                                "payload": "postback_message_yes-"+fromm+"-"+to+"-"+subject+"-"+fromtype+":0",
                                },
								{
								"type": "postback",
                                "title": "Ignore",
                                "payload": "postback_message_no-"+fromm+"-"+to+"-"+subject,
                                }
								]
                        }]
                    }
                }
            };

		return sendMessage(recipientId, message);
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



function rateOption(fromm,expertise_id){

	var post_data = querystring.stringify({'rated_by' : fromm,'expertise_id':expertise_id});
	request({
			url: backurl+"ratings/get",
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
			if(total<1){
			 message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Do you want to rate this expertise?",
                            "buttons": [{
								"type": "postback",
                                "title": "Yes",
                                "payload": "postback_rate_yes-"+expertise_id,
                                },
								{
								"type": "postback",
                                "title": "No",
                                "payload": "postback_no"
                                }]
                        }]
                    }
                }
            };
			if( senderContext[fromm]!=null){
				senderContext[fromm].state = "rate_expertise";
			}
			sendMessage(fromm, message);
			}else{
				sendMessage(fromm, {text: "Alright "+senderContext[fromm].firstName+". This is what I have on my menu"});
				showMenu(fromm);
				senderContext[fromm].state="begin";
			}
		}
		});

	return true;
}

function getStarted(){
	var message = {
				"get_started":{
						"payload":"get_started_button"
						},
				"greeting":[{
						"locale":"default",
						"text":"Good to have you {{user_first_name}}! I can help you learn from experts or render help to people based on your proficiencies"
						}],
				"target_audience": {
						"audience_type":"all"
					},
					"persistent_menu": [{
						"locale":"default",
						"composer_input_disabled":false,
						"call_to_actions":[
						{
						"title":"🏡 Home",
						"type":"nested",
						"call_to_actions":[
									{
									"type":"postback",
									"title":"✊🏻 Main Menu",
									"payload":"my_home"
									},{
									"type":"postback",
									"title":"💡 About",
									"payload":"about_me"
									},{
									"type":"postback",
									"title":"🙋 Help",
									"payload":"help_me"
									},{
									"type":"postback",
									"title":"💎 Statistics",
									"payload":"my_statistics"
									}]
						},
						{
						"title":"🛂 Dashboard",
						"type":"nested",
						"call_to_actions":[
									{
									"type":"postback",
									"title":"📕 Expertise",
									"payload":"my_expertise"
									},{
									"type":"postback",
									"title":"🚻 Tutors",
									"payload":"my_experts"
									},{
									"type":"postback",
									"title":"🎓 Students",
									"payload":"my_students"
									},
									{
									"type":"postback",
									"title":"⏰ Reminders",
									"payload":"my_reminders"
									}]
								}]
						}]
				};

		request({
        url: 'https://graph.facebook.com/v2.8/1881830615427378/messenger_profile',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: message
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{
					console.log(body);
			}
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
				var exists = (output.status=="ok")?false:true;
				var messg = output.message;
				if(senderContext[userId]!=null){

						if(action=="update_expertise" && !exists){
							senderContext[userId].error = false;
							sendMessage(userId, {text: "I have successfully saved your expertise"});
							displayOption(userId,"Do you want to add another expertise?","yes_no");
							senderContext[userId].state = "expertise_saved";
							return true;
						}

						if(action == "type_expertise"){
							if(!exists){
								sendMessage(userId, {text: "Please select your expertise level in "+senderContext[userId].subject});
								getExpertiseLevel(userId);
								senderContext[userId].state = "type_expertise_done";
							}else{
								if(messg=="limit exceeded"){
									sendMessage(userId, {text: "Sorry, you can not have more than 10 expertise"});
									//getOut(userId);
									senderContext[userId].state = "begin_again";
								}else{
									sendMessage(userId, {text: "You have added this expertise before. Please specify another expertise"});
									getOut(userId);
									senderContext[userId].state = "type_expertise";
								}
							}
							return true;
						}

						if(action == "save_request"){
							if(!exists){
								name = senderContext[userId].firstName + " "+senderContext[userId].lastName;
								subject = senderContext[userId].requestSubject;
								ownerId = senderContext[userId].requestTo;
								requestId = senderContext[userId].expertiseId;
								sendMessage(userId, {text: "I have sent your request. Hopefully, you will get a reply very soon."});
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
							return true;
						}

						if(action=="add_reminder"){
							if(!exists){
								pickTime(userId);
								senderContext[userId].status="pick_reminder_time";
							}else{

								if(messg=="limit exceeded"){
									sendMessage(userId, {text: "Sorry, you can not have more than 10 reminders"});
									senderContext[userId].state = "begin_again";
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
							return true;
						}

						if(action=="update_reminder"){
							sendMessage(userId, {text: "Your reminder has been saved"});
							reminderOptionYesNo(userId);
							return true;
						}

						if(action=="add_rating"){
							sendMessage(userId, {text: "Thanks! your rating has been saved"});
							return true;
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
					sendMessage(recipientId, {text: "📕 Here is your expertise list"});
					for(i = 0; i<output.length; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						con="";
						var rating = output[i].rating;
						var totalr = output[i].total_rating;
						if(rating==null || rating=="NULL"){
							rating = 0;
						}

						if(totalr==null || totalr=="NULL"){
							totalr=1;
						}

						rate = Math.round(rating/totalr);
						for(k=0; k<rate; k++){
							con+="🌟";
						}

						elementss[i]={
							"title": output[i].subject.toUpperCase(),
							"subtitle": level+" level \n\n"+con,
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
					sendMessage(recipientId, {text: "⏰ Here is your class reminder list "});
					try{
					for(i = 0; i<output.length; i++){
						day = output[i].day;//.split("_");
						time = output[i].time;
						rtype =  output[i].type;
						rtype="CLASS WITH: "+output[i].from_name;
						/*
						if(rtype=="type_remind_expert"){
							rtype="Class with: "+output[i].from_name;
						}else{
							rtype="CLASS WITH STUDENT";
						}*/
						if(day!=null){
							day = output[i].day.split("_");
							day=day[1].toLowerCase();
							if(day=="allday"){
								day ="Everyday";
							}
						}else{
							day="";
						}
						if(time!=null){
							//time = output[i].time.toLowerCase();
							time = time.split("_");
							tm=time[2];
							var hr = (hours.indexOf(tm));
							hr = hr+" "+time[3];
							time = hr;
						}else{
							time="";
						}


						elementss[i]={
							"title": output[i].subject.toUpperCase(),
							"subtitle":rtype+"\n\nDAY:"+day+"\n\n TIME:"+time,
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
				sendMessage(recipientId,{text: " Oh! I'm having some problem handling your request"});
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
				sendMessage(recipientId, {text: "I have successfully removed "+subject+"  as one of your expertise  \n\n "});
				showExpertise(recipientId);
			}
		});
}


function removeExpertOrStudent(fromId,senderId,requestId,type){
	if(type=="student"){
		var post_data = querystring.stringify({'expertise_id' : requestId,'from_id':fromId,'special_field':'from_id'});
	}else{
		var post_data = querystring.stringify({'expertise_id' : requestId,'to_id':fromId,'special_field':'to_id'});
	}
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
			sendMessage(fromId, {text: senderContext[senderId].firstName+" "+senderContext[senderId].lastName+" has removed you from his "+subject+" "+type+" list"});
			sendMessage(senderId, {text: name+" has been removed  from your "+subject+" "+type+" list"});
			var p_data = querystring.stringify({'request_id' : reqId});
			var p_data2 = querystring.stringify({'facebook_id':senderId,'expertise_id' : requestId});
			submitForm(p_data,backurl+"requests/remove",senderId,"update_request");
			submitForm(p_data2,backurl+"reminder/remove",senderId,"update_request");
		}catch(err){
			sendMessage(senderId, {text:"Oh! I'm having some problem handling your request"});
		}
		}
		});

    return true;
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


function shareIt(senderId){
	// "type":"element_share"
  message = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Hi Adedayo",
            "subtitle":"I hope you have not forgotten your maths class today",

			    "buttons": [
      {
        "type": "element_share",
        "share_contents": {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [
                {
                  "title": "I took Peter's 'Which Hat Are You?' Quiz",
                  "subtitle": "My result: Fez",
                  "buttons": [
                    {
                      "type": "web_url",
                      "url": "https://m.me/petershats?ref=invited_by_24601",
                      "title": "Take Quiz"
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]

          }
        ]
      }
    }
  };

return sendMessage(message,senderId);
}


function showStudentDetail(toId,request_id){
	var post_data = querystring.stringify({'to_id':toId});
	if(request_id!==false){
		post_data = querystring.stringify({'request_id':request_id,'to_id':toId});
	}

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
					var j=0;
					for(i = 0; i< (total%10); i++){
						j=i;
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
                                "payload": "postback_message_yes-"+output[i].to_id+"-"+output[i].from_id+"-"+output[i].subject+"-student:"+output[i].expertise_id,
                                },{
								"type": "postback",
                                "title": "Remove",
                                "payload": "remove_student-"+output[i].from_id+"-"+output[i].expertise_id,
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

				if(request_id===false){
						//if(sendMessage(toId, {text: "🎓 Here is your student list"})){
							sendMessage(toId,message);
						//}
				}else{
					sendMessage(toId,message);
				}
			  }
			}
		});
}



function showExpertDetail(fromId,request_id){
	var post_data = querystring.stringify({'from_id':fromId,'status':'completed'});
	if(request_id!==false){
		//post_data = querystring.stringify({'request_id':request_id});
		post_data = querystring.stringify({'request_id':request_id,'from_id':fromId});
	}

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
				sendMessage(fromId, {text: error+""});
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
                                "payload": "postback_message_yes-"+output[i].from_id+"-"+output[i].to_id+"-"+output[i].subject+"-expert:"+output[i].expertise_id,
                                },{
								"type": "postback",
                                "title": "Remove",
                                "payload": "remove_expert-"+output[i].to_id+"-"+output[i].expertise_id,
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


					if(request_id==false){
						//if(sendMessage(fromId, {text: "🚻 Here is your expert list"})){
							sendMessage(fromId,message);
						//}
					}else{
						sendMessage(fromId,message);
					}

				}
			}
		});
}

function showStudents(toId,request_id,page){

	var post_data = querystring.stringify({'to_id':toId,'page':page});
	if(request_id!==false){
		post_data = querystring.stringify({'request_id':request_id,'to_id':toId});
	}

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
					if(page>0){
						sendMessage(toId, {text: "Oh! that is all I could find"});
					}else{
						sendMessage(toId, {text: "Oh! your student list is empty"});
					}
				}else{
				if(total>3){
					page++;
				}
					var j=(total>3)?3:total;

					elementss[0]={
							"title":"Hey "+senderContext[toId].firstName,
							"subtitle": "🎓 Here is your student list",
							};

					for(i = 0; i<j ; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						elementss[i+1]={
							"title": output[i].name,
							"image_url": output[i].profile_pic,
							"subtitle": output[i].subject+" student",
							"buttons": [{
										"type": "postback",
										"title": "Show Detail",
										"payload": "show_student_detail-"+output[i].request_id,
										}]
							};
					}

				var buttons = new Array();
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
						"top_element_style": "compact",
                        "elements": elementss,
						"buttons":[{
									"title": (total<4)?"Close":"View More",
									"type": "postback",
									"payload": (total<4)?"postback_no":"postback_viewmore_student-"+page,
						}]
						}
					}
				};

				if(request_id===false){
						//if(sendMessage(toId, {text: "🎓 Here is your student list"})){
							sendMessage(toId,message);
						//}
				}else{
					sendMessage(toId,message);
				}
			  }
			}
		});

}


function showExperts(fromId,request_id,page){
	var post_data = querystring.stringify({'from_id':fromId,'status':'completed','page':page});
	if(request_id!==false){
		//post_data = querystring.stringify({'request_id':request_id});
		post_data = querystring.stringify({'request_id':request_id,'from_id':fromId});
	}

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
				sendMessage(fromId, {text: error+""});
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}else{

				output = JSON.parse(body);
				var total = output.length;
				elementss = new Array();
				if(total<1){
					if(page>0){
						sendMessage(toId, {text: "Oh! that is all I could find"});
					}else{
						sendMessage(fromId, {text: "Oh! your tutor list is empty"});
					}					
				}else{
				if(total>3){
					page++;
				}
					var j=(total>3)?3:total;

					elementss[0]={
							"title":"Hey "+senderContext[fromId].firstName,
							"subtitle": "🚻 Here is your expert list",
							};

					for(i = 0; i<j ; i++){
						level = output[i].level;//.split("_");
						if(level!=null){
							level = output[i].level.split("_");
							level=level[0];
						}else{
							level="";
						}

						elementss[i+1]={
							"title": output[i].name,
							"image_url": output[i].profile_pic,
							"subtitle": output[i].subject+" tutor",
							"buttons": [{
										"type": "postback",
										"title": "Show Detail",
										"payload": "show_expert_detail-"+output[i].request_id,
										}]
							};
					}

				var buttons = new Array();
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
						"top_element_style": "compact",
                        "elements": elementss,
						"buttons":[{
									"title": (total<4)?"Close":"View More",
									"type": "postback",
									"payload": (total<4)?"postback_no":"postback_viewmore_expert-"+page,
						}]
						}
					}
				};

				if(request_id===false){
							sendMessage(fromId,message);
				}else{
					sendMessage(fromId,message);
				}
			  }




			}
		});
}

function suggestBooks(recipientId,subject){	
		var txt ="";
		request({
			url: 'https://www.googleapis.com/books/v1/volumes?q='+subject,
			method: 'GET'
		}, function(error, response, body) {
		
        if (error) {
            console.log('Error sending message @ welcome user: ', error);
        } else if (response.body.error) {
            console.log('Error: @welcome user', response.body.error);
        }else{
			try{
			var resp = JSON.parse(body);
			var items = resp.items;
			var total = items.length;
			
			if(total>2){
				sendMessage(recipientId,{text:"Here are some books I think may interest you.\n I found them in the public domain anyway"});				

				elementss = new Array();
				var j=(total>4)?4:total;
								
				for(var k=0; k<j; k++){
					var info = items[k].volumeInfo;
					var id = items[k].selfLink.split("/");
					id = id[id.length -1];
					url = "https://books.google.com.ng/books?id="+id;
					var img = (info.imageLinks==null)?"":info.imageLinks.thumbnail;
					elementss[k]={
							"title": info.title,
							"image_url": img,
							"subtitle":  ((info.subtitle==null)?"":info.subtitle),
							"buttons": [{
										"type": "web_url",
										"url": url,
										"title": "View Book"
							}]
                       };												
				}
				
				message = {
					"attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
						"top_element_style": "compact",
                        "elements": elementss,
						"buttons":[{
									"title": "Try another subject",
									"type": "postback", 
									"payload":"postback_expertise_request_yes"
						}]
						}
					}
				};
				
				return sendMessage(recipientId,message);
			}else{
				displayExpertiseOption(recipientId,"Do you want to try another subject?","yes_no");
				return false;
			}
			}catch(err){
				displayExpertiseOption(recipientId,"Do you want to try another subject?","yes_no");
				return false;
			}				
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
