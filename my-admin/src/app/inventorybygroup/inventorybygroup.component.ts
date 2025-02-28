import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-inventorybygroup',
  standalone: false,
  templateUrl: './inventorybygroup.component.html',
  styleUrl: './inventorybygroup.component.css'
})
export class InventorybygroupComponent implements OnInit {
  allGroups: { name: string; quantity: number; condition: string }[] = []; // Xác định kiểu dữ liệu
  displayedGroups: { name: string; quantity: number; condition: string }[] = [];
  selectedRows = 20;

  ngOnInit(): void {
    // Giả lập danh sách nhóm sản phẩm
    this.allGroups = Array.from({ length: 100 }, (_, i) => ({
      name: `Nhóm ${i + 1}`,
      quantity: Math.floor(Math.random() * 100),
      condition: 'Khác'
    }));

    this.updateTableRows();
  }

  updateTableRows(): void {
    this.displayedGroups = this.allGroups.slice(0, this.selectedRows);
  }

}
