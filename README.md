
export interface Gym {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  photos: string[];
  trainers: string[];
  equipment: string[];
  timings: string;
  isFeatured: boolean;
  tags: string[];
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ComparisonState {
  gymIds: string[];
}
