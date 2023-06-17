some javascript utility functions

### Date, Time
```javascript
// sql stype date format
console.info(toSqlDate(new Date('2023-01-20Z'), true))
// output is '2023-01-20 00:00:01'


// remove continuous spaces
console.info(split('123    abc'))
// output is ['123', 'abc' ]

// return just date-time numbers
console.info(toDateNums(new Date()))
// output is '20230330205339'


console.info(durStr2Ms('1d'))
// output is milliseconds for 1day

console.info(durStr2Ms('1h30m'))
// output is milliseconds for 1hour+30minutes
```

### Run programs
```javascript
// get results from running external application 
runCmd('ls', ['-al']).then( res => {
    console.info(res)
}).catch(err => {
    console.error(err)
})
// 'ls -al'
```

### random
```javascript
console.info(randomInt(0, 10))
// output is 0~9

console.info(randomStr(6))
// output is 6 random characters
```

### Size
```javascript
console.info(resolveSize('2M'), resolveSize('0.5G'))
// output

```

### message queue

```javascript
const msgQue = new MsgQue()
msgQue.start(async msg => {
  if(msg.msgId === 'wait') {
    console.info('wait for duration:', msg.duration)
    await waitSec(msg.duration)
  }
})

msgQue.post( {msgId: 'wait', duration: 1})
msgQue.post( {msgId: 'wait', duration: 2})
msgQue.post( {msgId: 'wait', duration: 3})
msgQue.exit().catch(err => console.error(err))
```
