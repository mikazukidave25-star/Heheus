FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxi6 \
    libxtst6 \
    libxext6 \
    libx11-6 \
    libxcb1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgtk-3-0 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    dbus \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Reuse the system Chromium installed above instead of Puppeteer's own bundled
# ~200MB Chromium download (vote.js points at it via the CHROME_PATH env var,
# defaulting to /usr/bin/chromium).
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json .
RUN npm install --omit=dev

COPY . .

CMD ["node", "server.js"]
