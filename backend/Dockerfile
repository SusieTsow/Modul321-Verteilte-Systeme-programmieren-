# Description: Dockerfile for the node:22-alpine image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json file
COPY package.json ./

#install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove the source code
RUN rm -rf src

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]