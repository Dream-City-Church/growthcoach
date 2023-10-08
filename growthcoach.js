/*
Copyright 2023 Dream City Church

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var gcVersion = "2023.42";
var gcUserJson = loadGrowthCoachUser();
var gcUserGoals = loadGrowthCoachGoals();
var gcDailyReflection = JSON.parse(localStorage.getItem("gcDailyReflection"));
var gcNewUserInfo = {};
var currentTab = 0; // Current tab is set to be the first tab (0)
var currentChatHistory=[];
const chatEndpointUrl = 'https://prod-28.southcentralus.logic.azure.com:443/workflows/8897a84bc942409e9d960e0f264d4cef/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=k4_xK1LfAx38_kC_KkKcwiLccqD2niWaVPJZ_bZ754M';

document.getElementById("version-id").innerHTML = gcVersion;

function growthCoachLaunch(action){
    if((gcUserJson == null || gcUserJson == '') & action != 'homeScreen'){
        // New User Page
        document.getElementById("growthcoach").innerHTML = gcNewUserForm;
        document.getElementById("regForm").addEventListener("keypress", function(event){
            if (event.key === "Enter") {
                nextPrev(1);
            }
        }
        );
        showTab(currentTab); // Display the current tab
    }else{
        // Load Main App Page
        var gcHomeLayout = `
            <div id="salutation"><h2>Hi, ${gcUserJson.first_name}!</h2></div><div id="logo-container"><img id="logo" src="./growthcoach-logo-full.png" alt="Growth Coach logo" /></div>
            <div id="goals-card" class="card"><h3>Your Goals</h3></div>
            <div id="daily-reflection-card" class="card"><h3>Daily Reflection</h3><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>
            <div id="spacer-card"></div>
            <div id="chat-card" class="card"><div id="chat-card-header" data="up"><span class="arrow up"></span>Chat with Growth Coach<span class="arrow up"></span></div></div>
            `;

        document.getElementById("growthcoach").innerHTML = gcHomeLayout;

        document.getElementById("chat-card-header").addEventListener("click", function(){
            console.log('chat header click detected');
            // if the chat card header has a data value of up
            if(document.getElementById("chat-card-header").getAttribute("data") == "up") {
                startChat('generalChat','I would like to chat. Greet me and ask me about what I would like to discuss.');
                document.getElementById("chat-card-header").setAttribute("data","down");
            } else {
                document.getElementById("chat-card-header").setAttribute("data","up");
                var arrowUps = document.querySelectorAll('.arrow.down')
                    arrowUps.forEach((arrowUp) => {arrowUp.classList.replace('down','up');})
                document.getElementById("chat-card").style.bottom = null;
                document.getElementById("chatWindow").innerHTML = ``;
            }
        });

        // for each goal, add to the goals card
        var goalsCard = document.getElementById("goals-card");
        gcUserGoals.forEach(function(goal) {
            console.log('adding goal');
            if(goal.goal_status === "active") {
                goalsCard.innerHTML += `<div class="goal" id="${goal.goal_id}" class="goal-${goal.goal_id}"><span class="goal-title">${goal.goal_title}</span><br /><span class="goal-checkin">Next check in: ${goal.goal_check_in_days} days</span></div>`;
            }
        });


        // add event listener to each goal to detect click
        var goals = document.querySelectorAll('.goal');

        goals.forEach(function(goal) {
            goal.addEventListener('click', function() {
                console.log('goal click detected');
                var goalTitle = goal.querySelector('.goal-title').innerHTML;
                startChat('goalCheckin','I would like to chat about my previously set goal of '+goalTitle+'. Ask me what I would like to discuss about the goal.');
            });
        });

        // load daily reflection
        dailyReflection();
    }
}

function loadGrowthCoachUser(){
    if(localStorage.getItem("gcUser") == null){
        return null;
    } else {
        // Load from local storage and convert string to JSON
        return JSON.parse(localStorage.getItem("gcUser"));
    }
}

function saveGrowthCoachUser(gcUserJSON){
    // Convert JSON to String and save to localStorage
    localStorage.setItem("gcUser", JSON.stringify(gcUserJSON));
    loadGrowthCoachUser();
}

function loadGrowthCoachGoals() {
    if(localStorage.getItem("gcGoals") == null){
        return [];
    } else {
        // Load from local storage and convert string to JSON
        return JSON.parse(localStorage.getItem("gcGoals"));
    }
}

function saveGrowthCoachGoals(gcGoalsToSave) {
    localStorage.setItem("gcGoals", JSON.stringify(gcGoalsToSave));
}

function growthCoachGoals(goalActionType,goalArray) {
    if(goalActionType == "add") {
        // merge values from goalArray into gcUserGoals
        gcUserGoals = gcUserGoals.concat(goalArray);
        saveGrowthCoachGoals(gcUserGoals);
    } else if(goalActionType == "edit") {
    } else if(goalActionType == "complete") {
        console.log('complete goal id: '+goalArray);
        const index = gcUserGoals.map(id => id.goal_id).indexOf(goalArray);
        if(index > -1) {
            gcUserGoals.splice(index,1);
            document.querySelector('[id="'+goalArray+'"]').remove();
        }
        saveGrowthCoachGoals(gcUserGoals);
    } else if(goalActionType == "delete") {
    }
}

// Create a chat window that shows sent and received chats, with a text box to send a chat to a Logic App endpoint
function startChat(chatType,chatMessage){
    console.log('startChat');
    if(document.getElementById("chat-card")) {
        var arrowUps = document.querySelectorAll('.arrow.up')
        arrowUps.forEach((arrowUp) => {arrowUp.classList.replace('up','down');})
        document.getElementById("chat-card-header").setAttribute("data","down");
        document.getElementById("chat-card").insertAdjacentHTML("beforeend", `<div id="chatWindow" style="overflow-y: scroll; overflow-x: hidden;"></div><div id="chatInput"></div>`);
        document.getElementById("chat-card").style.bottom = 0;
    } else {
        document.getElementById("growthcoach").innerHTML += `<div id="chatWindow" style="overflow-y: scroll; overflow-x: hidden;"></div><div id="chatInput"></div>`;
    }
    var chatWindow = document.getElementById("chatWindow");
    var chatInput = document.getElementById("chatInput");
    

    // Create the chat window
    chatWindow.innerHTML = `
        <div id="chatWindowContent" style="display: flex; flex-direction: column;"><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>`;

    // Create the chat input and send button
    chatInput.innerHTML = `
        <div id="chatInput" style="display: flex;">
            <input id="chatInputText" />
            <button id="chatSend" >Send</button>
        </div>`;

    var chatSend = document.getElementById("chatSend");
    
    // Send initial chat summary to ChatGPT
    if(!chatMessage) {
        sendChat("",chatType);
    } else {
        sendChat(chatMessage,chatType);
    }

    // Add an event listener to the send button
    chatSend.addEventListener("click", function(){
        console.log('send button click detected');
        var chatInputText = document.getElementById("chatInputText");
        var chatWindowContent = document.getElementById("chatWindowContent");
        var chatInputTextValue = chatInputText.value;

        // Add the chat to the chat window
        chatWindowContent.insertAdjacentHTML("beforeend",`<div style="width: 100%; display: flex; flex-direction: column;">
        <div style="width: 100%; text-align: right;">
            <div class="userChatMessage">
                ${chatInputTextValue}
            </div>
        </div>
    </div>
    <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`) ;

        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        // Send the chat to the Logic App endpoint
        sendChat(chatInputTextValue,chatType);

        // Clear the chat input text
        chatInputText.value = "";
    });
    chatInputText.addEventListener("keypress", function(event){
        if (event.key === "Enter") {
            console.log('send button click detected');
            var chatInputText = document.getElementById("chatInputText");
            var chatWindowContent = document.getElementById("chatWindowContent");
            var chatInputTextValue = chatInputText.value;

            // Add the chat to the chat window
            chatWindowContent.insertAdjacentHTML("beforeend",`<div style="width: 100%; display: flex; flex-direction: column;">
            <div style="width: 100%; text-align: right;">
                <div class="userChatMessage">
                    ${chatInputTextValue}
                </div>
            </div>
        </div>
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`) ;

            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            // Send the chat to the Logic App endpoint
            sendChat(chatInputTextValue,chatType);

            // Clear the chat input text
            chatInputText.value = "";
        }
    });


}

function sendChat(chatInputTextValue,chatType) {
    console.log('sendChat');
    //update chat history
    if(chatInputTextValue != "") {
        currentChatHistory.push({"content":chatInputTextValue,"role":"user"});
    }

    if(!gcUserJson) {
        var userInfo = gcNewUserInfo;
    } else {
        var userInfo = gcUserJson;
    }

    const params = {
        "chatHistory": currentChatHistory,
        "gcUser": userInfo,
        "gcGoals": gcUserGoals,
        "chatType": chatType
    };
    const options = {
        method: 'POST',
        body: JSON.stringify( params ),
        headers: {'Content-Type': 'application/json'}
    };
    fetch(chatEndpointUrl,options)
    .then(response => response.json())
    .then(function (data) {
        if(data.status=="ok"){
            //update chat history
            currentChatHistory.push({"content":data.response,"role":"assistant"});
            //update chat window
            var chatWindowContent = document.getElementById("chatWindowContent");
            document.querySelector('.lds-ellipsis').remove();
            chatWindowContent.insertAdjacentHTML("beforeend",`<div style="width: 100%; display: flex; flex-direction: column;">
            <div style="width: 100%;">
                <div class="botChatMessage">
                    ${data.response}
                </div>
            </div>
        </div>`);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        if(data.goal_action == "add") {
            console.log('add goal detected');
            // save goals to localStorage
            growthCoachGoals("add",data.function_data);

            // remove chat input window and replace with close button
            document.getElementById("chatInput").innerHTML = `<button id="chatClose" style="width: 100%;">Close</button>`;
            
            // add event listener onto close button
            var chatClose = document.getElementById("chatClose");
            chatClose.addEventListener("click", function(){
                console.log('close button click detected');
                // remove chat window

                growthCoachLaunch('homeScreen');
            });
        }

        if(data.goal_action == "complete") {
            console.log('complete goal detected');
            console.log(data.function_data);
            // save goals to localStorage
            growthCoachGoals("complete",data.function_data);
        }
    })
}

function dailyReflection() {
    // Check if saved daily reflection is expired
    if(gcDailyReflection) {
        console.log("daily reflection exists");
        var now = new Date();
        var savedDate = new Date(gcDailyReflection.date);
        var timeDiff = Math.abs(now.getTime() - savedDate.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        if(diffDays > 1) {
            console.log("daily reflection expired");
            gcDailyReflection = null;
        } else {
            console.log("load existing daily reflection");
            document.querySelector('.lds-ellipsis').remove();
            document.getElementById("daily-reflection-card").insertAdjacentHTML("beforeend",`<div id="bible-passage"><a href="https://www.biblegateway.com/passage/?search=${gcDailyReflection.bible_passage}" target="_blank">${gcDailyReflection.bible_passage}</a></div><div id="passage_summary">${gcDailyReflection.passage_summary}</div><div id="passage_question">${gcDailyReflection.passage_question}</div><div id="reflection">${gcDailyReflection.reflection}</div>`);
        }
    }

    // If no saved daily reflection, get a new one
    if(!gcDailyReflection) {
        console.log("get new daily reflection");
        const params = {
            "gcUser": gcUserJson
        };
        const options = {
            method: 'POST',
            body: JSON.stringify( params ),
            headers: {'Content-Type': 'application/json'}
        };
        fetch('https://prod-21.southcentralus.logic.azure.com:443/workflows/91f5f34d292c414d928a1dbddaca81bc/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=o4ykTTiMZCmd_HFW4oCJK7PaAmOlfIA1b17alZcibrY',options)
        .then(response => response.json())
        .then(function (data) {
            if(data.status=="ok"){
                console.log("load new daily reflection")
                console.log(data);
                // Save daily reflection to localStorage
                gcDailyReflection = {
                    "date": new Date(),
                    "bible_passage": data.bible_passage,
                    "passage_summary": data.passage_summary,
                    "passage_question": data.passage_question,
                    "reflection": data.reflection
                };
                localStorage.setItem("gcDailyReflection", JSON.stringify(gcDailyReflection));
                document.querySelector('.lds-ellipsis').remove();
                document.getElementById("daily-reflection-card").insertAdjacentHTML("beforeend",`<div id="bible-passage"><a href="https://www.biblegateway.com/passage/?search=${data.bible_passage}" target="_blank">${data.bible_passage}</a></div><div id="passage_summary">${data.passage_summary}</div><div id="passage_question">${data.passage_question}</div><div id="reflection">${data.reflection}</div>`);
            }
        })
    }
}


// Next/previous controls
function showTab(n) {
    // This function will display the specified tab of the form ...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    // ... and run a function that displays the correct step indicator:
    fixStepIndicator(n)
    }

    function nextPrev(n) {
        // This function will figure out which tab to display
        var x = document.getElementsByClassName("tab");
        // Exit the function if any field in the current tab is invalid:
        if (n == 1 && !validateForm()) return false;
        // Hide the current tab:
        x[currentTab].style.display = "none";
        // Increase or decrease the current tab by 1:
        currentTab = currentTab + n;
        // if you have reached the end of the form... :
        if (currentTab >= x.length) {
            //...the form gets submitted:
            //document.getElementById("regForm").submit();

            // Save the form data to localStorage
            var form = document.getElementById("regForm");
            var elements = form.elements;
            var formObj ={};
            for(var i = 0 ; i < elements.length ; i++){
                var item = elements.item(i);
                if (item.type === 'radio') {
                    if (item.checked === true) {
                        // get value, set checked flag or do whatever you need to
                        formObj[item.name] = item.value;
                    }
                } else {
                    formObj[item.name] = item.value;
                }
            }

            //Save to localStorage
            saveGrowthCoachUser(formObj);
            gcNewUserInfo = formObj;
            gcUserJson = formObj;
            document.getElementById('growthcoach').innerHTML = "";
            startChat('newUser');
            
            return false;
        }
        // Otherwise, display the correct tab:
        showTab(currentTab);
    }

    function validateForm() {
    // This function deals with validation of the form fields
    var x, y, i, valid = true;
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");
    // A loop that checks every input field in the current tab:
    for (i = 0; i < y.length; i++) {
        // If a field is empty...
        if (y[i].value == "") {
        // add an "invalid" class to the field:
        y[i].className += " invalid";
        // and set the current valid status to false:
        valid = false;
        }
    }
    // If the valid status is true, mark the step as finished and valid:
    if (valid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid; // return the valid status
    }

    function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class to the current step:
    x[n].className += " active";
    }
//

var gcNewUserForm = `
    <form id="regForm" action="">

    <div class="tab"><h2>Hi, I'm Growth Coach!</h2>
        <img id="logo-welcome" src="./growthcoach-logo-full.png" alt="Growth Coach logo" />
        <p>I'm here to help you grow in your faith. Let's get to know each other a little better.</p>
        <p>Answer as best as you can. I'll use your answers to build a custom plan for you.</p>
        </div>

    <!-- One "tab" for each step in the form: -->
    <div class="tab"><h3>Let's start with some basic information</h3>
        <p><input placeholder="First Name" oninput="this.className = ''" name="first_name"></p>
        <p><input placeholder="Last Name" oninput="this.className = ''" name="last_name"></p>
        <p><input placeholder="Email Address" oninput="this.className = ''" name="email_address"></p>
        <p><input placeholder="Phone Number" oninput="this.className = ''" name="phone_number"></p>
        <p><input placeholder="Your age" oninput="this.className = ''" name="age"></p>
    </div>
        
    </div>

    <div class="tab"><h3>What is your gender?</h3>
        <input type="radio" id="gender-male" value="male" oninput="this.className = ''" name="gender" required><label for="gender-male">Male</label>
        <input type="radio" id="gender-female" value="female" oninput="this.className = ''" name="gender"><label for="gender-female">Female</label>
        <input type="radio" id="gender-none" value="not provided" oninput="this.className = ''" name="gender"><label for="gender-none">Prefer not to answer</label>
    </div>

    <div class="tab"><h3>What is your marital status?</h3>
        <input id="marital-single" type="radio" value="single" oninput="this.className = ''" name="marital" required><label for="marital-single">Single</label>
        <input id="marital-married" type="radio" value="married" oninput="this.className = ''" name="marital"><label for="marital-married">Married</label>
        <input id="marital-widowed" type="radio" value="widowed" oninput="this.className = ''" name="marital"><label for="marital-widowed">Widowed</label>
        <input id="marital-divorced" type="radio" value="divorced/seperated" oninput="this.className = ''" name="marital"><label for="marital-divorced">Divorced/Seperated</label>
    </div>

    <div class="tab"><h3>Do you have any children?</h3>
        <p>You can select multiple options.</p>
        <input id="children-under10" type="checkbox" value="kids under 10" oninput="this.className = ''" name="children" required><label for="children-under10">Yes, under 10</label>
        <input id="children-10to18" type="checkbox" value="kids 10-18" oninput="this.className = ''" name="children"><label for="children-10to18">Yes, 10-18</label>
        <input id="children-older" type="checkbox" value="kids out of the house" oninput="this.className = ''" name="children"><label for="children-older">Yes, out of the house</label>
    </div>

    <div class="tab"><h3>How long have you been a Christian?</h3>
        <input id="christian-1" type="radio" value="not a Christian" oninput="this.className = ''" name="time_as_christian" required><label for="christian-1">Not a Christian</label>
        <input id="christian-2" type="radio" value="less than 1 year" oninput="this.className = ''" name="time_as_christian"><label for="christian-2">Less than 1 year</label>
        <input id="christian-3" type="radio" value="1-5 years" oninput="this.className = ''" name="time_as_christian"><label for="christian-3">1-5 years</label>
        <input id="christian-4" type="radio" value="5+ years" oninput="this.className = ''" name="time_as_christian"><label for="christian-4">5+ years</label>
    </div>

    <div class="tab"><h3>How often do you attend church?</h3>
        <input id="church-1" type="radio" value="infrequently" oninput="this.className = ''" name="church_attendance" required><label for="church-1">Infrequently</label>
        <input id="church-2" type="radio" value="a few times a year" oninput="this.className = ''" name="church_attendance"><label for="church-2">A few times a year</label>
        <input id="church-3" type="radio" value="once a month" oninput="this.className = ''" name="church_attendance"><label for="church-3">Once a month</label>
        <input id="church-4" type="radio" value="couple times a month" oninput="this.className = ''" name="church_attendance"><label for="church-4">Couple times a month</label>
        <input id="church-5" type="radio" value="weekly" oninput="this.className = ''" name="church_attendance"><label for="church-5">Weekly</label>
    </div>

    <div class="tab"><h3>How often do you read the bible?</h3>
        <input id="bible-1" type="radio" value="infrequently" oninput="this.className = ''" name="bible" required><label for="bible-1">Infrequently</label>
        <input id="bible-2" type="radio" value="a few times a year" oninput="this.className = ''" name="bible"><label for="bible-2">A few times a year</label>
        <input id="bible-3" type="radio" value="once a month" oninput="this.className = ''" name="bible"><label for="bible-3">Once a month</label>
        <input id="bible-4" type="radio" value="couple times a month" oninput="this.className = ''" name="bible"><label for="bible-4">Couple times a month</label>
        <input id="bible-5" type="radio" value="weekly" oninput="this.className = ''" name="bible"><label for="bible-5">Weekly</label>
        <input id="bible-6" type="radio" value="daily" oninput="this.className = ''" name="bible"><label for="bible-6">Daily</label>
    </div>

    <div class="tab"><h3>How often do you pray?</h3>
        <input id="prayer-1" type="radio" value="infrequently" oninput="this.className = ''" name="prayer" required><label for="prayer-1">Infrequently</label>
        <input id="prayer-2" type="radio" value="a few times a year" oninput="this.className = ''" name="prayer"><label for="prayer-2">A few times a year</label>
        <input id="prayer-3" type="radio" value="once a month" oninput="this.className = ''" name="prayer"><label for="prayer-3">Once a month</label>
        <input id="prayer-4" type="radio" value="couple times a month" oninput="this.className = ''" name="prayer"><label for="prayer-4">Couple times a month</label>
        <input id="prayer-5" type="radio" value="weekly" oninput="this.className = ''" name="prayer"><label for="prayer-5">Weekly</label>
        <input id="prayer-6" type="radio" value="daily" oninput="this.className = ''" name="prayer"><label for="prayer-6">Daily</label>
    </div>

    <div class="tab"><h3>Are you in a small group?</h3>
        <input id="group-1" type="radio" value="yes" oninput="this.className = ''" name="small_group" required><label for="group-1">Yes</label>
        <input id="group-2" type="radio" value="no" oninput="this.className = ''" name="small_group"><label for="group-2">No</label>
    </div>

    <div class="tab"><h3>Do you serve or volunteer?</h3>
        <input id="volunteer-1" type="radio" value="yes" oninput="this.className = ''" name="volunteer" required><label for="volunteer-1">Yes</label>
        <input id="volunteer-2" type="radio" value="no" oninput="this.className = ''" name="volunteer"><label for="volunteer-2">No</label>
    </div>

    <div class="tab"><h3>Do you give financially to a church or ministry?</h3>
        <input id="give-1" type="radio" value="yes" oninput="this.className = ''" name="give" required><label for="give-1">Yes</label>
        <input id="give-2" type="radio" value="no" oninput="this.className = ''" name="give"><label for="give-2">No</label>
    </div>

    <div style="overflow:auto;">
    <div style="float:right;">
        <button type="button" id="prevBtn" onclick="nextPrev(-1)">Previous</button>
        <button type="button" id="nextBtn" onclick="nextPrev(1)">Next</button>
    </div>
    </div>

    <!-- Circles which indicates the steps of the form: -->
    <div style="text-align:center;margin-top:40px;">
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    </div>

    </form>`;

window.onload = growthCoachLaunch;
