/* Non-SSL is simply App() */

import uWebSockets from "uWebSockets.js"
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

export class App{
    public app = uWebSockets.App();
    public ws: any;
    public clients: number = 0;
    constructor() {

        this.ws = this.app.ws('/*', {
            /* There are many common helper features */
            compression: uWebSockets.SHARED_COMPRESSOR,
            maxPayloadLength: 16 * 1024 * 1024,
            idleTimeout: 1800,

            open: (ws) => {
                this.clients++;
                console.log(`connections`, this.clients);
            },

            close: () => {
                this.clients--;
            },

            /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
            message: (ws, message, isBinary) => {

                /* Here we echo the message back, using compression if available */
                // let ok = ws.send(message, isBinary, true);
                let json = JSON.parse(decoder.write(Buffer.from(message)));
                switch (json.action){
                    case 'join':
                        ws.subscribe(json.room);
                        break;
                    case 'publish':
                        ws.publish(json.room,json.message);
                        break;
                    case 'leave':
                        ws.unsubscribe(json.room);
                        break;
                }

                console.log(json);
            }
        });

        this.start();



    }
    private start()
    {
        this.ws.listen(9001, (listenSocket: any) => {
            if (listenSocket) {
                console.log('Listening to port 9001');
            }
        });
    }
}

export default new App();