FROM node:22 AS base

WORKDIR /app/frontend
COPY frontend/package*.json /app/frontend/
RUN npm install . --force

COPY frontend /app/frontend

FROM base AS dev

EXPOSE 5173

CMD ["npm", "run", "dev"]

FROM base AS build

RUN npm run build

FROM nginx:alpine AS staging
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine AS prod
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]