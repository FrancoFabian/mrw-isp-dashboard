export interface Plan {
  id: string
  name: string
  speed: string
  downloadSpeed: number
  uploadSpeed: number
  price: number
  description: string
  isPopular: boolean
  clientCount: number
  scheduledPrice?: number
  scheduledDate?: string
}
