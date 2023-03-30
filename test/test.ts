import {jsetc} from "../lib";

console.info(jsetc.toSqlDate(new Date('2023-01-20Z'), true))
// output is '2023-01-20 00:00:01'

console.info(jsetc.split('123    abc'))
// output is ['123', 'abc' ]

console.info(jsetc.toDateNums(new Date()))

jsetc.runCmd('ls', ['-al']).then( res => {
    console.info(res)
})
// 'ls -al'

console.info(jsetc.randomInt(0, 10))
// output is 0~9 ( exclude 10 )

console.info(jsetc.randomFloat(0.5, 1))
// output is 0.5~1 ( exclude 1 )

console.info(jsetc.randomStr(6))
// output is 6 random characters

console.info(jsetc.resolveSize('2M'), jsetc.resolveSize('0.5G'))
// output is '2097152 536870912' (2*1024*1024, 0.5*1024*1024*1024)

console.info(jsetc.durStr2Ms('1d'))
// output is milliseconds for 1day

console.info(jsetc.durStr2Ms('1h30m'))
// output is milliseconds for 1hour+30minutes