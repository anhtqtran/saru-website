// import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';

// @Component({
//   selector: 'app-products',
//   standalone: false,
//   templateUrl: './products.component.html',
//   styleUrl: './products.component.css'
// })
// export class ProductsComponent implements AfterViewInit {
//   displayedColumns: string[] = ['id', 'name', 'action'];
//   dataSource: MatTableDataSource<any>;

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;

//   productService: inject(ProductService);
//   constructor() {
//     this.dataSource = new MatTableDataSource([] as any);
//   }
//   ngOnInit() {
//     this.getServerData();
//   }
//   private getServerData() {
//     this.productService.getProducts().subscribe((result) => {
//       console.log(result);
//       this.dataSource.data = result;
//     });
//   }
//   ngAfterViewInit() {
//     this.dataSource.paginator = this.paginator;
//     this.dataSource.sort = this.sort;
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();

//     if (this.dataSource.paginator) {
//       this.dataSource.paginator.firstPage();
//     }
//   }
//   delete(id:string){}
// }