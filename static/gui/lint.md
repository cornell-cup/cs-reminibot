# All about linting and prettier

## 1. How to run
- To run eslint on a project, run ```npm run lint```.
- Then run ```npm run format``` to fix the formatting according to prettier configurations.
 
The configuration for eslint is in .eslintrc.js. The configuration for the format is in .prettierrc.
The format of eslint and prettier confict for some rules, so after running ```npm run format``` you want to save without formatting. To do that on mac, you want to do (command + k, s). For windows, someone else can add the command to this guide.

Additional npm linting and prettier scripts can be added under package.json "scripts" section.

## 2. Common Issues and Fix

### 1. Missing props validation.
This error occurs when you have not introduced the types of the props that are being used in the body of a component. 
Follow these steps to fix:
1. Add PropTypes import ```import PropTypes from 'prop-types';```
2. Replace the names in the brackets in this code block with the appropriate names.
```
<ComponentName>.propTypes = {
  <nameOfProp>: PropTypes.<type>.isRequired,
  ...
}
```

### 2. Property not defined in the returned HTML.
I am not too sure how to fix this since I think some properties such as "time" in <li> element is custom imported. (See Chatbot2.js) Hence eslint complains about the property not being defined because native <li> element does not have such property.

For now, a temporary fix is too disable eslint on the line with this error. Please make sure that your code is absolutely correct before you do this. If so, add this code line **before** the problematic line.
```{/*eslint-disable-next-line*/}```
