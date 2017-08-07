import { Component } from '@angular/core';
import { NavParams, ViewController  } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'modal-instructions',
  templateUrl: 'instructions-modal.html'
})
export class InstructionsModalPage {
    instructions: any;

    constructor(private navParams: NavParams,
                private domSanitizer: DomSanitizer,
                private viewController: ViewController){
        this.instructions = navParams.data.instructions || [];
    }

    dismiss(){
        this.viewController.dismiss();
    }

}