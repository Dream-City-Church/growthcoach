function testResponseStream(){
    console.log('testResponseStream');
    var responseContainer = document.getElementById('growthcoach-test');

    var endpointURL = 'https://prod-00.southcentralus.logic.azure.com:443/workflows/44987f6adbca47c4ab26ced33c5e4b35/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-h8hwWj6TcWNiuG1xkN116wmBPnqKqtJSeP3NVpPMRg';

    const params = {
    };
    const options = {
        method: 'POST',
        body: JSON.stringify( params ),
        headers: {'Content-Type': 'application/json'}
    };

    fetch(endpointURL, options)
    .then(function (response) {console.log(response.headers);return response.json();})
    .then(function (data) {
        console.log(data);
    })

    /*const response = new EventSource(endpointURL);

    response.onmessage = function(event){
        if (event.data == '[DONE]') {
            response.close();
        } else {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.choices && data.choices.length > 0) {
                if (data.choices[0].delta.content) {
                    console.log(data.choices[0].delta.content);
                    responseContainer.innerHTML += data.choices[0].delta.content;
                }
            }
        }
    };*/
}

window.onload = testResponseStream;