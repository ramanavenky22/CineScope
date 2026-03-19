FROM node:20-bookworm-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Cloud Run sets the PORT environment variable, defaulting to 8080 usually, but our app defaults to 3001
ENV PORT=3001
EXPOSE 3001

CMD [ "npm", "start" ]
