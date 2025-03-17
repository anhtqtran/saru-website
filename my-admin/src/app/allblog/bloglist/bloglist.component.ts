import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../classes/blog';

@Component({
  selector: 'app-bloglist',
  standalone: false,
  templateUrl: './bloglist.component.html',
  styleUrl: './bloglist.component.css'
})
export class BloglistComponent {
  displayedColumns: string[] = ['id','BlogID', 'BlogTitle', 'action'];
  dataSource: MatTableDataSource<Blog>;
    
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  blogService=inject(BlogService);
  constructor() {
    this.dataSource = new MatTableDataSource([] as any);
    }
  ngOnInit() {
    this.getServerData();
}
private getServerData() {
  this.blogService.getAllBlogs().subscribe((result) => {
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
    this.blogService.deleteBlogById(id).subscribe((result:any) => {
      alert('Xóa bài viết thành công');
      this.getServerData();
    })
  }
}
  