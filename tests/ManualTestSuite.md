# Manual Test Suite
Please manually execute these tests before merging any PR.

## Initial Setup
1. Run `./run_BS.sh` to start the Basestation.  Wait for the green `[built]` message to show up to indicate webpack has compiled the Javascript files.
2. Go to `localhost:8080/start` in your browser and press `ctrl + shift + R` or `command + shift + R` to refresh your browser by bypassing the cache.  This will ensure that your Javascript files are up to date.

## Minibot Connection
### Single Minibot Test
1. Run `python3 minibot.py -t` to start a virtual minibot.
2. Click on the *Available Bots* dropdown list, and verify that a minibot name is listed.  
3. Click *Add Bot* and verify that *Connected to: <name_of_the_minibot>* is displayed.
4. Kill the basestation.  Verify that *S* (stop) is printed repeatedly in the *minibot.py* terminal.  Verify that after a short while *Broadcasting message to basestation* is printed repeatedly to the *minibot.py* terminal.
5. Restart the basestation and verify that you are able to connect to the minibot via the WebGUI again (as you did in steps 1-3).
6. Kill the *minibot.py* program and verify that you no longer see that you're connected to a minibot in the WebGUI.
7. Restart the *minibot.py* program and verify that you are able to connect to the minibot again.

### Multiple Minibot Test
1. Run `python3 minibot.py -t` to start a virtual minibot.
2. Run `python3 minibot.py -t -p 9000` to start another virtual minibot on port 9000 (you can choose any random port).
3. Click on the *Available Bots* dropdown menu and verify that both minibot names are listed.
4. Verify that you can connect to either minibot.
5. Kill one of the minibots and verify that the *Available Bots* dropdown menu now only has one minibot name.
