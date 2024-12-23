# App

Animal adoption app


## Functional requirements

- [ ] it should be possible to register a pet
- [ ] it should be possible to list all available pets from a city
- [ ] it should be possible to filter pets by their characteristics
- [ ] it should be possible to view details of a pet for adoption
- [ ] it should be possible to update the details of a registered pet
- [ ] it should be possible to sort pets by "most recent added"
- [ ] it should be possible to delete a pet
- [ ] it should be possible to register as a ORG
- [ ] it should be possible to authenticate as a ORG
- [ ] it should be possible to update ORG details


## Business rules

- [ ] an ORG must provide a unique email for registration
- [ ] to list pets, we must inform a city
- [ ] an ORG must have an address and a WhatsApp number
- [ ] a pet must be linked to a ORG
- [ ] a pet must have at least one photo
- [ ] the app does not handle the adoption process itself but provides a way for adopters to contact ORGs via WhatsApp
- [ ] filtering pets by their characteristics is optional but cannot exclude the city filter
- [ ] if no filters are provided, the app should list all pets for the specified city
- [ ] the dailted pet page must have the location with a pin in the map


## Non functional requirements

- [ ] the ORG password must be encrypted
- [ ] the app data must be in a PostgreSQL db
- [ ] all data lists must be paginated with 20 items per page
- [ ] ORG must be identified by a JWT (expiration 10 min) and refresh token (expiration 7 days)
- [ ] all deletions (pets or ORGs) should use soft deletes (deletedAt) instead of hard deletes
- [ ] supported pet photos formats: JPEG (.jpg/.jpeg) and .png
- [ ] compress pet photo before send to S3
- [ ] store pet photos on S3
