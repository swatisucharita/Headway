import { Component, ViewChild } from '@angular/core';
import { LoadingController, Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LocationService, UserService } from '../shared/shared';
import {HomePage, LocationPage, ManageLocationPage} from '../pages/pages';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;
  locations: any;

  constructor(public platform: Platform, 
              public statusBar: StatusBar, 
              public splashScreen: SplashScreen, 
              public events: Events,
              public loadingController: LoadingController,
              public userService: UserService,
              public locationService: LocationService) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [];
    this.locations = [];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.fetchLocations();

      this.events.subscribe('locations:changed', () => this.fetchLocations());

       // Enable to debug issues.
       // window["plugins"].OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
  
      var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };

      window["plugins"].OneSignal
        .startInit("3d2f1378-58e9-4ec5-a184-133ab1924ed4", "17385465587")
        .handleNotificationOpened(notificationOpenedCallback)
        .endInit();
        
    });
  }

  fetchLocations(){
    let loader = this.loadingController.create({
      content: 'fetching locations...'
    });

    loader.present();
    this.locationService.getAllLocations().then(data => {
        this.locations = data;
        loader.dismiss();
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      });   
  }

  getLocation(location) {
    this.nav.push(LocationPage, location)
  }

  goToSettings(){
    this.nav.push(ManageLocationPage);
  }

  logout(){
    this.userService.logout();
    this.nav.push(HomePage);
  }
}
