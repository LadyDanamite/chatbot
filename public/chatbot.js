async function sendMessage(){
       
    //get form input value
    let input = document.getElementById("user-input").value
    console.log(input)
    let button = document.getElementById("send")
    if (button.disabled){
        console.log("Message already sent.")
        return
    }
    if (!input){
        console.log("Please enter some text")
        return
    }
    button.disabled = true;

    //add sent value to chat
    addToChat("User",input)

    //send form input to chat api
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const body = {"message": input}
    const requestOptions ={
        method:"POST",
        headers: myHeaders,
        body: JSON.stringify(body)
    }

    let response = await fetch("http://localhost:3000/chat", requestOptions)
    let result = await response.text()
    addToChat("Bot",result)
    button.disabled = false

    //clear text input
    document.getElementById("user-input").value = ""

    //add response value to chat
    function addToChat(role,input){
            let userOutput = document.createElement("p");
    let userOutputName = document.createElement("strong");
    userOutputName.innerText = role + ": ";
    let userMessage = document.createElement("span");
    userMessage.textContent = input;  
    userOutput.appendChild(userOutputName);
    userOutput.appendChild(userMessage);
    document.getElementById("chat-box").appendChild(userOutput);
    }
}

function handleEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission
        sendMessage()
    }
}


