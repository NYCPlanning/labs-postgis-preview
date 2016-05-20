FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Copy files to server
COPY . /usr/src/app

# Expose Port 3000
EXPOSE 3000 

# Run on container start
CMD [ "npm", "start" ] 
