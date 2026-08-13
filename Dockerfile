FROM oven/bun:1-alpine

WORKDIR /app

# Copy all bundle contents
COPY . .

# Environment
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run server
CMD ["bun", "server.js"]
