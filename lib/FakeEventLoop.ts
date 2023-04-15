import {EventEmitter} from "events";

export class FakeEventLoop {

    event: EventEmitter
    msgQue: any[] = []
    pmResolve: any
    exitLoop = false

    constructor() {
        this.init()
    }
    private init() {
        const evt = new EventEmitter()
        evt.on('evt', msg => {
            // console.log('on msg', msg)
            this.msgQue.push(msg)
            if(this.pmResolve) {
                // console.log('wait resolve')
                const res = this.pmResolve
                this.pmResolve = null
                res(this.msgQue.splice(0))
            }
            // else {
            //     console.info('qlen', this.msgQue.length)
            // }
        })
        this.event = evt
    }

    post(data: any) {
        this.event.emit('evt', data)
    }

    /*loop( msgProc ) {
        (async () =>{
            // let idx=0
            for(;!this.exitLoop;) {
                const pm = new Promise<any[]>((res, rej) =>{
                    if(this.msgQue.length>0) {
                        // console.log('in pm, len', this.msgQue.length)
                        res(this.msgQue.splice(0))
                    } else {
                        this.pmResolve = res;
                    }
                })
                const msgs = await pm;
                console.info('msgs.len', msgs.length)
                // console.info('loop idx:', idx++, qs)
                for(const m of msgs) {
                    await msgProc(m)
                }
            }
        })()
    }*/
    async loop( msgProc ) {
        for(;!this.exitLoop;) {
            const msgs = await new Promise<any[]>((res, rej) =>{
                if(this.msgQue.length>0) {
                    // console.log('in pm, len', this.msgQue.length)
                    res(this.msgQue.splice(0))
                } else {
                    this.pmResolve = res;
                }
            })
            // const msgs = await pm;
            // console.info('msgs.len', msgs.length)
            // console.info('loop idx:', idx++, qs)
            for(const m of msgs) {
                await msgProc(m)
            }
        }
    }
}