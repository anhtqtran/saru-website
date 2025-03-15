import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FaqService } from '../../services/faq.service';
import { Faq } from '../../classes/faq';

@Component({
  selector: 'app-faqlist',
  standalone: false,
  templateUrl: './faqlist.component.html',
  styleUrl: './faqlist.component.css'
})
export class FaqlistComponent {
  displayedColumns: string[] = ['id', 'FaqID', 'FaqTitle', 'action'];
    dataSource: MatTableDataSource<Faq>;
      
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
  
    faqService=inject(FaqService);
    constructor() {
      this.dataSource = new MatTableDataSource([] as any);
      }
    ngOnInit() {
      this.getServerData();
  }
  private getServerData() {
    this.faqService.getAllFaqs().subscribe((result) => {
      console.log(result);
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
    this.faqService.deleteFaqById(id).subscribe((result:any) => {
      alert('Đã xóa thành công');
      this.getServerData();
    })
  }
}
    