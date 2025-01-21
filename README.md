# App

Animal adoption app


## Functional requirements

- [x] it should be possible to register as a ORG
- [x] it should be possible to update ORG details
- [x] it should be possible to authenticate as a ORG
- [i] it should be possible the ORG delete itself (the pets has to be deleted as well (soft delete))
- [x] it should be possible to list all available pets from a city (that aren't deletet_at)
- [x] it should be possible to filter pets by their characteristics (that aren't deletet_at) - age_in_months, size, energy_level
- [x] it should be possible to sort pets by "most recent added" (that aren't deletet_at)
- [x] it should be possible to view details of a pet for adoption (that aren't deletet_at)
- [x] it should be possible the ORG register a pet - check if s3 upload is working (and hash as well)
- [x] it should be possible the ORG update the details of a registered pet - ORG can update only it's on pets
  HOW I'LL DO THE HASHS/FILE NAMES: hash is hashing by file content, so before update I check if the hashs of the requested files are equal the hashes of DB. Then create and/or delete the necessary
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


## Non functional requirements

- [x] the ORG password must be encrypted
- [x] the app data must be in a PostgreSQL db
- [x] all deletions (pets or ORGs) should use soft deletes (deletedAt) instead of hard deletes
- [x] all data lists must be paginated with 20 items per page
- [x] store pet photos on S3
- [x] supported pet photos formats: JPEG (.jpg/.jpeg) and .png
- [x] ORG must be identified by a JWT (expiration 10 min) and refresh token (expiration 7 days)
- [ ] compress pet photo before send to S3
