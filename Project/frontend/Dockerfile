# Use an official node runtime as the parent image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for better caching
# COPY package*.json ./
COPY entrypoint.sh /entrypoint.sh

# # Install project dependencies
# RUN npm install

RUN chmod +x /entrypoint.sh

# Copy the rest of the application
# COPY . .

# Specify the port the app runs on
EXPOSE 3000

ENTRYPOINT [ "/entrypoint.sh" ]
# Command to run the application
CMD ["npm", "start"]
