FROM node:18

WORKDIR /usr/src/app

# 1. Copy package files from the backend folder
COPY backend/package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy the CONTENTS of the backend folder to the current directory
# The "." after backend/ is the secret fix!
COPY backend/. .

# 4. Open Port 3000 and Start
EXPOSE 3000
CMD [ "node", "server.js" ]