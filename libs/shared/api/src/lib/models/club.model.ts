export interface Club {
  id: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  sportsOffered: string[];
  ownerId: string;
  createdAt: string;
}
