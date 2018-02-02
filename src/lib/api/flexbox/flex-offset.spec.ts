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

import {DEFAULT_BREAKPOINTS_PROVIDER} from '../../media-query/breakpoints/break-points-provider';
import {BreakPointRegistry} from '../../media-query/breakpoints/break-point-registry';
import {MockMatchMedia} from '../../media-query/mock/mock-match-media';
import {MatchMedia} from '../../media-query/match-media';
import {FlexLayoutModule} from '../../module';

import {customMatchers} from '../../utils/testing/custom-matchers';

import {
  makeCreateTestComponent,
  queryFor,
  expectEl,
  expectNativeEl,
} from '../../utils/testing/helpers';
import {Platform, PlatformModule} from '@angular/cdk/platform';
import {StyleService} from '../../utils/styling/styler';

describe('flex-offset directive', () => {
  let fixture: ComponentFixture<any>;
  let styler: StyleService;
  let platform: Platform;
  let componentWithTemplate = (template: string) => {
    fixture = makeCreateTestComponent(() => TestFlexComponent)(template);

    inject([StyleService, Platform], (_styler: StyleService, _platform: Platform) => {
      styler = _styler;
      platform = _platform;
    })();
  };

  beforeEach(() => {
    jasmine.addMatchers(customMatchers);

    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      imports: [CommonModule, FlexLayoutModule, PlatformModule],
      declarations: [TestFlexComponent],
      providers: [
        BreakPointRegistry, DEFAULT_BREAKPOINTS_PROVIDER,
        {provide: MatchMedia, useClass: MockMatchMedia},
        StyleService,
      ]
    });
  });

  describe('with static features', () => {

    it('should add correct styles for default `fxFlexOffset` usage', () => {
      componentWithTemplate(`<div fxFlexOffset='32px' fxFlex></div>`);
      fixture.detectChanges();

      let dom = fixture.debugElement.children[0];
      expectEl(dom).toHaveStyle({'margin-left': '32px'}, styler);
      if (platform.BLINK) {
        expectEl(dom).toHaveStyle({'flex': '1 1 1e-09px'}, styler);
      } else if (platform.FIREFOX) {
        expectEl(dom).toHaveStyle({'flex': '1 1 1e-9px'}, styler);
      } else if (platform.EDGE) {
        expectEl(dom).toHaveStyle({'flex': '1 1 0px'}, styler);
      } else {
        expectEl(dom).toHaveStyle({'flex': '1 1 0.000000001px'}, styler);
      }
    });


    it('should work with percentage values', () => {
      componentWithTemplate(`<div fxFlexOffset='17' fxFlex='37'></div>`);
      expectNativeEl(fixture).toHaveStyle({
        'flex': '1 1 100%',
        'box-sizing': 'border-box',
        'margin-left': '17%'
      }, styler);
    });

    it('should work fxLayout parents', () => {
      componentWithTemplate(`
        <div fxLayout='column' class='test'>
          <div fxFlex='30px' fxFlexOffset='17px'>  </div>
        </div>
      `);
      fixture.detectChanges();
      let parent = queryFor(fixture, '.test')[0];
      let element = queryFor(fixture, '[fxFlex]')[0];

      // parent flex-direction found with 'column' with child height styles
      expectEl(parent).toHaveStyle({'flex-direction': 'column', 'display': 'flex'}, styler);
      expectEl(element).toHaveStyle({'margin-top': '17px'}, styler);
    });

    it('should CSS stylesheet and not inject flex-direction on parent', () => {
      componentWithTemplate(`
        <style>
          .test { flex-direction:column; display: flex; }
        </style>
        <div class='test'>
          <div fxFlexOffset='41px' fxFlex='30px'></div>
        </div>
      `);

      fixture.detectChanges();
      let parent = queryFor(fixture, '.test')[0];
      let element = queryFor(fixture, '[fxFlex]')[0];

      // parent flex-direction found with 'column' with child height styles
      expectEl(parent).toHaveStyle({'flex-direction': 'column', 'display': 'flex'}, styler);
      expectEl(element).toHaveStyle({'margin-top': '41px'}, styler);
    });

    it('should work with styled-parent flex directions', () => {
      componentWithTemplate(`
        <div fxLayout='row'>
          <div style='flex-direction:column' class='parent'>
            <div fxFlex='60px' fxFlexOffset='21'>  </div>
          </div>
        </div>
      `);
      fixture.detectChanges();
      let element = queryFor(fixture, '[fxFlex]')[0];
      let parent = queryFor(fixture, '.parent')[0];

      // parent flex-direction found with 'column'; set child with height styles
      expectEl(element).toHaveStyle({'margin-top': '21%'}, styler);
      expectEl(parent).toHaveStyle({'flex-direction': 'column'}, styler);
    });

    it('should ignore fxLayout settings on same element', () => {
      componentWithTemplate(`
          <div fxLayout='column' fxFlex='37%' fxFlexOffset='52px' >
          </div>
        `);
      expectNativeEl(fixture).not.toHaveStyle({
        'flex-direction': 'row',
        'flex': '1 1 100%',
        'margin-left': '52px',
      }, styler);
    });

  });

});


// *****************************************************************
// Template Component
// *****************************************************************

@Component({
  selector: 'test-component-shell',
  template: `<span>PlaceHolder Template HTML</span>`
})
class TestFlexComponent {
  direction = 'column';
}


