/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Directive, ElementRef, Input, Renderer, OnInit } from '@angular/core';

@Directive({ selector: '[position]' })
export class CustomPosition implements OnInit {

    @Input() position: string;
    constructor(private elem: ElementRef, private renderer: Renderer) { }

    ngOnInit() {
        let positionStr = `${this.position}`;
        this.renderer.setElementProperty(this.elem.nativeElement, "position", positionStr);
    }
}

@Directive({ selector: '[userid]' })
export class CustomUserId implements OnInit {

    @Input() userid: string;
    constructor(private elem: ElementRef, private renderer: Renderer) { }

    ngOnInit() {
        let str = `${this.userid}`;
        this.renderer.setElementProperty(this.elem.nativeElement, "userid", str);
    }
}

@Directive({ selector: '[realheader]' })
export class CustomRealHeader implements OnInit {

    @Input() realheader: string;
    constructor(private elem: ElementRef, private renderer: Renderer) { }

    ngOnInit() {
        let str = `${this.realheader}`;
        this.renderer.setElementProperty(this.elem.nativeElement, "realheader", str);
    }
}


@Directive({ selector: '[prev-position]' })
export class CustomPrevPosition implements OnInit {

    @Input() prevposition: string;
    constructor(private elem: ElementRef, private renderer: Renderer) { }

    ngOnInit() {
        let str = `${this.prevposition}`;
        this.renderer.setElementProperty(this.elem.nativeElement, "realheader", str);
    }
}