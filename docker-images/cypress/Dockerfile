# Cypress Docker Image for TON Lowcode Platform E2E Testing
# Based on official Cypress Docker image with additional tools

FROM cypress/included:13.17.0

# Set working directory
WORKDIR /app

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    jq \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js LTS (if not already available)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Create app directory
RUN mkdir -p /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy Cypress configuration and tests
COPY cypress.config.ts ./
COPY cypress/ ./cypress/

# Copy source code (needed for component testing)
COPY src/ ./src/

# Copy Next.js configuration
COPY next.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./tailwind.config.js 2>/dev/null || true

# Set environment variables
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
ENV NODE_ENV=test
ENV CI=true

# Create Cypress cache directory
RUN mkdir -p $CYPRESS_CACHE_FOLDER

# Verify Cypress installation
RUN npx cypress verify

# Set default command
CMD ["npx", "cypress", "run"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD npx cypress verify || exit 1

# Labels for better maintainability
LABEL maintainer="TON Lowcode Platform Team"
LABEL version="1.0"
LABEL description="Cypress E2E testing environment for TON Lowcode Platform"

# Expose port for Cypress dashboard (if needed)
EXPOSE 3000

# Create volume mounts for reports and screenshots
VOLUME ["/app/cypress/screenshots", "/app/cypress/videos", "/app/cypress/downloads"]