import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../classes/blog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-bloglist',
  standalone: false,
  templateUrl: './bloglist.component.html',
  styleUrl: './bloglist.component.css',
  animations: [
    trigger('filterAnimation', [
      state('void', style({
        opacity: 0,
        maxHeight: '0px',
        transform: 'translateY(-10px)'
      })),
      state('*', style({
        opacity: 1,
        maxHeight: '500px',
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class BloglistComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'BlogID', 'BlogTitle', 'action'];
  dataSource: MatTableDataSource<Blog>;
  filterForm: FormGroup;
  showFilter = false;
  categories: string[] = []; // Mảng lưu danh sách danh mục duy nhất

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  blogService = inject(BlogService);
  fb = inject(FormBuilder);

  private allBlogs: Blog[] = [];

  constructor() {
    this.dataSource = new MatTableDataSource<Blog>([]);
    this.filterForm = this.fb.group({
      categoryName: [''] // Lọc theo danh mục
    });
  }

  ngOnInit() {
    this.getServerData();
  }

  private getServerData() {
    this.blogService.getAllBlogs().subscribe((result: Blog[]) => {
      console.log("Dữ liệu từ API:", result);
      this.allBlogs = result;
      this.dataSource.data = result;

      // Lấy danh sách danh mục duy nhất từ dữ liệu
      this.categories = [...new Set(result.map(blog => blog.categoryName))];
      console.log("Danh mục:", this.categories);
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

  applyAdvancedFilter() {
    const filters = this.filterForm.value;
    let filteredData = [...this.allBlogs];

    if (filters.categoryName) {
      filteredData = filteredData.filter(blog =>
        blog.categoryName.toLowerCase().includes(filters.categoryName.toLowerCase())
      );
    }

    this.dataSource.data = filteredData;
  }

  resetFilter() {
    this.filterForm.reset();
    this.dataSource.data = this.allBlogs;
    this.showFilter = false;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  delete(id: string) {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      this.blogService.deleteBlogById(id).subscribe(
        (result: any) => {
          alert('Xóa bài viết thành công');
          this.getServerData();
        },
        (error) => {
          alert('Có lỗi xảy ra khi xóa bài viết');
          console.error('Lỗi xóa bài viết:', error);
        }
      );
    }
  }
  toggleAdminMenu(): void {
    console.log('Admin menu toggled');
  }
}