export interface Review {
    _id?: string;
    ReviewID: string;
    ProductID: string;
    CustomerID: string;
    Content: string;
    Rating: number;
    DatePosted: string;
    Images?: string[];
}

export interface Customer {
    _id?: string;
    CustomerID: string;
    CustomerName: string;
    CustomerAdd?: string;
    CustomerPhone?: string;
    CustomerBirth?: string;
    CustomerAvatar?: string;
    ReceiveEmail?: boolean;
}