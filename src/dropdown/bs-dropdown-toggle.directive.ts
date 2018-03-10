import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { BsDropdownState } from './bs-dropdown.state';

@Directive({
  selector: '[bsDropdownToggle],[dropdownToggle]',
  exportAs: 'bs-dropdown-toggle',
  host: {
    '[attr.aria-haspopup]': 'true'
  }
})
export class BsDropdownToggleDirective implements OnDestroy {
  @HostBinding('attr.disabled') isDisabled: boolean = null;

  // @HostBinding('class.active')
  @HostBinding('attr.aria-expanded') isOpen: boolean;

  private _subscriptions: Subscription[] = [];
  private _scrollListenerCancellationFn: Function;
  private _clickListenerCancellationFn: Function;
  private _keyupListenerCancellationFn: Function;

  constructor(private _state: BsDropdownState, private _element: ElementRef, private _renderer: Renderer2) {
    // sync is open value with state
    this._subscriptions.push(
      this._state.isOpenChange.subscribe(
        (value: boolean) => {
          this.isOpen = value;
          if (value && this._state.autoClose) this.attachListeners();
        }
      )
    );
    // populate disabled state
    this._subscriptions.push(
      this._state.isDisabledChange.subscribe(
        (value: boolean) => (this.isDisabled = value || null)
      )
    );
  }

  @HostListener('click', [])
  onClick(): void {
    if (this.isDisabled) {
      return;
    }
    this._state.toggleClick.emit(true);
  }

  ngOnDestroy(): void {
    this.removeListeners();
    for (const sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

  attachListeners() {
    if (!this._scrollListenerCancellationFn) {
      this._scrollListenerCancellationFn = this._renderer.listen("window", "scroll", () => this._state.toggleClick.emit(false));
    }
    if (!this._keyupListenerCancellationFn) {
      this._keyupListenerCancellationFn = this._renderer.listen("document", "keyup.esc", () => this._state.toggleClick.emit(false));
    }
    if (!this._clickListenerCancellationFn) {
      this._clickListenerCancellationFn = this._renderer.listen("document", "click", (event: any) => {
        if (event.button !== 2 && !this._element.nativeElement.contains(event.target)) {
          this._state.toggleClick.emit(false);
        }
      });
    }
  }

  removeListeners(): void {
    if (this._scrollListenerCancellationFn) {
      this._scrollListenerCancellationFn();
      this._scrollListenerCancellationFn = null;
    }
    if (this._clickListenerCancellationFn) {
      this._clickListenerCancellationFn();
      this._clickListenerCancellationFn = null;
    }
    if (this._keyupListenerCancellationFn) {
      this._keyupListenerCancellationFn();
      this._keyupListenerCancellationFn = null;
    }
  }
}
