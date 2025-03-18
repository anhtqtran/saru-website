export class Account {
<<<<<<< HEAD
    constructor(
        public _id: any = null,
        public AccountID: string = '',
        public CustomerID: string = '',
        public CustomerEmail: string = '',
        public CustomerPassword: string = '',
    ) { }
}

export class Customer {
    constructor(
        public _id: any = null,
        public CustomerID: string = '',
        public CustomerName: string = '',
        public MemberID: string = '',
        public CustomerAdd: string = '', //{'address': '626 Main Street', 'city': 'Phoenix', 'state': 'Mississippi', 'stateCode': 'MS', 'postalCode': '29112', 'coordinates': {'lat': -77.16213, 'lng': -92.084824}, 'country': 'United States'}
        public CustomerPhone: string = '',
        public CustomerBirth: string = '',
        public CustomerAvatar: string = '',
        public ReceiveEmail: boolean = false
    ) { }
=======
  constructor(
      public _id: any = null,
      public AccountID: string = '',
      public CustomerID: string = '',
      public CustomerEmail: string = '',
      public CustomerPassword: string = '',
  ) {}
}

export class Customer {
  constructor(
      public _id: any = null,
      public CustomerID: string = '',
      public CustomerName: string = '',
      public MemberID: string = '',
      public CustomerAdd: string = '', //{'address': '626 Main Street', 'city': 'Phoenix', 'state': 'Mississippi', 'stateCode': 'MS', 'postalCode': '29112', 'coordinates': {'lat': -77.16213, 'lng': -92.084824}, 'country': 'United States'}
      public CustomerPhone: string = '',
      public CustomerBirth: string = '',
      public CustomerAvatar: string = '',
      public ReceiveEmail: boolean = false
      ) {}
>>>>>>> main
}