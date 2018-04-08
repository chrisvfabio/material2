/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  GlobalPositionStrategy
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { MatTapTarget } from './tap-target';
import { throwMatTapTargetMissingError } from './tap-target-errors';


@Directive({
  selector: '[matTapTargetTriggerFor]',
  host: {
    'aria-haspopup': 'true',
  },
  exportAs: 'matTapTargetTrigger'
})
export class MatTapTargetTrigger implements AfterContentInit, OnDestroy {
  private _portal: TemplatePortal;
  private _overlayRef: OverlayRef | null = null;
  private _tapTargetOpen: boolean = false;
  private _closeSubscription = Subscription.EMPTY;

  /** References the tap target instance that the trigger is associated with. */
  @Input('matTapTargetTriggerFor') tapTarget: MatTapTarget;

  /** Data to be passed along to any lazily-rendered content. */
  @Input('matTapTargetTriggerData') tapTargetData: any;

  /** Event emitted when the associated menu is opened. */
  @Output() readonly tapTargetOpened: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the associated menu is closed. */
  @Output() readonly tapTargetClosed: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private _overlay: Overlay,
    private _element: ElementRef,
    private _viewContainerRef: ViewContainerRef,
    @Optional() private _dir: Directionality,
    private _focusMonitor?: FocusMonitor
  ) { }

  ngAfterContentInit() {
    this._checkTapTarget();

    // this.tapTarget.closed.subscribe(reason => {
    //   // todo: destroyTapTarget
    // });
  }

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }

    // todo: this._cleanUpSubscriptions();
  }

  /** Whether the tap target is open. */
  get tapTargetOpen(): boolean {
    return this._tapTargetOpen;
  }

  /** The text direction of the containing app. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Toggles the tap target between the open and closed states. */
  toggleTapTarget(): void {
    return this._tapTargetOpen ? this.closeTapTarget() : this.openTapTarget();
  }

  /** Opens the tap target. */
  openTapTarget(): void {
    if (this._tapTargetOpen) {
      return;
    }

    this._createOverlay().attach(this._portal);

    // todo: if (this.tapTarget.lazyContent) {
    //   this.tapTarget.lazyContent.attach(this.menuData);
    // }

    // todo: this._closeSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
    this._initTapTarget();

    if (this.tapTarget instanceof MatTapTarget) {
      // todo: this.tapTarget._startAnimation();
    }
  }

  /** Closes the tap target. */
  closeTapTarget(): void {
    this.tapTarget.closed.emit();
  }

  /** Closes the tap target and does the necessary cleanup. */
  private _destroyTapTarget() {
    if (!this._overlayRef || !this.tapTargetOpen) {
      return;
    }

    const tapTarget = this.tapTarget;

    this._resetTapTarget();
    this._closeSubscription.unsubscribe();
    this._overlayRef.detach();

    // if (tapTarget instanceof MatTapTarget) {
    //   // todo: tapTarget._resetAnimation();

    //   if (tapTarget.lazyContent) {
    //     // Wait for the exit animation to finish before detaching the content.
    //     tapTarget._animationDone
    //       .pipe(take(1))
    //       .subscribe(() => tapTarget.lazyContent!.detach());
    //   }
    // } else if (tapTarget.lazyContent) {
    //   tapTarget.lazyContent.detach();
    // }
  }

  /**
   * Focuses the tap target trigger.
   * @param origin Source of the tap target trigger's focus.
   */
  focus(origin: FocusOrigin = 'program') {
    if (this._focusMonitor) {
      this._focusMonitor.focusVia(this._element.nativeElement, origin);
    } else {
      this._element.nativeElement.focus();
    }
  }

  /**
   * This method checks that a valid instance of MatTapTarget has been passed into
   * matTapTargetFor. If not, an exception is thrown.
   */
  private _checkTapTarget() {
    if (!this.tapTarget) {
      throwMatTapTargetMissingError();
    }
  }

  /**
   * This method sets the tap target state to open and focuses the first item if
   * the tap target was opened via the keyboard.
   */
  private _initTapTarget(): void {
    this.tapTarget.direction = this.dir;
    // todo: this._settaptargetElevation();
    // todo: this._setIstaptargetOpen(true);
  }

  /**
   * This method resets the tap target when it's closed, most importantly restoring
   * focus to the tap target trigger if the tap target was opened via the keyboard.
   */
  private _resetTapTarget(): void {
    this._setIsTapTargetOpen(false);

    // We should reset focus if the user is navigating using a keyboard or
    // if we have a top-level trigger which might cause focus to be lost
    // when clicking on the backdrop.
    // Note that the focus style will show up both for `program` and
    // `keyboard` so we don't have to specify which one it is.
    this.focus();
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setIsTapTargetOpen(isOpen: boolean): void {
    this._tapTargetOpen = isOpen;
    this._tapTargetOpen ? this.tapTargetOpened.emit() : this.tapTargetClosed.emit();
  }

  /**
   * This method creates the overlay from the provided menu's template and saves its
   * OverlayRef so that it can be attached to the DOM when openMenu is called.
   */
  private _createOverlay(): OverlayRef {
    if (!this._overlayRef) {
      this._portal = new TemplatePortal(this.tapTarget.templateRef, this._viewContainerRef);
      const config = this._getOverlayConfig();
      // todo?: this._subscribeToPositions(config.positionStrategy as
      // FlexibleConnectedPositionStrategy);
      this._overlayRef = this._overlay.create(config);
    }

    return this._overlayRef;
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayState.
   * @returns OverlayConfig
   */
  private _getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this._getPosition(),
      hasBackdrop: this.tapTarget.hasBackdrop,
      backdropClass: this.tapTarget.backdropClass || 'cdk-overlay-transparent-backdrop',
      direction: this.dir
    });
  }

  /**
   * This method builds the position strategy for the overlay, so the menu is properly connected
   * to the trigger.
   * @returns FlexibleConnectedPositionStrategy
   */
  private _getPosition(): FlexibleConnectedPositionStrategy {
    return this._overlay.position()
      .flexibleConnectedTo(this._element)
      .withPositions([
        {
          originX: 'center',
          originY: 'center',
          offsetX: 0,
          offsetY: 0,
          overlayX: 'center',
          overlayY: 'center',
        }
      ]);
  }
}
