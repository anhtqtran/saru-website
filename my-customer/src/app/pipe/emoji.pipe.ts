import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'emoji'
})
export class EmojiPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // Thay thế các ký tự emoji trong chuỗi
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}