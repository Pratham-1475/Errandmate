# 1. Use Node.js 18 as the base image
FROM node:18

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package files first (to speed up builds)
COPY package*.json ./

# 4. Install your dependencies
RUN npm install

# 5. Copy the rest of your backend code (server.js, services, etc.)
COPY . .

# 6. Open Port 3000 (The one Member 1 and the ALB are using)
EXPOSE 3000

# 7. Command to start your server
CMD [ "node", "server.js" ]