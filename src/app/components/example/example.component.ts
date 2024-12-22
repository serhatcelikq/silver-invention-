import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { gsap } from 'gsap';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ExampleComponent implements OnInit {
  ngOnInit() {
    // GSAP animasyon örneği
    gsap.from('.card', {
      duration: 1,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }
} 