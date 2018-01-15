/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';

import {customMatchers} from '../testing/custom-matchers';
import {makeCreateTestComponent, expectNativeEl} from '../testing/helpers';
import {StyleService} from '../../utils/styling/styler';
import {ServerStylesheet} from './server-stylesheet';

describe('styler', () => {
  let styler: StyleService;
  let fixture: ComponentFixture<any>;

  let componentWithTemplate = (template: string, styles?: any) => {
    fixture = makeCreateTestComponent(() => TestLayoutComponent)(template, styles);

    inject([StyleService], (_styler: StyleService) => {
      styler = _styler;
    })();
  };

  beforeEach(() => {
    jasmine.addMatchers(customMatchers);

    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [TestLayoutComponent],
      providers: [ServerStylesheet, StyleService]
    });
  });

  describe('testing display styles', () => {

    it('should default to "display:block" for <div></div>', () => {
      componentWithTemplate(`
        <div></div>
      `);
      expectNativeEl(fixture).toHaveCSS({'display': 'block'}, styler);
    });

    it('should find to "display" for inline style <div></div>', () => {
      componentWithTemplate(`
        <div style="display: flex;"></div>
      `);
      expectNativeEl(fixture).toHaveCSS({'display': 'flex'}, styler);
    });

    // TODO the following two are failing because styler can't find external styles
    it('should find `display` from html style element', () => {
      componentWithTemplate(`
        <style>
          div.special { display: inline-block; }
        </style>
        <div class="special"></div>
      `);
      expectNativeEl(fixture).toHaveCSS({'display': 'inline-block'}, styler);
    });

    it('should find `display` from component styles', () => {
      componentWithTemplate(`<div class="extra"></div>`, ['div.extra { display:table; }']);
      expectNativeEl(fixture).toHaveCSS({'display': 'table'}, styler);
    });
  });
});


// *****************************************************************
// Template Component
// *****************************************************************

@Component({
  selector: 'test-style-utils',
  template: `<span>PlaceHolder Template HTML</span>`
})
class TestLayoutComponent {
}
