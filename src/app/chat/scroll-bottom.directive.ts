// scroll-bottom.directive.ts
import { Directive, ElementRef, HostListener, Renderer2, AfterViewChecked } from '@angular/core';

@Directive({
  selector: '[appScrollBottom]'
})
export class ScrollBottomDirective implements AfterViewChecked {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const element = this.el.nativeElement;
    this.renderer.setProperty(element, 'scrollTop', element.scrollHeight);
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    // Se o usuário estiver no final, role automaticamente
    if (atBottom) {
      this.scrollToBottom();
    }
  }
}
