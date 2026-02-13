FROM ghcr.io/puppeteer/puppeteer:21.6.1

WORKDIR /app

COPY package.json .
RUN npm install

COPY server.js .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 3001

CMD ["node", "server.js"]
