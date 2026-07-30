import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero implements OnInit, OnDestroy {
  @Output() categorySelect = new EventEmitter<string>();

  slides = [
    {
      // Slide 1 — kept as original (local image)
      image: '/images/hero-fashion.jpg',
      tag: 'New Season',
      title: 'Redefine\nYour Style',
      subtitle: "Explore the latest in men's & women's fashion — curated for the bold.",
      cta: 'Shop All',
      category: 'all',
      overlay: 'from-black/70 via-black/40 to-transparent'
    },
    {
      // Slide 2 — Men's: sharp editorial menswear shot
      image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1400&q=85',
      tag: "Men's Collection",
      title: "Dress Sharp,\nLive Bold",
      subtitle: "Premium menswear from the world's top brands. Timeless cuts, modern edge.",
      cta: "Shop Men's",
      category: 'mens',
      overlay: 'from-black/75 via-black/35 to-transparent'
    },
    {
      // Slide 3 — Women's: elegant women's fashion editorial
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85',
      tag: "Women's Collection",
      title: "Elegance in\nEvery Thread",
      subtitle: "Discover women's fashion that moves with you. From casual to couture.",
      cta: "Shop Women's",
      category: 'womens',
      overlay: 'from-black/70 via-black/30 to-transparent'
    }
  ];

  current = 0;
  paused = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  readonly INTERVAL = 4000;

  ngOnInit() {
  setTimeout(() => this.startTimer());
}

  ngOnDestroy() {
    this.stopTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.paused) this.next();
    }, this.INTERVAL);
  }

  private stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  prev() {
    this.current = (this.current - 1 + this.slides.length) % this.slides.length;
    this.startTimer(); // reset timer on manual nav
  }

  next() {
    this.current = (this.current + 1) % this.slides.length;
  }

  goTo(i: number) {
    this.current = i;
    this.startTimer();
  }

  pause()  { this.paused = true; }
  resume() { this.paused = false; }

  shop(category: string) {
    this.categorySelect.emit(category);
  }
}
