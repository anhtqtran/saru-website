export class order {
    constructor(
      public _id: any = null,          
      public OrderID: string = "",     
      public CustomerID: string = "",  
      public OrderDate: string = "",   
      public OrderStatusID: string = "", 
      public PaymentStatus: string = "", 
      public Amount: number = 0        
    ) {}
  }
  