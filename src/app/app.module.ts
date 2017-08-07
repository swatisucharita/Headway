import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AgmCoreModule } from 'angular2-google-maps/core';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { Contacts } from '@ionic-native/contacts';
import { SMS } from '@ionic-native/sms';
import {CallNumber } from '@ionic-native/call-number';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import {UniqueDeviceID} from '@ionic-native/unique-device-id';
import {HttpModule} from '@angular/http';

import { MyApp } from './app.component';
import { HomePage, RegistrationPage, SaveLocationPage, LocationPage, ManageLocationPage, ManageContactPage, InstructionsModalPage} from '../pages/pages';
import {LocationService, SmsService, UserService} from '../shared/shared';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    RegistrationPage,
    SaveLocationPage,
    LocationPage,
    ManageLocationPage,
    ManageContactPage,
    InstructionsModalPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AgmCoreModule.forRoot({ 
      apiKey: 'AIzaSyALLyWzPunrDH7Et3JfICd04Tx-SHQM4-k',
      libraries: ["places"] 
    }),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    RegistrationPage,
    SaveLocationPage,
    LocationPage,
    ManageLocationPage,
    ManageContactPage,
    InstructionsModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeGeocoder,
    LocationService,
    SmsService,
    UserService,
    Contacts,
    CallNumber,
    SMS,
    TextToSpeech,
    UniqueDeviceID,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
