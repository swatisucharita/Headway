import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController, NavController, NavParams } from 'ionic-angular';
import { LocationService, SmsService } from '../../shared/shared';
import { Contacts, ContactFindOptions } from '@ionic-native/contacts';
import { CallNumber } from '@ionic-native/call-number';

declare var navigator: any;
@Component({
    selector: 'page-manage-contact',
    templateUrl: 'manage-contact.html'
})
export class ManageContactPage {
    location: any;
    contact: any;
    autocompleteItems: any;

    constructor(private nav: NavController,
                private loadingController: LoadingController,
                private locationService: LocationService,
                private smsService: SmsService,
                private callNumber: CallNumber,
                private domSanitizer: DomSanitizer,
                private navParams: NavParams){
        this.location = this.navParams.data;
        this.autocompleteItems = [];
        this.contact = this.location.contact || {};
        this.onSuccess = this.onSuccess.bind(this);
        this.onError = this.onError.bind(this);
    }

    ionViewWillEnter(){
        this.location.contactQuery = '';
    }

    onSuccess(contacts){
        console.log('Found ' + contacts.length + ' contacts.');
        console.log(contacts);
        this.autocompleteItems = contacts;
    }

    onError(contactError){
        console.log('error:', contactError);
    }

    searchContact(){
        // find all contacts with 'Bob' in any name field
        let options      = new ContactFindOptions();
        options.filter   = this.location.contactQuery;
        options.multiple = true;
        options.hasPhoneNumber = true;
        var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
        navigator.contacts.find(fields, this.onSuccess, this.onError, options);
        //this.contacts.find({filter: this.location.contact, ContactFieldType:  [ 'displayName']}).then()
    }

    chooseContact(contact){
        let loader = this.loadingController.create({
            content: 'Adding contact...'
        });

        this.location.contact = contact;
        this.contact = contact;
        loader.present();
        this.locationService.updateLocation(this.location);
        this.autocompleteItems = [];
        this.location.contactQuery = '';
        loader.dismiss();
        let message = 'Hi,\
            I am using Headway app. Please install it and help me navigate to ' + this.location.address + '.'
        this.smsService.inviteContact(this.contact, message);
    }

    notifyNavigator(){
        let message = 'Hi ' + this.contact.displayName  +',\
         Please help me navigate to ' + this.location.address + '.'
        
        this.smsService.notifyContact(this.contact, message);       
    }

    callContact(phoneNumber){
        if (!phoneNumber){
            return false;
        }
        
        this.callNumber.callNumber(phoneNumber, true)
            .then(() => console.log('Launched dialer!'))
            .catch(() => console.log('Error launching dialer'));

    }
}