import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../services/contact.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {

  contactForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private contactService: ContactService, private toastr: ToastrService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void { }

  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      try {
        await this.contactService.sendEmail(this.contactForm.value);
        this.toastr.success('Gửi thành công!', 'Thành công');
        this.contactForm.reset();
      } catch (error) {
        this.toastr.error('Gửi thất bại. Vui lòng thử lại.', 'Lỗi');
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.toastr.warning('Vui lòng điền đầy đủ thông tin.', 'Cảnh báo');
    }
  }

  get f() {
    return this.contactForm.controls;
  }
}