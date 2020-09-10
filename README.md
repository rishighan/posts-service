# posts-service

Microservice built using `moleculer` for `posts` and `series` resources on rishighan.com
`docker-compose` configuration includes:

1. `posts-api` which exposts all the endpoints
2. `bitnami/mongodb` which spins up a mongo instance in standalone mode

## Build Setup

``` bash
# Install dependencies
npm install

# Start development mode with REPL
npm run dev

# Run unit tests
npm test

# Run continuous test mode
npm run ci

# Run ESLint
npm run lint
```