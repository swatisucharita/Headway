import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { HomePage } from '../pages';
import {UserService} from '../../shared/shared';

@Component({
    selector: 'page-registration',
    templateUrl: 'register-page.html'
})
export class RegistrationPage {
    user: any;
    constructor(private events: Events,
                private nav: NavController,
                private userService: UserService){

        this.user = {};
    }

    registerUser(){
        debugger;
        this.userService.register(this.user);
    }

    login(){
        this.nav.push(HomePage);
    }
}