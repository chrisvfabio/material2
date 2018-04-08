/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Throws an exception for the case when tap target trigger doesn't have a valid
 * mat-tap-target instance.
 * @docs-private
 */
export function throwMatTapTargetMissingError() {
  throw Error(`mat-tap-target-trigger: must pass in an mat-mat-tap-target instance.

    Example:
      <mat-tap-target #featAdd="matTapTarget"></mat-tap-target>
      <button [matTapTargetFor]="featAdd"></button>`);
}
