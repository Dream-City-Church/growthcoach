export default () => `
    <form id="NewUserForm" action="">

    <!-- One "tab" for each step in the form: -->
    <div class="tab">
    <h2>Hi, I'm your Growth Coach!</h2>
    <p>I'm here to help you grow in your relationship with Jesus Christ. Let's get started!</p>
    <p><input placeholder="First Name" oninput="this.className = ''"></p>
    <p><input placeholder="Last Name" oninput="this.className = ''"></p>
    <p><input placeholder="Email Address" oninput="this.className = ''"></p>
    <p><input placeholder="Phone Number" oninput="this.className = ''"></p>
    </div>

    <div class="tab">
    <p>Nice to meet you! Tell me a little about yourself.</p>
    <p><input type="radio" oninput="this.className = ''" name="Gender"> Male</p>
    <p><input type="radio" oninput="this.className = ''" name="Gender"> Female</p>
    <p><input type="radio" oninput="this.className = ''" name="Gender"> Prefer not to answer</p>
    </div>

    <div class="tab">Birthday:
    <p><input placeholder="dd" oninput="this.className = ''"></p>
    <p><input placeholder="mm" oninput="this.className = ''"></p>
    <p><input placeholder="yyyy" oninput="this.className = ''"></p>
    </div>

    <div class="tab">Login Info:
    <p><input placeholder="Username..." oninput="this.className = ''"></p>
    <p><input placeholder="Password..." oninput="this.className = ''"></p>
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
    </div>

    </form>`;