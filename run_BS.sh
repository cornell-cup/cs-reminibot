
            #!/bin/bash
            cd /Users/vickiyang/Documents/CupRobotics/cs-reminibot/
            set -e
            trap "kill 0" EXIT

            echo "================= MINIBOT CLIENT GUI ================="
            cd static/gui
            npm run webpack &
            echo "=========== STARTING BASESTATION ==============="
            cd ../..
            flask run
        