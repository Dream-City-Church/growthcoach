var gcUserJson = loadGrowthCoachUser();
var gcUserGoals = loadGrowthCoachGoals();
var gcNewUserInfo = {};
var currentTab = 0; // Current tab is set to be the first tab (0)
var currentChatHistory=[];
const chatEndpointUrl = 'https://prod-28.southcentralus.logic.azure.com:443/workflows/8897a84bc942409e9d960e0f264d4cef/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=k4_xK1LfAx38_kC_KkKcwiLccqD2niWaVPJZ_bZ754M';


function growthCoachLaunch(action){
    if((gcUserJson == null || gcUserJson == '') & action != 'homeScreen'){
        // New User Page
        document.getElementById("growthcoach").innerHTML = gcNewUserForm;
        showTab(currentTab); // Display the current tab
    }else{
        // Load Main App Page
        var gcHomeLayout = `
            <div id="salutation"><h2>Hi, ${gcUserJson.first_name}!</h2></div>
            <div id="goals-card" class="card"><h3>Your Goals</h3></div>
            <div id="reading-plan-card" class="card"><h3>Reading Plan</h3></div>
            <div id="chat-card" class="card"><div id="chat-card-header" data="up"><span class="arrow up"></span>Chat with Growth Coach<span class="arrow up"></span></div></div>
            `;

        document.getElementById("growthcoach").innerHTML = gcHomeLayout;

        document.getElementById("chat-card-header").addEventListener("click", function(){
            console.log('chat header click detected');
            // if the chat card header has a data value of up
            if(document.getElementById("chat-card-header").getAttribute("data") == "up") {
                startChat('generalChat','I would like to chat. Greet me and ask me about what I would like to discuss.');
                
            } else {
                document.getElementById("chat-card-header").setAttribute("data","up");
                document.getElementById("chat-card").style.bottom = null;
                document.getElementById("chat-card").innerHTML = `<div id="chat-card-header" data="up"><span class="arrow up"></span>Chat with Growth Coach<span class="arrow up"></span></div>`;
            }
        });

        // for each goal, add to the goals card
        var goalsCard = document.getElementById("goals-card");
        gcUserGoals.forEach(function(goal) {
            console.log('adding goal');
            goalsCard.innerHTML += `<div class="goal" id="${goal.goal_id}" class="goal-${goal.goal_id}"><span class="goal-title">${goal.goal_title}</span><br /><span class="goal-checkin">Next check in: ${goal.goal_check_in_days} days</span></div>`;
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
        document.getElementById("chat-card").insertAdjacentHTML("beforeend", `<div id="chatWindow"></div><div id="chatInput"></div>`);
        document.getElementById("chat-card").style.bottom = 0;
    } else {
        document.getElementById("growthcoach").innerHTML += `<div id="chatWindow"></div><div id="chatInput"></div>`;
    }
    var chatWindow = document.getElementById("chatWindow");
    var chatInput = document.getElementById("chatInput");
    

    // Create the chat window
    chatWindow.innerHTML = `
        <div id="chatWindow" style="height: 100%; overflow-y: scroll; overflow-x: hidden;">
            <div id="chatWindowContent" style="display: flex; flex-direction: column;"></div>
        </div>`;

    // Create the chat input and send button
    chatInput.innerHTML = `
        <div id="chatInput" style="display: flex;">
            <input id="chatInputText" style="width: 100%;"/>
            <button id="chatSend" style="width: 100%;">Send</button>
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
        chatWindowContent.innerHTML += `<div style="width: 100%; display: flex; flex-direction: column;">
            <div style="width: 100%; text-align: right;">
                <div class="userChatMessage">
                    ${chatInputTextValue}
                </div>
            </div>
        </div>
        <div id="loading-indicator"></div>`;

        chatWindow.scrollTop = chatWindowContent.scrollHeight;
        
        // Send the chat to the Logic App endpoint
        sendChat(chatInputTextValue,chatType);

        // Clear the chat input text
        chatInputText.value = "";
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
            chatWindowContent.innerHTML += `<div style="width: 100%; display: flex; flex-direction: column;">
                <div style="width: 100%;">
                    <div class="botChatMessage">
                        ${data.response}
                    </div>
                </div>
            </div>`;
            chatWindow.scrollTop = chatWindowContent.scrollHeight;
        }
        if(data.goal_action == "add") {
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
    })
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

    <!-- One "tab" for each step in the form: -->
    <div class="tab"><h3>Some Basic Info</h3>
        <p><input placeholder="First Name" oninput="this.className = ''" name="first_name"></p>
        <p><input placeholder="Last Name" oninput="this.className = ''" name="last_name"></p>
        <p><input placeholder="Email Address" oninput="this.className = ''" name="email_address"></p>
        <p><input placeholder="Phone Number" oninput="this.className = ''" name="phone_number"></p>
        <p><input placeholder="Your age" oninput="this.className = ''" name="age"></p>
    </div>
        
    </div>

    <div class="tab"><h3>What is your gender?</h3>
        <label><input type="radio" value="male" oninput="this.className = ''" name="gender" required>Male</label>
        <label><input type="radio" value="female" oninput="this.className = ''" name="gender">Female</label>
        <label><input type="radio" value="not provided" oninput="this.className = ''" name="gender">Prefer not to answer</label>
    </div>

    <div class="tab"><h3>What is your marital status?</h3>
        <label><input type="radio" value="single" oninput="this.className = ''" name="marital" required>Single</label>
        <label><input type="radio" value="married" oninput="this.className = ''" name="marital">Married</label>
        <label><input type="radio" value="widowed" oninput="this.className = ''" name="marital">Widowed</label>
        <label><input type="radio" value="divorced/seperated" oninput="this.className = ''" name="marital">Divorced/Seperated</label>
    </div>

    <div class="tab"><h3>Do you have any children?</h3>
        <label><input type="checkbox" value="kids under 10" oninput="this.className = ''" name="children" required>Yes, under 10</label>
        <label><input type="checkbox" value="kids 10-18" oninput="this.className = ''" name="children">Yes, 10-18</label>
        <label><input type="checkbox" value="kids out of the house" oninput="this.className = ''" name="children">Yes, out of the house</label>
    </div>

    <div class="tab"><h3>How long have you been a Christian?</h3>
        <label><input type="radio" value="not a Christian" oninput="this.className = ''" name="time_as_christian" required>Not a Christian</label>
        <label><input type="radio" value="less than 1 year" oninput="this.className = ''" name="time_as_christian">Less than 1 year</label>
        <label><input type="radio" value="1-5 years" oninput="this.className = ''" name="time_as_christian">1-5 years</label>
        <label><input type="radio" value="5+ years" oninput="this.className = ''" name="time_as_christian">5+ years</label>
    </div>

    <div class="tab"><h3>How often do you attend church?</h3>
        <label><input type="radio" value="infrequently" oninput="this.className = ''" name="church_attendance" required>Infrequently</label>
        <label><input type="radio" value="a few times a year" oninput="this.className = ''" name="church_attendance">A few times a year</label>
        <label><input type="radio" value="once a month" oninput="this.className = ''" name="church_attendance">Once a month</label>
        <label><input type="radio" value="couple times a month" oninput="this.className = ''" name="church_attendance">Couple times a month</label>
        <label><input type="radio" value="weekly" oninput="this.className = ''" name="church_attendance">Weekly</label>
    </div>

    <div class="tab"><h3>How often do you read the bible?</h3>
        <label><input type="radio" value="infrequently" oninput="this.className = ''" name="bible" required>Infrequently</label>
        <label><input type="radio" value="a few times a year" oninput="this.className = ''" name="bible">A few times a year</label>
        <label><input type="radio" value="once a month" oninput="this.className = ''" name="bible">Once a month</label>
        <label><input type="radio" value="couple times a month" oninput="this.className = ''" name="bible">Couple times a month</label>
        <label><input type="radio" value="weekly" oninput="this.className = ''" name="bible">Weekly</label>
        <label><input type="radio" value="daily" oninput="this.className = ''" name="bible">Daily</label>
    </div>

    <div class="tab"><h3>How often do you pray?</h3>
        <label><input type="radio" value="infrequently" oninput="this.className = ''" name="prayer" required>Infrequently</label>
        <label><input type="radio" value="a few times a year" oninput="this.className = ''" name="prayer">A few times a year</label>
        <label><input type="radio" value="once a month" oninput="this.className = ''" name="prayer">Once a month</label>
        <label><input type="radio" value="couple times a month" oninput="this.className = ''" name="prayer">Couple times a month</label>
        <label><input type="radio" value="weekly" oninput="this.className = ''" name="prayer">Weekly</label>
        <label><input type="radio" value="daily" oninput="this.className = ''" name="prayer">Daily</label>
    </div>

    <div class="tab"><h3>Are you in a small group?</h3>
        <label><input type="radio" value="yes" oninput="this.className = ''" name="small_group" required>Yes</label>
        <label><input type="radio" value="no" oninput="this.className = ''" name="small_group">No</label>
    </div>

    <div class="tab"><h3>Do you serve or volunteer?</h3>
        <label><input type="radio" value="yes" oninput="this.className = ''" name="volunteer" required>Yes</label>
        <label><input type="radio" value="no" oninput="this.className = ''" name="volunteer">No</label>
    </div>

    <div class="tab"><h3>Do you give financially to a church or ministry?</h3>
        <label><input type="radio" value="yes" oninput="this.className = ''" name="give" required>Yes</label>
        <label><input type="radio" value="no" oninput="this.className = ''" name="give">No</label>
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
