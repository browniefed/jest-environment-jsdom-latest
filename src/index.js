/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * @flow
 */

import type {Script} from 'vm';
import type {ProjectConfig} from 'types/Config';
import type {Global} from 'types/Global';
import type {ModuleMocker} from 'jest-mock';

import {FakeTimers, installCommonGlobals} from 'jest-util';
import mock from 'jest-mock';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;

class JSDOMEnvironment {
  document: ?Object;
  fakeTimers: ?FakeTimers;
  global: ?Global;
  moduleMocker: ?ModuleMocker;

  constructor(config: ProjectConfig): void {
    // lazy require
    // this.document = JSDom.jsdom(/* markup */ undefined, {
    //   url: config.testURL,
    // });
    // const global = (this.global = this.document.defaultView);
    // Node's error-message stack size is limited at 10, but it's pretty useful
    // to see more than that when a test fails.
    // this.global.Error.stackTraceLimit = 100;

    /* UPDATE start */
    this.dom = new JSDOM(``, {
      url: config.testURL,
      runScripts: "outside-only"
    });
    this.document = this.dom.window.document;

    const global = this.global = this.dom.window;
    /* UPDATE end */

    installCommonGlobals(global, config.globals);

    this.moduleMocker = new mock.ModuleMocker(global);
    this.fakeTimers = new FakeTimers(global, this.moduleMocker, config);
  }

  dispose(): void {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    if (this.global) {
      this.global.close();
    }
    this.global = null;
    this.document = null;
    this.fakeTimers = null;
  }

  runScript(script: Script): ?any {
    /* UPDATE start */
    if (this.global) {
      return this.dom.runVMScript(script);
    }
    /* UPDATE end */
    return null;
  }
}

module.exports = JSDOMEnvironment;
