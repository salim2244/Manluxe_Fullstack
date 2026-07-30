export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  wishlist: string[];
  createdAt: Date;
}
