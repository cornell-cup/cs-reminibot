# React Style Guide

## Comments
1. Each function should have a multiline comment describing what it does.
```javascript
/** Get the messages from the speech recognition service from the
 * backend server.
 */
getSpeechRecognitionData() {
    ..... your code .....
}
```
## Naming conventions
1. Use Camel casing for all names.  Classes should start with an uppercase letter, all other identifiers should start with a lowercase letter.   
```javascript
class CoolBot extends React.Component {
    updateCurrentBot(event) {
        let newBotName = this.oldBotName;
        ..... your code .....
    }
}
```
## Line Length and Spacing
1.  Ensure that all lines are less than 80 characters long.
2.  Long lists of arguments or fields that exceed 80 characters such as:
```javascript
{ property1: value1, property2: value2, property3: value3 .... }

// OR 

<ReactObject props1=value1 props2=values2 props3=value3 ... \>
```

should be formatted vertically as follows:
```javascript
{
  property1: value1,
  property2: value2,
  property2: value3,
  ...
}

// OR

<ReactObject
  props1=value1
  props2=value2
  props2=value3
  ...
\>
```
3. Format promises and callbacks (such as axios requests) as follows:
```javascript
doSomethingAsynchronously()
.then((arg1, arg2) => {
  // do things here with arg1 and arg2
})
.catch( (err) => console.log("Oops"))
```

## Variables
1.  Use `const` to define a variable whose value will not change later on.
2.  Use `let` (not `var`) to define a variable whose value might change later on.  
Take a look at this link to understand this distinction better:
https://www.freecodecamp.org/news/var-let-and-const-whats-the-difference/#:~:text=var%20declarations%20are%20globally%20scoped%20or%20function%20scoped%20while%20let,be%20updated%20nor%20re%2Ddeclared.
