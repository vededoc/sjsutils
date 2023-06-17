import {
    split,
    toDateNums,
    toSqlDate,
    runCmd,
    randomInt,
    randomStr,
    randomFloat,
    resolveSize,
    durStr2Ms,
    resolveDayTime, resolveFile, osRelease, dateDiff, waitSec
} from "../lib";
import {MsgQue} from "../lib/MsgQue";

console.info(toSqlDate(new Date('2023-01-20Z'), true))
// output is '2023-01-20 00:00:01'

console.info(split('123    abc'))
// output is ['123', 'abc' ]

console.info(toDateNums(new Date()))

runCmd('ls', ['-al']).then( res => {
    console.info(res)
})
// 'ls -al'

console.info(randomInt(0, 10))
// output is 0~9 ( exclude 10 )

console.info(randomFloat(0.5, 1))
// output is 0.5~1 ( exclude 1 )

console.info(randomStr(6))
// output is 6 random characters

console.info(resolveSize('2M'), resolveSize('0.5G'))
// output is '2097152 536870912' (2*1024*1024, 0.5*1024*1024*1024)

console.info(durStr2Ms('1d'))
// output is milliseconds for 1day

console.info(resolveDayTime('1h30m'))
// output is milliseconds for 1hour+30minutes

console.info( resolveFile('/usr/bin/ls') )
// output is 'ext'
dateDiff(new Date(), new Date())
osRelease().then( res => console.info('os info:', res))

{
    const mq = new MsgQue()
    mq.start(async evt => {
        if(evt == 1) {
            console.info('event 1')
            mq.post(2)
            mq.post(2)
            mq.post(2)
            await waitSec(1)
        } else if(evt == 2) {
            console.info('event 2')
            mq.post(3)
            await waitSec(0.5)
        } else if(evt == 3) {
            console.info('event 3')
        } else if(evt.type == 'chunk') {
            console.info('chunk evt')
        }
        else {
            console.error('### unknown event')
        }
    })
    mq.post(1)
    const evt = new Event('chunk')
    mq.post(evt)
    mq.exit().then(res => {
        console.info('mq terminated')
    }).catch(err => {
        console.error(err)
    })
}
