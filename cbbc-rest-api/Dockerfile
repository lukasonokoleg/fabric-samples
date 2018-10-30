FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production
ADD server/server.js /usr/src/app/server.js
RUN chmod 755 /usr/src/app/server.js
# Bundle app source
COPY . .

EXPOSE 4000

CMD [ "npm", "start" ]
