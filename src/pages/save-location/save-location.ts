import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { LocationService } from '../../shared/shared';

declare var google: any;

@Component({
  selector: 'page-save-location',
  templateUrl: 'save-location.html'
})
export class SaveLocationPage {
  location: any;
  acService: any;
  autocompleteItems: any;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private loadingController: LoadingController,
              private geolocation: Geolocation,
              private nativeGeocoder: NativeGeocoder,
              private locationService: LocationService) {
      this.location = {coords: {}};
  }

  ionViewWillEnter(){
    console.log('find location about to be called');
    this.acService = new google.maps.places.AutocompleteService();        
    this.autocompleteItems = [];

    let data = this.navParams.data;

    if (data.id){
      this.location = data;
    }

    console.log('location: ', this.location);

    if (!this.location.id){
        this.findLocation();
    }     
  }

  formattedAddress(address){
    let attrs = ['houseNumber', 'street', 'district', 'city', 'countryName', 'postalCode'];

    let formattedAddress = attrs.map(attr => {
      return (address[attr] || '');
    }).join(', ');

    return formattedAddress;
  }

  searchLocation(){   
    if (this.location.query == '') {
      this.autocompleteItems = [];
      return;
    }

    let self = this; 
    let config = { 
      //types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
      input: this.location.query, 
      componentRestrictions: {  } 
    };

    this.acService.getPlacePredictions(config, function (predictions, status) {
      console.log('modal > getPlacePredictions > status > ', status);
      self.autocompleteItems = [];            
      predictions.forEach(function (prediction) {              
        self.autocompleteItems.push(prediction);
      });
    });
  }

  chooseLocation(loc){
    console.log('location', loc);
    this.location.address = loc.description;
    this.autocompleteItems = [];
    this.location.query = '';
    this.findCoords();
  }

  findCoords(){
    this.nativeGeocoder.forwardGeocode(this.location.address)
      .then((coordinates: NativeGeocoderForwardResult) => {
        this.location.coords = coordinates;
        console.log('The coordinates are latitude=' + coordinates.latitude + ' and longitude=' + coordinates.longitude);
      })
      .catch((error: any) => console.log(error));

  }

  findLocation(){
    let loader = this.loadingController.create({
      content: 'Getting Your location...'
    });

    loader.present();
    console.log('find location');
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log('got response');
      console.log(resp.coords);
      this.location.coords = {latitude: resp.coords.latitude, longitude: resp.coords.longitude};
      this.nativeGeocoder.reverseGeocode(this.location.coords.latitude, this.location.coords.longitude)
        .then((result: NativeGeocoderReverseResult) => {
          this.location.address = this.formattedAddress(result);
          loader.dismiss();
        })
        .catch((error: any) => {
          this.location.address = ''; 
          loader.dismiss();
        });

    }).catch((error) => {
      loader.dismiss();
      this.location = {};
      console.log('Error getting location', error);
    });

  }

  saveLocation(){
    if (this.location.id){
        this.locationService.updateLocation(this.location);
    } else {
        this.locationService.setLocation(this.location);
    }
    this.navCtrl.popToRoot();
  }
}