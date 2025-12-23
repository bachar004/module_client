import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
currentUrl: string = ''
constructor(private router: Router) {}
  ngOnInit(){
    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

}
