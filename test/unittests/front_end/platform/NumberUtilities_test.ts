// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {NumberUtilities} from '../../../../front_end/platform/platform.js';

const {assert} = chai;

describe('NumberUtilities', () => {
  describe('clamp', () => {
    it('takes the lower bound if the number is smaller', () => {
      assert.strictEqual(5, NumberUtilities.clamp(1, 5, 10));
    });

    it('takes the upper bound if the number is larger', () => {
      assert.strictEqual(10, NumberUtilities.clamp(20, 5, 10));
    });

    it('returns the original number if it is in bounds', () => {
      assert.strictEqual(7, NumberUtilities.clamp(7, 5, 10));
    });
  });

  describe('mod', () => {
    it('returns the remainder', () => {
      const result = NumberUtilities.mod(12, 5);
      assert.strictEqual(result, 2);
    });
  });
});
