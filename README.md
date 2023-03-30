some javascript utility functions

### Date, Time
```javascript
// sql stype date format
console.info(jsetc.toSqlDate(new Date('2023-01-20Z'), true))
// output is '2023-01-20 00:00:01'


// remove continuous spaces
console.info(jsetc.split('123    abc'))
// output is ['123', 'abc' ]

// return just date-time numbers
console.info(jsetc.toDateNums(new Date()))
// output is '20230330205339'


console.info(jsetc.durStr2Ms('1d'))
// output is milliseconds for 1day

console.info(jsetc.durStr2Ms('1h30m'))
// output is milliseconds for 1hour+30minutes
```

### Run programs
```javascript
// get results from running external application 
jsetc.runCmd('ls', ['-al']).then( res => {
    console.info(res)
}).catch(err => {
    console.error(err)
})
// 'ls -al'
```

### random
```javascript
console.info(jsetc.randomInt(0, 10))
// output is 0~9

console.info(jsetc.randomStr(6))
// output is 6 random characters
```

### Size
```javascript
console.info(jsetc.resolveSize('2M'), jsetc.resolveSize('0.5G'))
// output

```