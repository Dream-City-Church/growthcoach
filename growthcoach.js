var gcUserJson = loadGrowthCoachUser();
var currentTab = 0; // Current tab is set to be the first tab (0)



function growthCoachLaunch(){
    if(gcUserJson == null){
        // New User Page
        document.getElementById("growthcoach").innerHTML = gcNewUserForm;
        showTab(currentTab); // Display the current tab
    }else{
        // Load Main App Page
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
                formObj[item.name] = item.value;
            }

            //Save to localStorage
            saveGrowthCoachUser(formObj);
            
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
    </div>

    </form>`;


window.onload = growthCoachLaunch;
