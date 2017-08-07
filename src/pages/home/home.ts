import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import {SaveLocationPage, RegistrationPage} from '../pages';

import {UserService} from '../../shared/shared';

declare var window: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  location: any;
  user: any;
  loginErrors: any;

  constructor(
    private navCtrl: NavController, 
    private userService: UserService,
    private events: Events) {
    this.location = {
      lat: 17.4372693,
      lng: 78.3824058
    }

    this.user = {};
    this.loginErrors = {};
    this.getUser();
    this.events.subscribe('user:changed', () => this.getUser());
  }

  getUser(){
    this.userService.getUser().then((user) => {
      this.user = user;
      console.log('Logged in User: ', user);
    }, (error) => {
      console.log('Logged in user error: ', error);
    });
  }

  findLocation(){
    this.navCtrl.push(SaveLocationPage);
  }

  loginUser(){
    // reset login errors
    this.loginErrors = {};

    // validate fields
    !this.user.phoneNumber && (this.loginErrors['phoneNumber'] = 'required');
    !this.user.password && (this.loginErrors['password'] = 'required');

    if (Object.keys(this.loginErrors).some((k, i ,a) => { return this.loginErrors[k]; })){
      return false;
    }

    this.userService.login(this.user);
  }

  forgotPassword(){
    console.log('redirect to forgot password');
  }

  signUp(){
    console.log('redirect to sign up page');
    this.navCtrl.push(RegistrationPage);
  }
}
