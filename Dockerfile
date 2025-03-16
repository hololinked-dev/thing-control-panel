# Use an nginx image to serve the built application
FROM node:22 AS build

WORKDIR /app 
COPY package*.json ./
RUN npm install . --force

COPY . /app/
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]