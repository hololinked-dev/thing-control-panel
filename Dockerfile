# Use an nginx image to serve the built application
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN ls -la
# Copy the built files from the dist folder on the host machine to the nginx folder in the container
COPY dist/. .

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]