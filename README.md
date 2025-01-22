# :pushpin: Table of Contents
* [About this Project](#book-about-this-project)
* [How to Use](#construction_worker-how-to-use)
* [Technologies](#computer-technologies)

# :book: About this Project

Adopto is an app to animal adoption. It's API contain SOLID concepts, Design Patterns, Docker to start the database, JWT with Refresh Token and other concepts.

All requirements, business rules and technologies are listed below.

# :construction_worker: How to Use

Before starting, you need to have installed in your machine: [Node](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/) (or other package manager), [Git](https://git-scm.com/) 
and a code editor (I use [VSCode](https://code.visualstudio.com/)).

```bash

# Clone this repository via HTTPS:
git clone https://github.com/gustavopolonio/adopto.git

# Install dependencies:
npm install

# Create your environment variables based on the examples of `.env.example`
cp .env.example .env

# Make sure to fill all environment variables:
# JWT_SECRET: add any value
# DATABASE_URL: is based on docker-compose.yaml file, so it must be: "postgresql://docker:docker@localhost:5432/apisolid?schema=public"
# GOOGLE_MAPS_API_KEY: use your Google Maps Platform API Key
# AWS_ACCESS_KEY: use your AWS key
# AWS_SECRET_ACCESS_KEY: use your AWS secret
# BUCKET_NAME: create a S3 bucket and use its name

# Run docker (you need have installed Docker Desktop):
docker compose up

# Run migrations:
npx prisma migrate dev

# Run development environment:
npm run dev

# Run unit tests:
npm run test

# Run e2e tests (create a S3 bucket only for tests and add its name on `vite.config.mts` file):
npm run test:e2e

```

# :computer: Technologies

* Node + Fastify + TypeScript
* AWS - S3
* Google Maps Service
* Prisma ORM
* Vitest
* Zod
* GitHub Actions - CI

## Functional requirements

- [x] it should be possible to register as a ORG
- [x] it should be possible to update ORG details
- [x] it should be possible to authenticate as a ORG
- [x] it should be possible the ORG delete itself (the pets has to be deleted as well (soft delete))
- [x] it should be possible to list all available pets from a city (that aren't deletet_at)
- [x] it should be possible to filter pets by their characteristics (that aren't deletet_at) - age_in_months, size, energy_level
- [x] it should be possible to sort pets by "most recent added" (that aren't deletet_at)
- [x] it should be possible to view details of a pet for adoption (that aren't deletet_at)
- [x] it should be possible the ORG register a pet
- [x] it should be possible the ORG update the details of a registered pet - ORG can update only it's on pets
- [x] it should be possible the ORG delete a pet of her - ORG can delete only it's on pets


## Business rules

- [x] an ORG must provide a unique email for registration
- [x] an ORG must have an address and a WhatsApp number
- [x] a pet must be linked to a ORG
- [x] a pet must have at least one photo
- [x] to list pets, we must inform a city
- [x] filtering pets by their characteristics is optional but cannot exclude the city filter
- [x] if no filters are provided, the app should list all pets for the specified city
- [x] the app does not handle the adoption process itself but provides a way for adopters to contact ORGs via WhatsApp
- [x] the detailed pet page must have the location with a pin in the map - getPetProfile must return latitude and longitude
- [ ] an ORG must verify its email before registering pets


## Non functional requirements

- [x] the ORG password must be encrypted
- [x] the app data must be in a PostgreSQL db
- [x] all deletions (pets or ORGs) should use soft deletes (deletedAt) instead of hard deletes
- [x] all data lists must be paginated with 20 items per page
- [x] store pet photos on S3
- [x] supported pet photos formats: JPEG (.jpg/.jpeg) and .png
- [x] ORG must be identified by a JWT (expiration 10 min) and refresh token (expiration 7 days)
- [ ] compress pet photo before send to S3
- [ ] listByCity e2e test is not working on ci => findManyByCity prisma method can't consider accents on the query. It's not creating correctly unaccent EXTENSION
- [ ] the app should handle up to 10,000 concurrent requests without significant performance degradation
- [ ] create swagger

---

Made with :green_heart: by [Gustavo Polonio](https://github.com/gustavopolonio) 🚀

[![Linkedin Badge](https://img.shields.io/badge/-Gustavo-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/gustavo-polonio-04b77a169/)](https://www.linkedin.com/in/gustavo-polonio-04b77a169/)
[![Gmail Badge](https://img.shields.io/badge/-gustavopolonio1@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:gustavopolonio1@gmail.com)](mailto:gustavopolonio1@gmail.com)
