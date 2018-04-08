/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule } from '@angular/core';
import { MatTapTarget } from './tap-target';
import { MatCommonModule } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatTapTargetTrigger } from './tap-target-trigger';

@NgModule({
    imports: [MatCommonModule, OverlayModule],
    exports: [
        MatTapTarget,
        MatTapTargetTrigger,
        MatCommonModule
    ],
    declarations: [
        MatTapTarget,
        MatTapTargetTrigger
    ],
})
export class MatTapTargetModule { }
