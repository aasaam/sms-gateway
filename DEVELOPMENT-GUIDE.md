# Development Guide

For development using `docker-compose`

```bash
docker-compose -f docker-compose.dev.yml up -d
```

You will need to work with two container.

## API

For developing api server

```bash
# enter container
docker exec -it sms-gateway-api bash

# fresh installation
rm -rf node_modules package-lock.json
npm install

# run dev server
./dev.sh
```

Open your browser and see the swagger ui of API `http://localhost:18888/api/open-api/docs/index.html`

### Testing

```bash
# lint
npm run lint

# test via coverage
npm run test:cover
```

## Web UI

```bash
# enter container
docker exec -it sms-gateway-cp bash

# fresh installation
rm -rf node_modules package-lock.json
npm install

# run dev server
npm run dev
```

Open your browser and see the Nuxt.js application `http://localhost:18888/`
