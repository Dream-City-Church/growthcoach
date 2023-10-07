// Create a div element to hold the app content
let appDiv = document.createElement("div");
appDiv.style.backgroundColor = "white";
appDiv.style.width = "100%";
appDiv.style.height = "100%";
appDiv.style.display = "flex";
appDiv.style.flexDirection = "column";
appDiv.style.alignItems = "center";
appDiv.style.justifyContent = "space-between";

// Create a h1 element to display the greeting
let greeting = document.createElement("h1");
greeting.textContent = "Hi, Stephan!";
greeting.style.color = "blue";
greeting.style.fontFamily = "Arial";
greeting.style.fontSize = "36px";
greeting.style.marginTop = "20px";

// Create a ul element to display the check-ins
let checkIns = document.createElement("ul");
checkIns.style.listStyleType = "none";
checkIns.style.padding = "0";
checkIns.style.margin = "0";

// Create an array of check-in dates
let checkInDates = ["October 27", "November 2", "November 8"];

// Loop through the check-in dates and create li elements for each one
for (let date of checkInDates) {
  // Create a li element
  let checkInItem = document.createElement("li");
  checkInItem.style.display = "flex";
  checkInItem.style.alignItems = "center";
  checkInItem.style.marginBottom = "10px";

  // Create a span element to display the date
  let checkInDate = document.createElement("span");
  checkInDate.textContent = date;
  checkInDate.style.color = "blue";
  checkInDate.style.fontFamily = "Arial";
  checkInDate.style.fontSize = "24px";
  checkInDate.style.marginRight = "10px";

  // Create a button element to mark the check-in as done
  let checkInButton = document.createElement("button");
  checkInButton.textContent = "Done";
  checkInButton.style.backgroundColor = "blue";
  checkInButton.style.color = "white";
  checkInButton.style.fontFamily = "Arial";
  checkInButton.style.fontSize = "24px";
  checkInButton.style.borderRadius = "10px";
  checkInButton.style.padding = "5px 10px";

  // Append the date and the button to the li element
  checkInItem.appendChild(checkInDate);
  checkInItem.appendChild(checkInButton);

  // Append the li element to the ul element
  checkIns.appendChild(checkInItem);
}

// Create a p element to display the reading plan
let readingPlan = document.createElement("p");
readingPlan.textContent =
  "Your reading plan for this week is to read the book of Matthew and find a serving opportunity.";
readingPlan.style.color = "blue";
readingPlan.style.fontFamily = "Arial";
readingPlan.style.fontSize = "24px";
readingPlan.style.textAlign = "center";
readingPlan.style.marginBottom = "20px";

// Create an img element to display the logo
let logo = document.createElement("img");
logo.src =
  "[logo]"; // This is the image URL from the image search results
logo.alt =
  "[Growing Together]"; // This is the title from the image search results
logo.width =
  "[200]"; // This is the width of the image from the image search results
logo.height =
  "[200]"; // This is the height of the image from the image search results
logo.style.marginBottom =
  "[20]"; // This is some extra margin for the logo

// Append all the elements to the app div
appDiv.appendChild(greeting);
appDiv.appendChild(checkIns);
appDiv.appendChild(readingPlan);
appDiv.appendChild(logo);

// Append the app div to the body of the document
document.body.appendChild(appDiv);