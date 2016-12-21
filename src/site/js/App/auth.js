
let token = false;
let websocket = new WebSocket('ws://10.0.0.50:1337/ws');

const tokenResp = [];

let player = false;

const ret = {
    onPlayerUpdate: null
};

websocket.onopen = (event) => {
    if (getToken()) {
        send({
            command: 'refresh',
            token: getToken()
        });
    }
};

websocket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    console.log('got msg', msg);

    switch(msg.type) {
        case 'token':
            localStorage.setItem('token', JSON.stringify(msg));
            token = msg;
            tokenResp.forEach((cb) => {
                cb(msg);
                tokenResp.pop();
            });
            break;
        case 'user':
            localStorage.setItem('player', JSON.stringify(msg));
            player = msg;
            if (ret.onPlayerUpdate) {
                ret.onPlayerUpdate(player);
            }
            break;
    }
};

const send = (message, retries = 100) => {
    if (retries == 0) return; //todo: show error message
    try {
        if (websocket.readyState === 1) {
            websocket.send(JSON.stringify(message));
        }
        else {
            throw(new Error("WebSocket is not in OPEN state."));
        }
    }
    catch (e) {
        const mess = websocket.onmessage;
        websocket = new WebSocket('ws://localhost:1337/ws');
        websocket.onmessage = mess;
        setTimeout(() => send(message, retries - 1), 5000);
    }
};

const login = (phone, cb) => {
    tokenResp.push(cb);
    send({
        command: 'login',
        phone: phone
    });
    return (pass) => {
        auth(phone, pass, cb);
    }
};

const auth = (phone, pass, cb) => {
    send({
        command: 'verify',
        phone: phone,
        password: pass
    });
};

const onChange = () => {};

const getToken = () => {
    try {
        return token = token || JSON.parse(localStorage.getItem('token'));
    }
    catch(e) {
        return token;
    }
};

const getPlayer = () => {
    try {
        player = player || JSON.parse(localStorage.getItem('player'));
    }
    catch(e) {
        player;
    }

    if(!player) {
        player = {
            lives: 0,
            score: 0,
            status: 'loading'
        };
    }
    return player;
};

const logout = () => {
    try {
        localStorage.clear();
    }
    finally {
        token = false;
        player = {
            lives: 0,
            score: 0,
            status: 'loading'
        };
    }
};

const loggedIn = () => {
    return !!getToken();
};

const makePayment = (packageId, payToken) => {
    send({
        command: 'pay',
        token: getToken(),
        packageId,
        payToken
    });
};

ret.login = login;
ret.getToken = getToken;
ret.loggedIn = loggedIn;
ret.logout = logout;
ret.makePayment = makePayment;
ret.getPlayer = getPlayer;

export default ret;
