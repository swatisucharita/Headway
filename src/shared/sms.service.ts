import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SMS } from '@ionic-native/sms';

@Injectable()
export class SmsService {
    invitedContacts: any;

    constructor(private sms: SMS,
                private storage: Storage,
                private events: Events){
        this.invitedContacts = [];
    }

    ionViewWillEnter(){
        this.storage.get('invitedContactIds').then((data) => {
            this.invitedContacts = data ? JSON.parse(data) : [];
        })
    }

    hasPermission(){
        return this.sms.hasPermission();
    }

    sendSms(phoneNumber, message){
        //CONFIGURATION
        let options = {
            replaceLineBreaks: true, // true to replace \n by a new line, false by default
            android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
                //intent: '' // send SMS without open any other app
            }
        };

        this.sms.send(phoneNumber, message, options).then(() => {
            console.log('successfully sent message');
        }, (error) => {
            console.log('Failed to send message: ', error);
        });
    }

    inviteContact(contact, message){
        if (this.invitedContacts.includes(contact.id)){
            return false;
        } else {
            this.invitedContacts.push(contact.id);
            this.storage.set('invitedContacts', JSON.stringify(this.invitedContacts));
        }

        this.hasPermission().then(() => {
            let phoneNumber = contact.phoneNumbers[0].value;
            if (phoneNumber && message){
                this.sendSms(phoneNumber, message);
            }
        }, () => {
            window.alert('Please allow the app to send message');
        }); 
    }

    notifyContact(contact, message){
        return this.hasPermission().then(() => {
            let phoneNumber = contact.phoneNumbers[0].value;
            if (phoneNumber && message){
                this.sendSms(phoneNumber, message);
            }
        }, () => {
            window.alert('Please allow the app to send message');
        }); 
    }
}