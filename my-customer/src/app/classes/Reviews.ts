export interface Review {
    ReviewID: string;
    ProductID: string;
    CustomerID: string;
    Content: string;
    Rating: number;
    DatePosted: string;
    Images?: string[];
  }
  