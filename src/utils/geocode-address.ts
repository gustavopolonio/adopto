import {
  Client as GoogleMapsClient,
  LatLngLiteral,
} from '@googlemaps/google-maps-services-js'
import { env } from '@/env'

interface GeocodeAddressProps {
  zipCode: string
  address: string
  city: string
}

export async function geocodeAddress({
  zipCode,
  address,
  city,
}: GeocodeAddressProps): Promise<LatLngLiteral | undefined> {
  const mapsClient = new GoogleMapsClient({})
  const geocodeResponse = await mapsClient.geocode({
    params: {
      key: env.GOOGLE_MAPS_API_KEY,
      address: `${zipCode}, ${address}, ${city}`,
    },
  })

  return geocodeResponse.data.results[0]?.geometry.location
}
