export function getStatus(server, method, params, cb) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method,
            params: !!params ? {...params} : {}
        })
    };

    fetch(`${server}/status`, requestOptions)
        .then(response => response.json())
        .then(data => {
            //console.log(`Got status for ${method}: ${JSON.stringify(data)} `);

            if(!data) {
                const message = `Data undefined in response to request for status ${method}`;
                console.log(message);
                //window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else if(!data.message) {
                const message = `No message in response to request for status ${method}`;
                console.log(message);
                //window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else {
                if(cb) {
                    cb(undefined, data.message);
                }
            }
        })
        .catch(e => {
            console.log(`Error making status request for ${method} with params ${JSON.stringify(!!params ? {...params} : {})}`);
            console.log(e);
            //window.alert(`Error making status request for ${method}: ${e.toString()}`);

            if(cb) {
                cb(`Error making status request for ${method}: ${e.toString()}`, undefined);
            }
        });
}

export function getStatusWithoutLoggingData(server, method, params, cb) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method,
            params: !!params ? {...params} : {}
        })
    };

    fetch(`${server}/status`, requestOptions)
        .then(response => response.json())
        .then(data => {
            //console.log(`Got status for ${method} `);

            if(!data) {
                const message = `Data undefined in response to request for status ${method}`;
                console.log(message);
                //window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else if(!data.message) {
                const message = `No message in response to request for status ${method}`;
                console.log(message);
                //window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else {
                if(cb) {
                    cb(undefined, data.message);
                }
            }
        })
        .catch(e => {
            console.log(`Error making status request for ${method} with params ${JSON.stringify(!!params ? {...params} : {})}`);
            console.log(e);
            //window.alert(`Error making status request for ${method}: ${e.toString()}`);

            if(cb) {
                cb(`Error making status request for ${method}: ${e.toString()}`, undefined);
            }
        });
}

export function getStatusWithoutAlert(server, method, params, cb) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method,
            params: !!params ? {...params} : {}
        })
    };

    fetch(`${server}/status`, requestOptions)
        .then(response => response.json())
        .then(data => {
            //console.log(`Got status for ${method}: ${JSON.stringify(data)} `);

            if(!data) {
                const message = `Data undefined in response to request for status ${method}`;
                console.log(message);
                // window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else if(!data.message) {
                const message = `No message in response to request for status ${method}`;
                console.log(message);
                // window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else {
                if(cb) {
                    cb(undefined, data.message);
                }
            }
        })
        .catch(e => {
            console.log(`Error making status request for ${method} with params ${JSON.stringify(!!params ? {...params} : {})}`);
            console.log(e);
            // window.alert(`Error making status request for ${method}: ${e.toString()}`);

            if(cb) {
                cb(`Error making status request for ${method}: ${e.toString()}`, undefined);
            }
        });
}
