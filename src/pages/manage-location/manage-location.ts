import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import { LocationService, UserService } from '../../shared/shared';
import { LocationPage } from '../pages';

@Component({
  selector: 'page-manage-locations',
  templateUrl: 'manage-location.html'
})
export class ManageLocationPage {
    locations: any;
    user: any;

    constructor(private loadingController: LoadingController,
                private nav: NavController,
                private userService: UserService,
                private locationService: LocationService){
        this.locations = [];
        this.user = {};

        this.loadLocations();
        this.loadUser();
    }

    loadUser(){
        let loader = this.loadingController.create({
            content: 'Fetching user settings...'
        });
        loader.present();

        this.userService.getUser().then((data) => {
            this.user = data;
            loader.dismiss();
        }, (error) => {
            this.user = {};
            loader.dismiss();
            console.log('Failed fetching user details: ', error);
        })
    }

    loadLocations(){
        let loader = this.loadingController.create({
            content: 'Fetching your locations...'
        });

        loader.present();
        this.locationService.getAllLocations().then(data => {
            this.locations = data;
            loader.dismiss();
        }, error => {
            loader.dismiss();
            console.log('failed to fetch locations', error);
        })
    }

    hasCoords(location){
        return !!(location.coords && (location.coords.latitude && location.coords.longitude));
    }

    locationTapped(event, location){
        this.nav.push(LocationPage, location);
    }

    settingToggled(setting){
        this.userService.updateUser(this.user);
    }
}