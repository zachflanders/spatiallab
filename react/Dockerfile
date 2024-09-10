FROM node:18-bullseye

ARG NEXT_PUBLIC_PROTOCOL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ROOT_URL
ARG NEXT_PUBLIC_GEOSERVER_URL


ENV NEXT_PUBLIC_PROTOCOL=$NEXT_PUBLIC_PROTOCOL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ROOT_URL=$NEXT_PUBLIC_ROOT_URL
ENV NEXT_PUBLIC_GEOSERVER_URL=$NEXT_PUBLIC_GEOSERVER_URL

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port that the application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]
