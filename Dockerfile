# 1. Use Node.js 18
FROM node:18

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Copy package files from the backend folder
# (Change "backend/" to "." if your Dockerfile is already inside the backend folder)
COPY backend/package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy everything from the backend folder to the current WORKDIR
COPY backend/ .

# 6. Open Port 3000
EXPOSE 3000

# 7. Start the server
CMD [ "node", "server.js" ]