import { Component, ViewChild, ElementRef } from '@angular/core';
import { LoadingController, NavController, NavParams, ModalController  } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DomSanitizer } from '@angular/platform-browser';
import { LocationService, SmsService } from '../../shared/shared';
import { SaveLocationPage, ManageContactPage, InstructionsModalPage } from '../pages';
import { CallNumber } from '@ionic-native/call-number';
import { TextToSpeech } from '@ionic-native/text-to-speech';

declare var window: any;
declare var google: any;

@Component({
  selector: 'page-location',
  templateUrl: 'location-page.html'
})

export class LocationPage {

    @ViewChild('map') mapElement: ElementRef;
    location: any
    map: any;
    contactPhoto: any;
    instructions: any;
    notificationCount: any;
    openInstructionsPopup: boolean;
    travelMode = '';
    distance = '';
    duration = '';
    currentInstructionIndex: number;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

    constructor(private nav: NavController,
                private navParams: NavParams,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private geolocation: Geolocation,
                private domSanitizer: DomSanitizer,
                private smsService: SmsService,
                private callNumber: CallNumber,
                private tts: TextToSpeech,
                private locationService: LocationService){

        this.location = this.navParams.data;
        this.openInstructionsPopup = false;
        this.resetCounts();
        
        if (this.hasContactPhoto()){
            this.contactPhoto = this.location.contact.photos[0].value;
        }
    }

    resetCounts(){
        this.currentInstructionIndex = 0;
        this.notificationCount = {};
        this.instructions = [];
    }

    ionViewWillEnter(){
        console.log('Location: ', this.location);
        this.initMap();
    }

    initMap() {
        let latLng = new google.maps.LatLng(this.location.coords.latitude, this.location.coords.longitude);
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 15,
            center: latLng
        });

        new google.maps.Marker({
            position: latLng,
            map: this.map,
            title: this.location.address || ''
        });

        //this.directionsDisplay.setMap(this.map);    
    }

  getDestination() {
    return ((this.location.coords.latitude && this.location.coords.longitude) ? 
        {lat: Number(this.location.coords.latitude), lng: Number(this.location.coords.longitude)} : 
        this.location.address);
  }

  hasContact(){
      return (this.location.contact && this.location.contact.id);
  }

  hasContactPhoto(){
      if (!this.hasContact()){
          return false;
      }

      return !!this.location.contact.photos;
  }

  bumpInstructionsIndex(){
      this.currentInstructionIndex = this.currentInstructionIndex + 1;
      
      if (this.instructions.length > 0) {
        let currentInstruction = this.instructions[this.currentInstructionIndex];
        let target = new google.maps.LatLng(currentInstruction.latitude, currentInstruction.longitude);
        let distance = currentInstruction.distanceInMeter;
        this.watchCurrentPosition(target, distance);

        this.notifyUser(currentInstruction)
      }    
  }

  watchCurrentPosition(target, targetDistance){
    let marker: any;
    let watch = this.geolocation.watchPosition();
    let  image = '';
    if (this.travelMode === 'DRIVING') {
        image = 'assets/images/car.png'
    } else if (this.travelMode === 'WALKING') {
        image = 'assets/images/one-man-walking.png';
    } else {
        image = 'assets/images/bus.png';
    }
    watch.subscribe((data) => {
       let latLng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
       if (!marker){
            marker = new google.maps.Marker({
                    position: latLng,
                    map: this.map,
                    icon: 'assets/images/one-man-walking.png',
                    title: ''
            });
       } else {
           marker.setPosition(latLng);
           //marker.setPosition(new google.maps.LatLng(this.location.coords.latitude, this.location.coords.longitude));
       }
       
       let distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, target);
       console.log('distance is: ', distance);
       if (150 < Math.round(distance) && Math.round(distance) < 250){
           this.notifyUser({distance: `${Math.round(distance)} m`, followNext: true});
       }

       if (0 <= Math.round(distance) && Math.round(distance) < 5){
           this.bumpInstructionsIndex();
       }
    });

    return watch;
  }

  notifyUser(instruction){
      this.notificationCount[this.currentInstructionIndex] = this.notificationCount[this.currentInstructionIndex] || 0;
      
      if(this.notificationCount[this.currentInstructionIndex] > 2){
        return false;
      }
      
      let direction = '';
      if (instruction.followNext){
        let nextInstruction = this.instructions[this.currentInstructionIndex + 1] || '';
        direction = nextInstruction.instruction.match(/.*?(?=\<div)/) ? nextInstruction.instruction.match(/.*?(?=\<div)/)[0] : nextInstruction.instruction;
        if (direction){
            direction = direction.replace(/<\/?b>/g, '');
            direction = 'after ' + instruction.distance + ' ' + direction;
        }      
      } else {
        direction = instruction.instruction.match(/.*?(?=\<div)/) ? instruction.instruction.match(/.*?(?=\<div)/)[0] : instruction.instruction;
        if (direction){
            direction = direction.replace(/<\/?b>/g, '');
            direction = direction + ' and continue for ' + instruction.distance;
        }
      }
    
      this.tts.speak(direction)
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log('Could not speak: ', reason));
      
      this.notificationCount[this.currentInstructionIndex] = this.notificationCount[this.currentInstructionIndex] + 1;
  }

  getShortestRoute(routes){
      let shortestDistance = routes[0].legs[0].distance.value;
      let shortestRouteIndex = 0;
      routes.forEach((route, index) => {
          if (route.legs[0].distance.value < shortestDistance){
              shortestDistance = route.legs[0].distance.value;
              shortestRouteIndex = index;
          }
      });

      return shortestRouteIndex;
  }

  renderRoutes(response){
    let renderedRoutes = [];
    let preferredRouteIndex = this.getShortestRoute(response.routes);
    let preferredRoute = response.routes[preferredRouteIndex];
    response.routes.forEach((route, index) => {
        if (index === preferredRouteIndex){ return; }

        renderedRoutes.push(new google.maps.DirectionsRenderer({
            directions: response,
            routeIndex: index,
            map: this.map,
            polylineOptions: {
                strokeColor: 'gray',
                strokeOpacity: 0.6,
                strokeWeight: 5
            }
        }));
    });

    renderedRoutes.push(new google.maps.DirectionsRenderer({
        directions: response,
        routeIndex: preferredRouteIndex,
        map: this.map,
        polylineOptions: {
            strokeColor: '#2b6DA8',
            strokeOpacity: 1.0,
            strokeWeight: 5
        }
    }));

    renderedRoutes.forEach(route => {
         google.maps.event.addListener(route,'click', function(evt) {
            console.log('clicked on route: ', evt);
        })
    })
                    
    this.distance = preferredRoute.legs[0].distance.text;
    this.duration = preferredRoute.legs[0].duration.text;

    this.instructions = preferredRoute.legs[0].steps.map(step => {
        let path = step.path[step.path.length - 1];
        let latitude = path.lat();
        let longitude = path.lng();

        return {
            instruction: step.instructions, 
            distance: step.distance.text,
            distanceInMeter: step.distance.value,
            latitude: latitude,
            longitude: longitude
        };
    });
  }

  calculateAndDisplayRoute(travelMode, currentPosition ='') {
      let loader = this.loadingController.create({
          content: 'Collecting your route...'
      });

      loader.present();
      this.travelMode = travelMode || this.travelMode || 'DRIVING';

      this.geolocation.getCurrentPosition().then((resp) => {
            let currentPosition = {lat: Number(resp.coords.latitude), lng: Number(resp.coords.longitude)};
            this.directionsService.route({
                origin: currentPosition,
                destination: this.getDestination(),
                travelMode: this.travelMode,
                provideRouteAlternatives: true
            }, (response, status) => {
                if (status === 'OK') {
                    console.log('Response: ', response);
                    this.renderRoutes(response);
                    this.startNavigation();
                    loader.dismiss();
                } else {
                    loader.dismiss();
                    window.alert('Directions request failed due to ' + status);
                }
            });

        }).catch((error) => {
            loader.dismiss();
            console.log('Error getting location', error);
        });    
  }

  getDirections(mode) {
    this.resetCounts();
    this.calculateAndDisplayRoute(mode);
  }

  showInstructions(){
      this.openInstructionsPopup =true;
      let modal = this.modalController.create(InstructionsModalPage, {instructions: this.instructions});
      modal.present();
  }

  startNavigation(){
      if (this.instructions.length > 0) {
        let currentInstruction = this.instructions[this.currentInstructionIndex];
        let target = new google.maps.LatLng(currentInstruction.latitude, currentInstruction.longitude);
        let distance = currentInstruction.distanceInMeter;
        this.watchCurrentPosition(target, distance);

        this.notifyUser(currentInstruction)
      }      
  }

  manageContact(){
      this.nav.push(ManageContactPage, this.location);
  }

  goHome(){
    this.nav.popToRoot();
  }

  textContact(){
      if (!this.hasContact()){
          return false;
      }

      let contact = this.location.contact;
      let message = 'Hi ' + contact.displayName  +',\
         Please help me navigate to ' + this.location.address + '.'

      return this.smsService.notifyContact(contact, message);
  }

  callContact(){
       if (!this.hasContact()){
          return false;
      }

      let phoneNumber = this.location.contact.phoneNumbers[0].value;
        
      this.callNumber.callNumber(phoneNumber, true)
        .then(() => console.log('Launched dialer!'))
        .catch(() => console.log('Error launching dialer'));

}

  editLocation(){
    this.nav.push(SaveLocationPage, this.location);
  }

  removeLocation(){
    this.locationService.removeLocation(this.location.id).then(() => {
        this.nav.pop();
    });
  }
}

