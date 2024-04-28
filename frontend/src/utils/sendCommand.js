export function sendCommand(server, method, mode, params, cb) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method,
            mode,
            params: !!params ? {...params} : {}
        })
    };

    fetch(`${server}/commands`, requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(`Got response for command ${method}: ${JSON.stringify(data)} `);

            if(!data) {
                const message = `Data undefined in response to request for command ${method}`;
                console.log(message);
                //window.alert(message);

                if(cb) {
                    cb(message, undefined);
                }
            } else if(!data.message) {
                const message = `No message in response to request for command ${method}`;
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
            console.log(`Error making command request for ${method} with params ${JSON.stringify(!!params ? {...params} : {})}`);
            console.log(e);
            //window.alert(`Error making command request for ${method}: ${e.toString()}`);

            if(cb) {
                cb(`Error making command request for ${method}: ${e.toString()}`, undefined);
            }
        });
}

export async function sendCommandWithPromise(server, method, mode, params) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method,
                mode,
                params: !!params ? {...params} : {}
            })
        };

        const response = await fetch(`${server}/commands`, requestOptions);
        const data = await response.json();
        console.log(`Got response for command ${method}: ${JSON.stringify(data)} `);

        if(!data) {
            const message = `Data undefined in response to request for command ${method}`;
            console.log(message);
            //window.alert(message);
            return [message, undefined];
        } else if(!data.message) {
            const message = `No message in response to request for command ${method}`;
            console.log(message);
            //window.alert(message);
            return [message, undefined];
        } else {
            return [undefined, data.message];
        }
    } catch(e) {
        console.log(`Error making command request for ${method} with params ${JSON.stringify(!!params ? {...params} : {})}`);
        console.log(e);
        //window.alert(`Error making command request for ${method}: ${e.toString()}`);
        return [`Error making command request for ${method}: ${e.toString()}`, undefined];
    }
}