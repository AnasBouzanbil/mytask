.PHONY: start-back start-front start-all

# Navigate to "back" and run "node index.js"
start-back:
	cd back && npm i  && node index.js

# Navigate to "my-dashboard" and run "npm run start"
start-front:
	cd my-dashboard && npm i && npm run start

# Run both commands in parallel
all:
	make start-front & make start-back 
