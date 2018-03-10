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
  private scrollListenerCancellationFn: Function;
  private clickListenerCancellationFn: Function;
  private keyupListenerCancellationFn: Function;

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
    if (!this.scrollListenerCancellationFn) {
      this.scrollListenerCancellationFn = this._renderer.listen("window", "scroll", () => this._state.toggleClick.emit(false));
    }
    if (!this.keyupListenerCancellationFn) {
      this.keyupListenerCancellationFn = this._renderer.listen("document", "keyup.esc", () => this._state.toggleClick.emit(false));
    }
    if (!this.clickListenerCancellationFn) {
      this.clickListenerCancellationFn = this._renderer.listen("document", "click", (event: any) => {
        if (event.button !== 2 && !this._element.nativeElement.contains(event.target)) {
          this._state.toggleClick.emit(false);
        }
      });
    }
  }

  removeListeners(): void {
    if (this.scrollListenerCancellationFn) {
      this.scrollListenerCancellationFn();
      this.scrollListenerCancellationFn = null;
    }
    if (this.clickListenerCancellationFn) {
      this.clickListenerCancellationFn();
      this.clickListenerCancellationFn = null;
    }
    if (this.keyupListenerCancellationFn) {
      this.keyupListenerCancellationFn();
      this.keyupListenerCancellationFn = null;
    }
  }
}
