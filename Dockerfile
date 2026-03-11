
# Stage 1: Build Stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies (use npm ci for clean installs)
RUN npm ci

# Copy the rest of the files
COPY . .

# Run the build
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install only the serve package
RUN npm i -g serve

# Copy only the build output from the build stage
COPY --from=build /app/dist /app/dist

# Expose the port
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "dist", "-p", "3000"]
