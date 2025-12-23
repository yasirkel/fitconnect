export interface Training {
  id: string;
  clubId: string;
  title: string;
  description?: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
}
