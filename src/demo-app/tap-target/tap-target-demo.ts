/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Component, ViewChild, OnInit } from '@angular/core';
import { MatTapTargetTrigger } from '@angular/material/tap-target';

@Component({
    moduleId: module.id,
    selector: 'tap-target-demo',
    templateUrl: 'tap-target-demo.html',
    styleUrls: ['tap-target-demo.css'],
})
export class TapTargetDemo implements OnInit {

    @ViewChild(MatTapTargetTrigger) trigger: MatTapTargetTrigger;

    ngOnInit() {

        setTimeout(() => {
            this.trigger.openTapTarget();
        }, 5000);

    }
}
