import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Customer } from '../../classes/customer';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customerlist',
  standalone: false,
  templateUrl: './customerlist.component.html',
  styleUrl: './customerlist.component.css'
})
export class CustomerlistComponent {
  displayedColumns: string[] = ['id','CustomerID', 'CustomerName', 'CustomerPhone', 'CustomerBirth', 'action'];
    dataSource: MatTableDataSource<Customer>;
      
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
  
    customerService=inject(CustomerService);
    constructor() {
      this.dataSource = new MatTableDataSource([] as any);
      }
    ngOnInit() {
      this.getServerData();
  }
  private getServerData() {
    this.customerService.getAllCustomer().subscribe((result) => {
      console.log("Dữ liệu từ API:", result);
  
      // ✅ Chuyển đổi CustomerBirth về dạng YYYY-MM-DD trước khi hiển thị
      result.forEach(customer => {
        if (customer.CustomerBirth) {
          customer.CustomerBirth = new Date(customer.CustomerBirth).toISOString().split('T')[0];
        }
      });
  
      this.dataSource.data = result;
    });
  }  
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  delete(id:string){
    console.log(id);
    this.customerService.deleteCustomerById(id).subscribe((result:any) => {
      alert('Xóa khách hàng thành công');
      this.getServerData();
    })
  }
}
    