export class MsgQue {
  private exitStatus: boolean
  private events: any[]
  private termObj: object
  private fn: any
  private maxQue: number
  private handler: (evt: any) => Promise<any>
  private termCb: () => void

  /**
   *
   * @param maxQue maximum que size, default is no limit
   */
  constructor( maxQue?: number) {
    this.exitStatus = false
    this.events = []
    this.termObj = {}
    this.maxQue = maxQue

  }

  /**
   * start msq que with handler.
   * @param handler async function handling messages.
   */
  start( handler:(evt: any) => Promise<void>) {
    this.fn = this.generateFunc()
    this.handler = handler
  }

  private async *generateFunc() {
    let exitLoop = false;
    for(;;) {
      for(;!exitLoop;) {
        const evtlist = this.events.splice(0)
        if (evtlist.length <= 0) {
          break;
        }
        // console.log('fetch events, size=%d', evtlist.length)
        for (let ev of evtlist) {
          if (ev == this.termObj) {
            exitLoop = true
            break;
          }
          try {
            await this.handler(ev)
          } catch (err) {
            console.trace(err)
          }
        }
      }

      if(!exitLoop) {
        // console.log('next waiting')
        yield
      } else {
        break;
      }
    }
    // console.log('terminated loop')
    if(this.termCb) {
      this.termCb()
    }
  }


  /**
   * post msg object
   * @param obj
   */
  post(obj: any) {
    if(this.maxQue > 0 && this.events.length > this.maxQue) {
      throw Error('SIZE_LIMIT')
    }
    this.events.push(obj)
    this.fn.next()
  }

  /**
   * terminate msg que.
   */
  exit(): Promise<any> {
    return new Promise((res, rej) => {
      if(this.exitStatus) {
        rej(Error('ALREADY_CLOSING'))
        return;
      }
      this.termCb = () => {
        res(0)
      }
      this.exitStatus = true
      this.events.push(this.termObj)
      this.fn.next()
    })
  }

  /**
   * clear messages from que. Using this function is not recommended except than some special cases.
   */
  clearQueForce() {
    this.events.splice(0)
  }

}
