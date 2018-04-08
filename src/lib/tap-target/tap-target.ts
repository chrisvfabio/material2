/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation, NgZone, ElementRef, OnInit, AfterContentInit, OnDestroy, EventEmitter, Output, InjectionToken, Input, Inject, ViewChild, TemplateRef } from "@angular/core";
import { FocusKeyManager } from "@angular/cdk/a11y";
import { ESCAPE, LEFT_ARROW, RIGHT_ARROW } from "@angular/cdk/keycodes";
import { Subscription } from "rxjs";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Direction } from "@angular/cdk/bidi";

/** Default `mat-tap-target` options that can be overridden. */
export interface MatTapTargetDefaultOptions {
    /** Class to be applied to the menu's backdrop. */
    backdropClass: string;

    /** Whether the menu has a backdrop. */
    hasBackdrop?: boolean;
}

/** Injection token to be used to override the default options for `mat-menu`. */
export const MAT_TAP_TARGET_DEFAULT_OPTIONS =
    new InjectionToken<MatTapTargetDefaultOptions>('mat-tap-target-default-options', {
        providedIn: 'root',
        factory: () => ({
            backdropClass: 'cdk-overlay-transparent-backdrop',
        })
    });

@Component({
    selector: 'mat-tap-target',
    templateUrl: 'tap-target.html',
    styleUrls: ['tap-target.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'matTapTarget'
})
export class MatTapTarget implements OnInit, AfterContentInit, OnDestroy {
    private _keyManager: FocusKeyManager<MatTapTarget>;
    // private _xPosition: MenuPositionX = this._defaultOptions.xPosition;
    // private _yPosition: MenuPositionY = this._defaultOptions.yPosition;
    private _previousElevation: string;

    /** Subscription to tab events on the menu panel */
    private _tabSubscription = Subscription.EMPTY;

    /** Config object to be passed into the menu's ngClass */
    _classList: { [key: string]: boolean } = {};

    /** Layout direction of the menu. */
    direction: Direction;

    /** @docs-private */
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

    /** Class to be added to the backdrop element. */
    @Input() backdropClass: string = this._defaultOptions.backdropClass;

    @Input()
    get hasBackdrop(): boolean | undefined { return this._hasBackdrop; }
    set hasBackdrop(value: boolean | undefined) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }
    private _hasBackdrop: boolean | undefined = this._defaultOptions.hasBackdrop;

    /**
     * This method takes classes set on the host mat-menu element and applies them on the
     * menu template that displays in the overlay container.  Otherwise, it's difficult
     * to style the containing menu from outside the component.
     * @param classes list of class names
     */
    @Input('class')
    set panelClass(classes: string) {
        if (classes && classes.length) {
            this._classList = classes.split(' ').reduce((obj: any, className: string) => {
                obj[className] = true;
                return obj;
            }, {});

            this._elementRef.nativeElement.className = '';
            // this.setPositionClasses();
        }
    }

    /** Event emitted when the menu is closed. */
    @Output() readonly closed: EventEmitter<void | 'click' | 'keydown' | 'tab'> =
        new EventEmitter<void | 'click' | 'keydown' | 'tab'>();

    constructor(
        private _elementRef: ElementRef,
        private _ngZone: NgZone,
        @Inject(MAT_TAP_TARGET_DEFAULT_OPTIONS) private _defaultOptions: MatTapTargetDefaultOptions) { }

    ngOnInit() {
    }

    ngAfterContentInit() {
        // this._keyManager = new FocusKeyManager<MatTapTarget>().withWrap().withTypeAhead();
        // this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'));
    }

    ngOnDestroy() {
        // this._tabSubscription.unsubscribe();
        this.closed.complete();
    }

    /** Handle a keyboard event from the menu, delegating to the appropriate action. */
    _handleKeydown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case ESCAPE:
                this.closed.emit('keydown');
                event.stopPropagation();
                break;
            case LEFT_ARROW:
                if (this.direction === 'ltr') {
                    this.closed.emit('keydown');
                }
                break;
            case RIGHT_ARROW:
                if (this.direction === 'rtl') {
                    this.closed.emit('keydown');
                }
                break;
            default:
                this._keyManager.onKeydown(event);
        }
    }
}