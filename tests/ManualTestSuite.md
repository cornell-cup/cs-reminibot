# Manual Test Suite
Please manually execute these tests before merging any PR.

## Initial Setup
1. Run `./run_BS.sh` to start the Basestation.  Wait for the green `[built]` message to show up to indicate webpack has compiled the Javascript files.
2. Go to `localhost:8080/start` in your browser and press `ctrl + shift + R` or `command + shift + R` to refresh your browser by bypassing the cache.  This will ensure that your Javascript files are up to date.

## Minibot Connection. (Setup/Control)
### Single Minibot Test
1. Run `python3 minibot.py -t` to start a virtual minibot.
2. Click on the *Available Bots* dropdown list, and verify that a minibot name is listed.  
3. Click on the *forward* movement button and verify that a popup message shows up telling you to connect to a Minibot
4. Click *Add Bot* and verify that *Connected to: <name_of_the_minibot>* is displayed.
5. Kill the basestation.  Verify that *S* (stop) is printed repeatedly in the *minibot.py* terminal.  Verify that after a short while *Broadcasting message to basestation* is printed repeatedly to the *minibot.py* terminal.
6. Restart the basestation and verify that you are able to connect to the minibot via the WebGUI again (as you did in steps 1-3).
7. Kill the *minibot.py* program and verify that you no longer see that you're connected to a minibot in the WebGUI.
8. Restart the *minibot.py* program and verify that you are able to connect to the minibot again.

### Multiple Minibot Test
1. Run `python3 minibot.py -t` to start a virtual minibot.
2. Run `python3 minibot.py -t -p 9000` to start another virtual minibot on port 9000 (you can choose any random port).
3. Click on the *Available Bots* dropdown menu and verify that both minibot names are listed.
4. Verify that you can connect to either minibot.
5. Kill one of the minibots and verify that the *Available Bots* dropdown menu now only has one minibot name.

## Basic Commands (Setup/Control)
### Movement Test
1. Start a virtual Minibot and connect to it. 
2. Click on the *forward*, *backward*, *left*, *right*, and *stop* movement buttons and verify that the characters "F", "B", "L", "R", and "S" are printed on the virtual Minibot's terminal.
3. Press the *up arrow key*, *down arrow key*, *left arrow key*, *right arrow key* and *space bar* on your keyboard.  Verify that the characters "F", "B", "L", "R", and "S" are printed on the virtual Minibot's terminal.

### Ports Test
1. Start a virtual Minibot and connect to it.
2. Hover over the *Ports* dropdown menu, then the *Left Motor* dropdown, and finally click on 2.  You should see "2", "L", "M" printed in the virtual Minibot's terminal.  
3. Hover over the *Ports* dropdown menu, then the *Infrared* dropdown, and finally click on 4.  You should see "4", "I" printed in the virtual Minibot's terminal.  
4. Click on other random buttons in the *Ports* dropdown menu, and verify that you see corresponding messages in the virtual Minibot's terminal.

### Custom Modes Test
1. Start a virtual Minibot and connect to it.
2. Click on the *Object Detection* button and verify that "O" is printed in the virtual Minibot's terminal.
3. Click on the *Line Follow* button and verify that "T" is printed in the virtual Minibot's terminal.

## Speech Recognition (Setup/Control)
**Note:** The Speech Recognition feature might freeze at *Say Something!*, if you have a lot of background noise.  This is because it continuously listens until it thinks the user has stopped talking, and will only start *Converting from Speech to Text* when it stops hearing any loud sounds.  
1. Start a virtual Minibot and connect to it.
2. Click on the *Start Speech Recognition* button and verify that *Say Something* is displayed in the feedback box.
3. Say "forward" and verify that *Minibot moves forward* is displayed in the feedback box.  Also verify that "F" is printed in the virtual Minibot's terminal.
4. Say "left", "right", "backward", "stop" and verify that *Minibot moves left*, *Minibot moves right*, *Minibot moves backward*, and *Minibot stops* are displayed in the feedback box.  Also verify that "L", "R", "B", and "S" are printed in the virtual Minibot's terminal.
5. Say something random and verify that *Invalid command* is displayed in the feedback box. 
6. Click on the *Stop Speech Recognition* button and verify that the feedback box is emptied.

## Overhead Vision (Setup/Control)
1. Start a virtual Minibot and connect to it.
2. Click on Display Bot.
3. Click on the *stop* movement button, and verify "S" is printed in the virtual Minibot's terminal (This is to verify that making other requests is possible while the frontend is polling the backend for coordinates to display the location of the Minibot).
4. Using the Postman Application, send a Post request to *localhost:8080/vision* with the following raw JSON body:
```
{
    "id": 0,
    "x": 0,
    "y": 0,
    "orientation": 0
}
```
Verify that the Cup logo is displayed upright in the middle of the Vision grid.  
5.  Send a Post request to *localhost:8080/vision* with the following raw JSON body:
```
{
    "id": 0,
    "x": -200,
    "y": -200,
    "orientation": 180
}
```
Verify that the Cup logo is displayed upside down in the bottom left corner of the Vision grid.  
6. Click on Display Bot, and send another Post request with some other random coordinates.  Verify that there is no change to the Cup logo.  

