export type Sport = 'WNBA' | 'NWSL' | 'Tennis' | 'Golf' | 'College'

export type Market = 'Ticketmaster' | 'SeatGeek' | 'StubHub' | 'Vivid Seats'

export interface MarketListing {
  market: Market
  minPrice: number
  url: string
}

export interface Event {
  id: string
  sport: Sport
  title: string
  subtitle?: string
  venue: string
  city: string
  state: string
  date: string
  time: string
  markets: MarketListing[]
}
