// expand-image.directive.ts
import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appExpandImage]'
})
export class ExpandImageDirective {
  private expanded = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  onClick() {
    this.expanded = !this.expanded;
    this.updateImageSize();
  }

  private updateImageSize() {
    const imgElement = this.el.nativeElement.querySelector('.img-user');

    if (this.expanded) {
      this.renderer.setStyle(imgElement, 'width', '100%');
      this.renderer.setStyle(imgElement, 'height', 'auto');
      this.renderer.setStyle(imgElement, 'border-radius', '10px');
    } else {
      this.renderer.removeStyle(imgElement, 'width');
      this.renderer.removeStyle(imgElement, 'height');
      this.renderer.removeStyle(imgElement, 'border-radius');
    }
  }
}
