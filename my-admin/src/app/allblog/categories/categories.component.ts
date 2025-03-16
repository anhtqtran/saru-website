import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../classes/category';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements AfterViewInit {
    displayedColumns: string[] = ['id', 'CateblogID', 'CateblogName', 'action'];
    dataSource: MatTableDataSource<Category>;
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    categoryService=inject(CategoryService);
    constructor() {
      this.dataSource = new MatTableDataSource([] as any);
      }
    ngOnInit() {
      this.getServerData();
  }
  private getServerData() {
    this.categoryService.getCategories().subscribe((result) => {
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
      this.categoryService.deleteCategoryById(id).subscribe((result:any) => {
        alert('Xóa danh mục thành công');
        this.getServerData();
      })
    }
    toggleAdminMenu(): void {
      console.log('Admin menu toggled');
    }
  }